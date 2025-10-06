

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  claims jsonb;
begin
  claims := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
  return coalesce((claims->'app_metadata'->>'is_admin')::boolean, false);
end;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_blocked_spans"("p_product" "uuid") RETURNS TABLE("start_date" "date", "end_date" "date")
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select oi.start_date, oi.end_date
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.product_id = p_product
    and oi.start_date is not null and oi.end_date is not null
    and coalesce(lower(o.status),'') not in ('cancelled','canceled','failed','refunded')
  order by oi.start_date asc;
$$;


ALTER FUNCTION "public"."product_blocked_spans"("p_product" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_daily_remaining"("p_product" "uuid", "p_from" "date", "p_to" "date") RETURNS TABLE("d" "date", "remaining" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
with days as (
  select generate_series(p_from, p_to, interval '1 day')::date as d
),
per_day_bookings as (
  -- Calcule "unités par jour" pour chaque order_item (corrige le *days* stocké)
  select
    oi.product_id,
    o.start_date,
    o.end_date,
    -- nb jours "inclusifs" (>=1)
    greatest(1, (o.end_date - o.start_date + 1))::int as days_count,
    ceil(oi.quantity::numeric / greatest(1, (o.end_date - o.start_date + 1)))::int as units_per_day
  from public.order_items oi
  join public.orders o on o.id = oi.order_id
  where oi.product_id = p_product
    and o.status in ('paid', 'confirmed') -- adapte si d'autres statuts valides
),
booked_on_day as (
  -- Somme des unités par jour pour chaque jour couvert par la commande
  select
    d.d,
    coalesce(sum(p.units_per_day) filter (
      where d.d between p.start_date and p.end_date
    ), 0)::int as booked_units
  from days d
  left join per_day_bookings p
    on d.d between p.start_date and p.end_date
  group by d.d
)
select
  d.d,
  greatest(0, p.stock - b.booked_units)::int as remaining
from days d
cross join (select stock from public.products where id = p_product) p
left join booked_on_day b on b.d = d.d
order by d.d;
$$;


ALTER FUNCTION "public"."product_daily_remaining"("p_product" "uuid", "p_from" "date", "p_to" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_is_available"("p_product" "uuid", "p_start" "date", "p_end" "date") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select coalesce(min(x.remaining), 0) > 0
  from public.product_daily_remaining(p_product, p_start, p_end) x;
$$;


ALTER FUNCTION "public"."product_is_available"("p_product" "uuid", "p_start" "date", "p_end" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."product_remaining_capacity"("p_product" "uuid", "p_start" "date", "p_end" "date") RETURNS integer
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  with params as (
    select p_start::date as s, p_end::date as e
  ),
  dts as (  -- chaque jour de la demande
    select generate_series(s, e, interval '1 day')::date d
    from params
  ),
  busy_days as ( -- unités déjà engagées par jour (via ORDERS)
    select d.d,
           coalesce(sum(coalesce(oi.quantity,1)),0)::int as reserved
    from dts d
    join public.order_items oi
      on oi.product_id = p_product
    join public.orders o
      on o.id = oi.order_id
     and coalesce(lower(o.status),'') not in ('cancelled','canceled','failed','refunded')
     and d.d between o.start_date and o.end_date       -- inclusif
    group by d.d
  ),
  max_busy as (
    select coalesce(max(reserved), 0) as mx from busy_days
  )
  select (p.stock - mb.mx)
  from public.products p
  cross join max_busy mb
  where p.id = p_product;
$$;


ALTER FUNCTION "public"."product_remaining_capacity"("p_product" "uuid", "p_start" "date", "p_end" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."products_available"("p_start" "date", "p_end" "date") RETURNS TABLE("id" "uuid", "created_at" timestamp with time zone, "name" "text", "description" "text", "price" numeric, "category" "text", "image_url" "text", "image_path" "text", "stock" integer, "remaining_capacity" integer)
    LANGUAGE "sql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select
    p.id,
    p.created_at,
    p.name,
    p.description,
    p.price,
    p.category,
    p.image_url,
    p.image_path,
    p.stock,
    public.product_remaining_capacity(p.id, p_start, p_end) as remaining_capacity
  from public.products p
  where not exists (
    select 1
    from public.product_daily_remaining(p.id, p_start, p_end) dr
    where dr.remaining <= 0
  )
  order by p.created_at desc;
$$;


ALTER FUNCTION "public"."products_available"("p_start" "date", "p_end" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin 
  new.updated_at = now(); 
  return new; 
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "start_date" "date",
    "end_date" "date",
    CONSTRAINT "cart_dates_valid" CHECK (((("start_date" IS NULL) AND ("end_date" IS NULL)) OR ("start_date" <= "end_date"))),
    CONSTRAINT "cart_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contact_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "subject" "text",
    "message" "text" NOT NULL,
    "consent" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."contact_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."films" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "director" "text",
    "category" "text",
    "synopsis" "text",
    "year" integer,
    "runtime_min" integer,
    "status" "text" DEFAULT 'finished'::"text",
    "poster_url" "text",
    "poster_path" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "films_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'released'::"text", 'archived'::"text", 'published'::"text"])))
);


ALTER TABLE "public"."films" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" bigint NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "name" "text" NOT NULL,
    "unit_price_cents" integer NOT NULL,
    "quantity" integer NOT NULL,
    "start_date" "date",
    "end_date" "date",
    CONSTRAINT "order_item_dates_valid" CHECK (((("start_date" IS NULL) AND ("end_date" IS NULL)) OR ("start_date" <= "end_date")))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."order_items_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."order_items_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."order_items_id_seq" OWNED BY "public"."order_items"."id";



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_id" "text",
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "delivery" "text" NOT NULL,
    "address" "jsonb",
    "payment_method" "text",
    "total_amount_cents" integer NOT NULL,
    "status" "text" DEFAULT 'paid'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "customer_email" "text",
    "customer_first_name" "text",
    "customer_last_name" "text",
    "customer_phone" "text",
    "merchant_reference" "text",
    "payment_id" "text",
    CONSTRAINT "orders_delivery_check" CHECK (("delivery" = ANY (ARRAY['pickup'::"text", 'delivery'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_events" (
    "id" bigint NOT NULL,
    "source" "text",
    "event_type" "text",
    "payment_id" "text",
    "merchant_reference" "text",
    "payload" "jsonb",
    "raw_signature" "text",
    "verified" boolean,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_events" OWNER TO "postgres";


ALTER TABLE "public"."payment_events" ALTER COLUMN "id" ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME "public"."payment_events_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "category" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "image_path" "text" NOT NULL,
    "stock" integer DEFAULT 1 NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "products_price_check" CHECK (("price" >= (0)::numeric)),
    CONSTRAINT "products_stock_positive" CHECK (("stock" >= 0))
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "phone" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profils" (
    "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "email" "text",
    "nom" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profils" OWNER TO "postgres";


ALTER TABLE ONLY "public"."order_items" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."order_items_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_product_id_key" UNIQUE ("user_id", "product_id");



ALTER TABLE ONLY "public"."contact_messages"
    ADD CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."films"
    ADD CONSTRAINT "films_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."films"
    ADD CONSTRAINT "films_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_item_no_overlap_per_product" EXCLUDE USING "gist" ("product_id" WITH =, "daterange"("start_date", "end_date", '[]'::"text") WITH &&) WHERE ((("start_date" IS NOT NULL) AND ("end_date" IS NOT NULL)));



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_session_id_key" UNIQUE ("session_id");



ALTER TABLE ONLY "public"."payment_events"
    ADD CONSTRAINT "payment_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profils"
    ADD CONSTRAINT "profils_pkey" PRIMARY KEY ("id");



CREATE INDEX "cart_items_product_dates_idx" ON "public"."cart_items" USING "btree" ("product_id", "start_date", "end_date");



CREATE INDEX "cart_items_user_idx" ON "public"."cart_items" USING "btree" ("user_id");



CREATE UNIQUE INDEX "cart_items_user_prod_dates_key" ON "public"."cart_items" USING "btree" ("user_id", "product_id", "start_date", "end_date") WHERE (("start_date" IS NOT NULL) AND ("end_date" IS NOT NULL));



CREATE INDEX "contact_messages_email_idx" ON "public"."contact_messages" USING "btree" ("email");



CREATE INDEX "idx_oi_product" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_order_items_dates" ON "public"."order_items" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_order_items_product" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_dates" ON "public"."orders" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "order_items_order_id_idx" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "orders_merchant_reference_idx" ON "public"."orders" USING "btree" ("merchant_reference");



CREATE UNIQUE INDEX "orders_merchant_reference_uq" ON "public"."orders" USING "btree" ("merchant_reference") WHERE ("merchant_reference" IS NOT NULL);



CREATE INDEX "orders_payment_id_idx" ON "public"."orders" USING "btree" ("payment_id");



CREATE INDEX "orders_session_id_idx" ON "public"."orders" USING "btree" ("session_id");



CREATE UNIQUE INDEX "orders_session_id_uq" ON "public"."orders" USING "btree" ("session_id") WHERE ("session_id" IS NOT NULL);



CREATE INDEX "orders_user_id_idx" ON "public"."orders" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "trg_cart_items_updated" BEFORE UPDATE ON "public"."cart_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Accès limité à soi-même" ON "public"."profils" USING (("auth"."uid"() = "id"));



CREATE POLICY "Public read products" ON "public"."products" FOR SELECT USING (true);



CREATE POLICY "cart delete own" ON "public"."cart_items" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "cart insert own" ON "public"."cart_items" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "cart read own" ON "public"."cart_items" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "cart update own" ON "public"."cart_items" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "events read all" ON "public"."payment_events" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."films" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "films_admin_write" ON "public"."films" USING ((("auth"."jwt"() ->> 'app_metadata'::"text") ~~ '%"is_admin":true%'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'app_metadata'::"text") ~~ '%"is_admin":true%'::"text"));



CREATE POLICY "films_read_all" ON "public"."films" FOR SELECT USING (true);



CREATE POLICY "items insert for own order" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."user_id" = "auth"."uid"())))));



CREATE POLICY "items read by owner" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_items insert own" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."user_id" = "auth"."uid"())))));



CREATE POLICY "order_items select own" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."user_id" = "auth"."uid"())))));



CREATE POLICY "order_items_delete_admin" ON "public"."order_items" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "order_items_select" ON "public"."order_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND (("o"."user_id" = "auth"."uid"()) OR "public"."is_admin"())))));



ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "orders insert own" ON "public"."orders" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "orders insert self" ON "public"."orders" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "orders read own" ON "public"."orders" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "orders select own" ON "public"."orders" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "orders update own" ON "public"."orders" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "orders_delete_admin" ON "public"."orders" FOR DELETE TO "authenticated" USING ("public"."is_admin"());



CREATE POLICY "orders_select" ON "public"."orders" FOR SELECT TO "authenticated" USING ((("user_id" = "auth"."uid"()) OR "public"."is_admin"()));



ALTER TABLE "public"."payment_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_select_own" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "profiles_upsert_own" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



ALTER TABLE "public"."profils" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."product_blocked_spans"("p_product" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."product_blocked_spans"("p_product" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_blocked_spans"("p_product" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."product_daily_remaining"("p_product" "uuid", "p_from" "date", "p_to" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."product_daily_remaining"("p_product" "uuid", "p_from" "date", "p_to" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_daily_remaining"("p_product" "uuid", "p_from" "date", "p_to" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."product_is_available"("p_product" "uuid", "p_start" "date", "p_end" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."product_is_available"("p_product" "uuid", "p_start" "date", "p_end" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_is_available"("p_product" "uuid", "p_start" "date", "p_end" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."product_remaining_capacity"("p_product" "uuid", "p_start" "date", "p_end" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."product_remaining_capacity"("p_product" "uuid", "p_start" "date", "p_end" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."product_remaining_capacity"("p_product" "uuid", "p_start" "date", "p_end" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."products_available"("p_start" "date", "p_end" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."products_available"("p_start" "date", "p_end" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."products_available"("p_start" "date", "p_end" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."contact_messages" TO "anon";
GRANT ALL ON TABLE "public"."contact_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_messages" TO "service_role";



GRANT ALL ON TABLE "public"."films" TO "anon";
GRANT ALL ON TABLE "public"."films" TO "authenticated";
GRANT ALL ON TABLE "public"."films" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."order_items_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payment_events" TO "anon";
GRANT ALL ON TABLE "public"."payment_events" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_events" TO "service_role";



GRANT ALL ON SEQUENCE "public"."payment_events_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."payment_events_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."payment_events_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."profils" TO "anon";
GRANT ALL ON TABLE "public"."profils" TO "authenticated";
GRANT ALL ON TABLE "public"."profils" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






RESET ALL;
