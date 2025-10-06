SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."products" ("id", "created_at", "name", "description", "price", "category", "image_url", "image_path", "stock", "tags") FROM stdin;
35c018dd-777f-44ce-99fe-e5db9ac2e85a	2025-09-12 22:56:51.072918+00	Batterie V-Lock BP95 – Haute capacité 95Wh pour caméras professionnelles	Spécifications : Type de batterie : Li-ion ; Suspense : 14,8 V ; Cellules : 6 cellules ; Capacité : 95 Wh/6 600 mAh ; La batterie est dotée du mécanisme de montage pratique en V pour un remplacement rapide de la batterie.\r\nCompatible : V-mount remplace la batterie d'origine BP-FLX75 BP-GL65A BP-GL65A et BP-GL95 BP-GL95A ainsi que Sony BP-190S BP-190WS BP -150WS BP BP BP-150WS 150WS. Peut également être utilisé avec Blackmagic URSA Mini Pro / Mini 4K (support de batterie URSA VLock), etc. Les caméscopes compatibles Sony sont répertoriés ci-dessous.\r\nVérifiez la batterie : un indicateur LED à 4 niveaux vous informe de l'état de charge. Important : Le bouton de contrôle de la batterie actif également le port USB. Connectez donc un troisième appareil et activez-le avec le bouton.	48.00	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757717810783_batterie_v-lock_bp95_haute_capacit_95wh_pour_cam_ras_professionnelles.jpg	products/uploads/1757717810783_batterie_v-lock_bp95_haute_capacit_95wh_pour_cam_ras_professionnelles.jpg	1	{Autonomie}
ad75077e-0043-45b5-b6a5-090e1c6fa8da	2025-09-12 23:04:51.969494+00	Batterie V-Lock Lupo 95 – 95Wh Li-ion compacte et fiable pour caméras vidéo	La batterie V-Lock Lupo 95 est une solution compacte et performante pour les professionnels de l’image. Avec sa capacité de 95Wh, elle offre une alimentation stable et durable pour vos caméras, panneaux LED et équipements vidéo. Conçue avec un design robuste et léger, elle s’installe facilement grâce à sa fixation V-Lock universelle, idéale pour les tournages en studio comme en extérieur.	40.00	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757718291700_batterie_v-lock_lupo_95_95wh_li-ion_compacte_et_fiable_pour_cam_ras_vid_o.jpg	products/uploads/1757718291700_batterie_v-lock_lupo_95_95wh_li-ion_compacte_et_fiable_pour_cam_ras_vid_o.jpg	1	{Leger,Robuste}
50715b09-a540-4afd-9c5c-3822691b2c80	2025-09-12 23:00:29.942527+00	Batterie V-Lock Core 98 – 98Wh Li-ion haute performance pour caméras pro	L' Hypercore NEO 9 Mini , dans une monture en V. Le Core SWX est une batterie lithium-ion compacte de 14,8 V, 98 Wh qui prend en charge un tirage constant de 12 A et un tirage maximal de 16 A.	35.00	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757718029731_batterie_v-lock_core_98_98wh_li-ion_haute_performance_pour_cam_ras_pro.jpg	products/uploads/1757718029731_batterie_v-lock_core_98_98wh_li-ion_haute_performance_pour_cam_ras_pro.jpg	0	{pourquoi}
ca1fc8b7-7742-42a8-95d9-0bf4cf752cd4	2025-09-12 22:18:33.497288+00	Batterie NP-F750 Neewer	Quatre batteries NP-F750 haute capacité de 5600 mAh fournissent une puissance de batterie suffisante pour votre caméscope,votre moniteur de terrain,votre anneau lumineux et votre lumière vidéo LED lors de prises de vue en extérieur\r\nLes batteries NP-F750 alimentent n'importe quel appareil avec une plaque de batterie NP-F,compatible avec les caméscopes et caméras vidéo Sony,les moniteurs de terrain NEEWER, les anneaux lumineux et les lampes vidéo LED.	30.00	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757715512612_batterie_np-f750_neewer.webp	products/uploads/1757715512612_batterie_np-f750_neewer.webp	1	{"Haute puissance","Large compatibilité"}
1f5b2dd6-4c5e-403a-b14a-21b29ddbd10f	2025-09-12 22:48:15.400012+00	Batterie Canon LP-E6 originale – Lithium-ion rechargeable	La batterie Canon LP-E6 est une batterie lithium-ion rechargeable fiable et performante, spécialement conçue pour de nombreux boîtiers Canon EOS. Compacte et légère, elle offre une autonomie solide pour vos séances photo ou vidéo. Idéale comme batterie principale ou de rechange, elle vous assure de ne jamais manquer un instant important.	50.00	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757717294706_batterie_canon_lp-e6_originale_lithium-ion_rechargeable.png	products/uploads/1757717294706_batterie_canon_lp-e6_originale_lithium-ion_rechargeable.png	1	{Canon,BatterieReflex}
6add6822-096a-483a-a1ca-e613a563662c	2025-09-12 22:53:29.050496+00	Canon NP-F970 – Batterie longue durée pour caméras et éclairages vidéo	【Haute puissance de la batterie】 Quatre batteries NP-F970 haute capacité de 6600mAh fournissent une alimentation suffisante pour votre caméscope, votre moniteur de terrain, votre éclairage annulaire et votre éclairage vidéo LED lors des prises de vue en extérieur.\r\n【Grande Compatibilité】 Les batteries NP-F970 alimentent tout appareil doté d'une plaque de batterie NP-F, y compris les caméscopes et les caméras vidéo Sony, les moniteurs de terrain Neewer, les éclairages annulaires et les éclairages vidéo LED.\r\n\r\nSpécifications\r\nBatterie NP-F970\r\nTension : 7,4 V\r\nCapacité de la batterie : 48,8 Wh, 6 600 mAh\r\nType de batterie : batterie Li-ion rechargeable\r\nChargeur de batterie à 4 canaux\r\nModèle : DP-F970\r\nTension d'entrée : 12–20 V 3,5 A\r\nTension de sortie : 8,4 V 2 A (1 ou 2 piles), 8,4 V 1 A (3 ou 4 piles)\r\nTempérature de fonctionnement : 32 à 95 °F / 0 à 35 °C	80.00	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757717608505_canon_np-f970_batterie_longue_dur_e_pour_cam_ras_et_clairages_vid_o.png	products/uploads/1757717608505_canon_np-f970_batterie_longue_dur_e_pour_cam_ras_et_clairages_vid_o.png	1	{"Haute Puissance",Compatibilité}
556d86b7-c013-48a3-a6a5-7661daa32504	2025-09-12 23:16:40.105552+00	Blackmagic Pocket Cinema Camera 4K	La Blackmagic Pocket Cinema Camera 4K est dotée d’un capteur 4/3 grand format, d’une résolution d'image de 4096 x 2160 ainsi qu'une plage dynamique de 13 diaphragmes et de deux ISO natifs pouvant atteindre 25 600 pour des images HDR et une exceptionnelle performance en faible éclairage. Elle peut enregistrer jusqu'à 60 i/s en 4K et 120 i/s en HD. Les commandes externes offrent un accès rapide aux fonctionnalités essentielles, tandis que l’écran tactile de 5 pouces est idéal pour cadrer les prises, effectuer une mise au point précise et changer les paramètres de la caméra. Cette caméra intègre des logements pour cartes SD/UHS-II et CFast pour un enregistrement en RAW ou ProRes ainsi qu’un port USB-C pour un enregistrement externe sur disque. Elle comprend en outre une monture d’objectif Micro 4/3, des micros intégrés, une mini entrée XLR avec alimentation fantôme, un connecteur HDMI standard et une prise en charge des LUTs 3D et du Bluetooth.\r\n\r\n\r\n\r\nPoints Fort : \r\n\r\nCapteur 4K 60i/s 4096 x 2160 pixels\r\nPlage dynamique de 13 diaphragmes\r\n2 ISO natifs pouvant atteindre 25 600\r\nMonture d'objectif Micro 4/3\r\n3 supports d'enregistrement\r\nGrand écran tactile ultra-lumineux 5"\r\nMicrophones et entrée XLR intégrés\r\nConnexions HDMI et XLR\r\nPlusieurs alimentations possibles\r\n\r\n\r\n\r\nCe qui est inclus :\r\n\r\n1x Blackmagic Pocket Cinéma Camera 4K\r\n2x Batteries (Canon LP-E6)\r\n1x Cache anti-poussière pour la tourelle\r\n1x Alimentation 30W avec connecteur de verrouillage et adaptateurs universels	80.00	Camera	http://localhost:54321/storage/v1/object/public/products/uploads/1757718999653_blackmagic_pocket_cinema_camera_4k.png	products/uploads/1757718999653_blackmagic_pocket_cinema_camera_4k.png	1	{"Plage dynnamique","Grand format"}
0b379afc-29fe-4c8b-a783-7f95dbb6c1a9	2025-09-12 23:21:08.095472+00	DJI Air 2S - Drone	Le drone DJI Air 2S est le digne successeur du fameux DJI Mavic Air 2. Ce nouveau drone représente à ce jour la quintessence même du savoir-faire de DJI en matière de drone. Grand public, ce drone conviendra à tout type de personnes. En effet, au-delà des performances tout simplement ahurissantes de ce nouveau drone, les fonctionnalités sécurisantes qu'il intègre sont d'un niveau ultime.\r\n\r\nEn plus de cela, le drone Air 2S intègre le nouveau système de transmission vidéo OcuSync 3.0. Grâce à cela, vous bénéficierez d'une portée de vol allant jusqu'à 8km, en toute fluidité. DJI a cherché à rendre ce drone le plus polyvalent et performant possible. C'est pourquoi il intègre de nombreuses fonctionnalités intelligentes et modes de vols avancés pour satisfaire tout type d'utilisateur.\r\n\r\nCe drone est en réalité si puissant qu'il peut également servir dans le monde professionnel. En effet, les professionnels du monde cinématographique seront tout à fait satisfait de la qualité d'image du drone, mais également les créateurs de contenus pourront se servir du DJI Air 2S pour réaliser leurs plans les plus époustouflants. Il propose de prendre des photos de 20 MP et des vidéos aux dimensions dantesques (5,4K), le tout en très haute qualité à l'aide d'un capteur CMOS 1 pouce.\r\n\r\n\r\n\r\nCaractéristiques techniques DJI Air 2S\r\n\r\nAppareil\r\n\r\nPoids au décollage, 595 g\r\nPlafond pratique, 5 000 m\r\nTemps de vol max (sans vent), 30 minutes\r\nDistance de vol max. (sans vent), 18,5 km\r\nVitesse de vol max. (près du niveau de la mer, sans vent), 19 m/s (mode S), 15 m/s (mode N), 5 m/s (mode C)\r\nRésistance au vent max, 10,7 m/s\r\nDémontage rapide, faible bruit, pliage\r\nStockage interne 8 Go\r\n\r\nCaméra\r\n\r\nCapteur, CMOS 1"\r\nObjectif FOV : 88°, Format équivalent : 22 mm\r\nOuverture : f/2,8, Portée : de 0,6 m à l'infini\r\n\r\nGamme ISO\r\nVidéo :\r\n100 à 3 200 (auto)\r\n100 à 6 400 (manual)\r\nPhoto :\r\n100 à 3 200 (auto)\r\n100 à 12 800 (manual)\r\nPrise de vue unique, Rafale, Bracketing d'exposition automatique (AEB)\r\nJPEG/DNG (RAW)\r\n\r\nDéfinition vidéo\r\n5,4K : 5 472 x 3 078 à 24/25/30 ips\r\n4K Ultra HD : 3 840 x 2 160 à 24/25/30/48/50/60 ips\r\n2,7K : 2 688 x 1 512 à 24/25/30/48/50/60 ips\r\nFHD : 1 920 x 1 080 à 24/25/30/48/50/60/120 ips\r\nMP4/MOV (H.264/MPEG-4 AVC, H.265/HEVC)\r\n\r\nPrise en charge d’une carte microSD d’une capacité allant jusqu’à 256 Go.\r\nZoom numérique\r\n\r\nStabilisation, 3 axes (inclinaison, roulis, pano)\r\n\r\nSystème de transmission, DJI O3\r\n\r\n\r\nRadiocommande DJI RC-N1\r\n\r\nConnecteurs d’appareils mobiles pris en charge, Lightning, micro-USB, USB-C\r\nBluetooth 4.2\r\nProtocole Wi-Fi	200.00	Camera	http://localhost:54321/storage/v1/object/public/products/uploads/1757719267857_dji_air_2s_-_drone.jpg	products/uploads/1757719267857_dji_air_2s_-_drone.jpg	1	{Drone,Performance}
6971c826-9a63-4c9c-9a44-ae8f80f97132	2025-09-12 23:28:34.878539+00	Kit Panneau LED bicolore NL660 Neewer	LED Lumière vidéo Bi-couleur avec support en U et trépied de lumière réglable.\r\nAvec 300 blanc et 300 jaunes LED ampoules durables, la lumière illumine une balance des blancs variable de la lumière du jour au tungstène 3200-5600K Température de couleur; Le support en U permet d'ajuster l'angle d'éclairage en fonction de l'environnement.\r\nCette lampe est fabriquée en alliage d'aluminium d'excellente qualité.\r\nPeut être placé directement sur le support de lumière, le sol ou le bureau. Fournit plusieurs solutions de prise de vue pour vos travaux de création\r\nLa lumière est alimentée par un adaptateur secteur ou une batterie Li-ion NP-F970.\r\nFixez les volets coupe-flux aux pour diriger un rayon de lumière; Livré avec un diffuseur blanc pour adoucir la lumière sévère et un sac de transport pour ranger le LED panneau et les accessoires\r\nSupport de lumière réglable avec étui de transport, verrouillage solides garantissent la sécurité de l’équipement en cours d'utilisation.	123.00	eclairage	http://localhost:54321/storage/v1/object/public/products/uploads/1757719714383_kit_panneau_led_bicolore_nl660_neewer.jpg	products/uploads/1757719714383_kit_panneau_led_bicolore_nl660_neewer.jpg	1	{réglable}
a7c5d912-eba1-47a3-b9e3-d55a71642ceb	2025-09-12 23:32:53.100837+00	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	Obtenez 7 effets de lumière】ce kit de réflecteur 7 en 1 vous offre un panneau diffuseur rond et translucide et un manchon réversible qui comporte 6 couleurs : or, argent, or doux et blanc argenté pour faire rebondir différents tons de lumière avec du bleu et du vert pour la chroma clé\r\n【Poignées à Double Poignée】Les doubles poignées vous permettent de tenir le réflecteur à deux mains et de le positionner librement pour obtenir l'éclairage le plus souhaitable pour vos prises de vue.\r\n【Point de montage Fileté 3/8"】l'une des poignées a un trou fileté supplémentaire de 3/8" pour fixer des accessoires ou des dispositifs de préhension. Vous pouvez également monter le réflecteur sur un support d'éclairage ou un support en C pour une réflexion de l'éclairage mains libres.\r\n【Qualité de Construction Exceptionnelle】Fabriqué en acier robuste, le cadre peut être plié et tordu à plusieurs reprises sans déformation, et le tissu réfléchissant lisse fait rebondir uniformément l'éclairage pour des portraits et des photographies brillants\r\n【Pliable et Facile à transporter】Conçu pour la photographie en studio ou sur place, le panneau réflecteur peut se plier en une petite taille et se glisser dans le sac à fermeture éclair pour un rangement et un transport faciles.\r\n\r\nCaractéristiques\r\nModèle : RF-110III\r\nTaille : 43"/110 cm\r\nFiletage : 3/8"\r\nCouleur : translucide, or, argent, or doux, blanc argenté, bleu, vert.\r\nContenu du colis\r\n1 x panneau diffuseur pliable avec poignées (translucide)\r\n1 x manchon réfléchissant réversible (or, argent, or doux, blanc argenté, bleu, vert)\r\n1 x sac de transport	34.00	eclairage	http://localhost:54321/storage/v1/object/public/products/uploads/1757719972293_batterie_v-lock_moman_99pro_99wh_li-ion_compacte_et_puissante_pour_cam_ras_pro.jpg	products/uploads/1757719972293_batterie_v-lock_moman_99pro_99wh_li-ion_compacte_et_puissante_pour_cam_ras_pro.jpg	1	{Robuste}
e5df5757-303b-403e-b4fc-2faf1d76e24d	2025-09-12 23:12:03.16056+00	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	La Moman V-Lock 99Pro est une batterie lithium-ion de 99Wh conçue pour les caméras professionnelles, éclairages vidéo et moniteurs. Grâce à son format compact et son design robuste, elle offre une autonomie fiable et une puissance continue sur vos tournages en studio comme en extérieur. Équipée d’un port D-Tap pratique et d’indicateurs LED clairs, cette batterie V-Lock est idéale pour les vidéastes à la recherche de performance et de mobilité.\r\n\r\nLa fonction la plus demandée est l'affichage de l'heure. Le Moman Power 99 Pro est le premier de sa catégorie à capturer des courants toutes les 100 ms. Il offre une estimation fiable de la durée de film restante et de l'état de charge. Un simple coup d'œil à l'écran OLED suffit pour connaître l'état de charge.\r\nCharge rapide Type-C de 65 W : Grâce à son port USB-C innovant de 65 W, vous pouvez charger cette mini batterie V-Mount de 99 Wh via un adaptateur secteur ou un D-tap, de manière traditionnelle, à l'aide d'un grand adaptateur ou simplement du câble USB-C inclus. Elle utilise le même chargeur que vos téléphones portables, tablettes ou ordinateurs portables, vous évitant ainsi d'avoir à transporter une autre  batterie externe pour appareil photo , ainsi que de nombreux câbles et chargeurs supplémentaires lors de vos prises de vue en extérieur.\r\nPuissance de sortie de 200 W et courant constant de 15 A : La batterie Li-ion V-Mount de 99 Wh est suffisamment puissante pour alimenter simultanément 200 W de différents appareils pendant vos prises de vue, avec un courant nominal constant maximal de 15 A.\r\nSystème de gestion de batterie intelligent (BMS) : Les Moman Power 99 et 99 Pro sont totalement protégés contre les surintensités, les courts-circuits, les surcharges, les décharges et les surchauffes grâce aux puces intelligentes du système de gestion de batterie Texas Instrument.	53.99	Batterie	http://localhost:54321/storage/v1/object/public/products/uploads/1757718722696_batterie_v-lock_moman_99pro_99wh_li-ion_compacte_et_puissante_pour_cam_ras_pro.png	products/uploads/1757718722696_batterie_v-lock_moman_99pro_99wh_li-ion_compacte_et_puissante_pour_cam_ras_pro.png	1	{compact,Affiche}
\.


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."cart_items" ("id", "user_id", "product_id", "quantity", "created_at", "updated_at", "start_date", "end_date") FROM stdin;
\.


--
-- Data for Name: contact_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."contact_messages" ("id", "name", "email", "phone", "subject", "message", "consent", "created_at") FROM stdin;
482b42d8-f710-49bc-bcb6-cebf4876f4ca	Jean Dupont	jean.dupont@example.com	0612345678	Devis caméra	Bonjour, je voudrais un devis pour louer une caméra 4K.	t	2025-09-04 00:55:37.273136+00
ecf1c62f-d548-4f38-a663-41046f000a34	Marie Curie	marie.curie@example.com	\N	Collaboration	Je vous contacte pour une collaboration sur un tournage.	t	2025-09-04 00:55:37.273136+00
45be2fd5-70cb-4d48-ad7c-f8b3f747265f	Luc Martin	luc.martin@example.com	0601020304	Urgent	Est-il possible de louer des micros demain matin ?	t	2025-09-04 00:55:37.273136+00
\.


--
-- Data for Name: films; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."films" ("id", "slug", "title", "director", "category", "synopsis", "year", "runtime_min", "status", "poster_url", "poster_path", "created_at", "updated_at") FROM stdin;
0107ae68-7f39-4998-915a-bc360c7c4c6f	black-case	Black Case	Julien Bompart	Court-métrage	Dans un univers sombre où chaque décision a un prix, "Black Case" entraîne le spectateur dans une enquête haletante autour d’un mystérieux attaché-case. Objet de toutes les convoitises, il déclenche une chaîne de trahisons et de dilemmes moraux où le pouvoir se paie au prix fort.	2025	18	published	http://127.0.0.1:54321/storage/v1/object/sign/films/affiches/black.webp?token=eyJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxtcy9hZmZpY2hlcy9ibGFjay53ZWJwIiwiaWF0IjoxNzU5MTgzMzI0LCJleHAiOjQ5MTI3ODMzMjR9.UWjvg2RV6v1qb1xAAsuIpi2UOyS9kT-IF9nL_xgIBrk	affiches/black.webp	2025-09-29 23:01:53.132768+00	2025-09-29 23:01:53.132768+00
f1eb1f96-bdfc-4880-acce-de24fea8008a	fardeau	Fardeau	Naïl Bouhamadi	Court-métrage	"Fardeau" suit un jeune homme déterminé à se reconstruire, rattrapé par les conséquences d’un passé qu’il croyait enfoui. À mesure que les responsabilités, la culpabilité et les non-dits resurgissent, il doit choisir entre fuir ou affronter ce qui l’écrase depuis des années.	2025	22	published	http://127.0.0.1:54321/storage/v1/object/sign/films/affiches/fardeau.webp?token=eyJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxtcy9hZmZpY2hlcy9mYXJkZWF1LndlYnAiLCJpYXQiOjE3NTkxODMzNTQsImV4cCI6MTc2NzgyMzM1NH0.8P1y25QE10i7M24pPjqbbkOPI2cZfzvGUNhyTd4tn30	affiches/fardeau.webp	2025-09-29 23:01:53.132768+00	2025-09-29 23:01:53.132768+00
abf74e58-e37c-4833-9e6c-7e8966d763d6	silhouette	Silhouette	Kendrick Courant	Court-métrage	"Silhouette" explore l’ombre comme double indocile : lorsqu’elle s’autonomise et échappe au contrôle de son hôte, elle révèle peurs profondes et désirs refoulés. Un conte fantastique à la lisière du réel, où la lumière dessine peu à peu les contours de soi.	2025	20	published	http://127.0.0.1:54321/storage/v1/object/sign/films/affiches/sil.webp?token=eyJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxtcy9hZmZpY2hlcy9zaWwud2VicCIsImlhdCI6MTc1OTE4MzM2OSwiZXhwIjoxNzY3ODIzMzY5fQ.S2CD9uX3q8R-u0eXyLY8o6_xhrr59W_YJDUU4l6DP4I	affiches/sil.webp	2025-09-29 23:01:53.132768+00	2025-09-29 23:01:53.132768+00
c33ca871-1aa0-476f-a80e-f1987074ef2b	you-are-my-sunshine	You Are My Sunshine	Preiya Dovel	Court-métrage	"You Are My Sunshine" est une ode à l’amour et à la mémoire. Après une perte, une femme ravive la présence de l’être aimé à travers des réminiscences qui illuminent le quotidien. Les rayons qui percent l’obscurité deviennent le fil discret entre passé et présent.	2025	19	published	http://127.0.0.1:54321/storage/v1/object/sign/films/affiches/sunshine.webp?token=eyJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJmaWxtcy9hZmZpY2hlcy9zdW5zaGluZS53ZWJwIiwiaWF0IjoxNzU5MTgzMzkyLCJleHAiOjE3Njc4MjMzOTJ9.BM1kaaTRWiO8O2JKrRq7XWhNzKFsZQS0VlSdAc2kIFQ	affiches/sunshine.webp	2025-09-29 23:01:53.132768+00	2025-09-29 23:01:53.132768+00
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."orders" ("id", "user_id", "session_id", "start_date", "end_date", "delivery", "address", "payment_method", "total_amount_cents", "status", "created_at", "customer_email", "customer_first_name", "customer_last_name", "customer_phone", "merchant_reference", "payment_id") FROM stdin;
e31cbb6d-cc34-4a69-a5c1-cc9dcf8568d7	07123ccc-9a58-447e-ae4b-d7a62b51b5b8	cs_test_b19ShlLOtcrfaYOK9uaaW7EIfHB942YNhq0ThHdAPuv9NGs2PUXL5ByMU7	2025-09-06	2025-09-06	pickup	{}	card	123000	paid	2025-09-07 19:44:08.18568+00	\N	\N	\N	\N	\N	\N
aaf48801-e814-4056-80f5-f520c6727cea	07123ccc-9a58-447e-ae4b-d7a62b51b5b8	cs_test_b1TvleAEfJMqwZx6LQh1KyYUe5CN8uV9VDWTyFRlNEQrj8BGmoJBuXfzN6	2025-09-09	2025-09-12	pickup	"{}"	card	30400	paid	2025-09-09 21:30:38.404242+00	\N	\N	\N	\N	\N	\N
cd844bd4-2647-4546-94f0-08da06b5201a	07123ccc-9a58-447e-ae4b-d7a62b51b5b8	cs_test_b1dj21Z7di6OdsHUkWoyUFmaPWq8Ak5aZY3xMxXX7nvEzFFruEu1D1nx7S	2025-09-24	2025-09-26	pickup	"{}"	card	22800	paid	2025-09-09 21:34:47.411208+00	\N	\N	\N	\N	\N	\N
22772ab4-0f93-4da2-a4fd-db942d2630f7	07123ccc-9a58-447e-ae4b-d7a62b51b5b8	cs_test_b1BRmvOlTYh5GTCXGNvrUUvupUbosrzJEGP1jwIChzapNpXsIEzqDVYRqH	2025-09-10	2025-09-12	pickup	"{}"	card	22800	paid	2025-09-11 10:02:56.148945+00	\N	\N	\N	\N	\N	\N
eca951ed-31f5-4e17-94be-12e58a103b17	07123ccc-9a58-447e-ae4b-d7a62b51b5b8	cs_test_b1Eq8Vm7jj3saG3ZqoFixHhPxSkugXQ3ARlvne1rBW7Eii76DjeSbuX55m	2025-09-24	2025-09-26	pickup	"{}"	card	369000	paid	2025-09-11 16:10:47.333961+00	\N	\N	\N	\N	\N	\N
88904b5e-2cda-4c5f-a84b-2fb31057a53e	07123ccc-9a58-447e-ae4b-d7a62b51b5b8	cs_test_b1eUHMEIRU3aeXCMGTqkP9nhLJZYyt5COOdrsgBLUvQJTc2tRPuawWOtIj	2025-09-25	2025-09-27	delivery	{"city": "LYLY", "line1": "premiere adresse", "line2": "complément", "postal_code": "98829"}	card	22800	paid	2025-09-11 21:12:23.618285+00	matteo.padalinoba@gmail.com	\N	\N	\N	\N	\N
996a031a-c5cf-49f4-bcad-26de24df02f9	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1XRDhRCSR2iXtkADhfemxS3qxVZpDxR1H324jumCGOknKcNmnbRJ6vHPU	2025-09-23	2025-09-25	pickup	{}	card	36900	paid	2025-09-13 23:50:10.481926+00	admin@local.test	\N	\N	\N	\N	\N
d3a342c3-f546-4bd2-b8e4-e554def7455d	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1DXjKjKcWI9bdWSrGsWXw3cipiNczQQt2HTUgg7bFobZ58XES1ZieXKjt	2025-09-18	2025-09-19	pickup	{}	card	24600	paid	2025-09-13 23:53:23.687616+00	admin@local.test	\N	\N	\N	\N	\N
19ca7cec-196c-47ba-8d2d-738f7063f108	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1KXa19kheVLzthdgF2PMSAwOudefiKMApsH0CKMckBGhgPZT8Q1FEuIkL	2025-09-23	2025-09-24	pickup	{}	card	6800	paid	2025-09-13 23:56:47.80078+00	admin@local.test	\N	\N	\N	\N	\N
edf7c518-b79c-4240-be7c-62433f8155fe	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1PZGwx5WfSk870Hc1ZdZSFNtFHaaMdObU2sIR7pgy0L8jRtmMxX1B2ESD	2025-09-17	2025-09-19	pickup	{}	card	16197	paid	2025-09-14 00:06:38.105607+00	admin@local.test	\N	\N	\N	\N	\N
2caeb379-e030-4ff9-9932-f43f380a466a	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1RenjSTGYDcR0iqc1P1O5fb3G2y8mh09Aa80dBCNCahUlYCf9qC5WVvyo	2025-09-18	2025-09-19	pickup	{}	card	40000	paid	2025-09-14 00:13:03.888126+00	admin@local.test	\N	\N	\N	\N	\N
6acad4a6-f761-4cc6-9307-c2651fbd7a46	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b166sTHOlqtFj0PHs2xQsLaWNm68yBHkbhBf6vOJ3sJdjBLxnehsbiC9xO	2025-09-24	2025-09-25	pickup	{}	card	9600	paid	2025-09-14 00:19:17.599856+00	admin@local.test	\N	\N	\N	\N	\N
98e5c3a1-2a68-4a2d-b8ef-9b4d6ca60d04	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1p3lClr57ijOnbZgPOgtxOptujFiEKkV83MC57qkhK6UkwohYOj9lp3sf	2025-09-16	2025-09-17	pickup	{}	card	6800	paid	2025-09-15 06:58:31.10874+00	admin@local.test	\N	\N	\N	\N	\N
07f37bca-025f-4011-98a0-2ab862fcc65b	0f05868b-d517-4b14-95cf-6440eb1ccbb1	cs_test_b1Dpdgifose8F9IADnpfyoJ6atH8cWIV1eMmE8d1XZ8ibPKmx64JkJUtLg	2025-09-15	2025-09-17	pickup	{}	card	36900	paid	2025-09-15 22:29:34.665985+00	admin@local.test	\N	\N	\N	\N	\N
950f6e41-ef27-453e-a7f9-eff39e15b0b4	0f05868b-d517-4b14-95cf-6440eb1ccbb1	MOCK-HC-39QYGYBD	2025-09-25	2025-09-26	pickup	\N	card	1234	paid	2025-10-02 20:34:30.124761+00	admin@local.test	Matteo	Padalino	\N	RES-MG9VIU4O-X52I0D	PAY-MOCK-HC-39QYGYBD
0a279f4a-dfd9-4845-9698-75fea55d9ed1	0f05868b-d517-4b14-95cf-6440eb1ccbb1	MOCK-HC-NE4J0RF0	2025-10-14	2025-10-16	pickup	\N	card	1234	paid	2025-10-02 20:50:03.90655+00	admin@local.test	Mattéo	Padalino	\N	RES-MG9W2UOU-AMOUWW	PAY-MOCK-HC-NE4J0RF0
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."order_items" ("id", "order_id", "product_id", "name", "unit_price_cents", "quantity", "start_date", "end_date") FROM stdin;
1	e31cbb6d-cc34-4a69-a5c1-cc9dcf8568d7	\N	Canon C300 Mark III	123000	1	\N	\N
6	eca951ed-31f5-4e17-94be-12e58a103b17	\N	Canon C300 Mark III	123000	3	2025-09-24	2025-09-26
3	cd844bd4-2647-4546-94f0-08da06b5201a	\N	Microphone Pro	7600	1	2025-09-24	2025-09-26
4	22772ab4-0f93-4da2-a4fd-db942d2630f7	\N	Microphone Pro	7600	3	2025-09-10	2025-09-12
2	aaf48801-e814-4056-80f5-f520c6727cea	\N	Sony EXG - Oui	7600	1	2025-09-09	2025-09-12
7	88904b5e-2cda-4c5f-a84b-2fb31057a53e	\N	Sony EXG - Oui	7600	3	\N	\N
8	996a031a-c5cf-49f4-bcad-26de24df02f9	6971c826-9a63-4c9c-9a44-ae8f80f97132	Kit Panneau LED bicolore NL660 Neewer	12300	3	\N	\N
9	d3a342c3-f546-4bd2-b8e4-e554def7455d	6971c826-9a63-4c9c-9a44-ae8f80f97132	Kit Panneau LED bicolore NL660 Neewer	12300	2	\N	\N
10	19ca7cec-196c-47ba-8d2d-738f7063f108	a7c5d912-eba1-47a3-b9e3-d55a71642ceb	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	3400	2	\N	\N
11	edf7c518-b79c-4240-be7c-62433f8155fe	e5df5757-303b-403e-b4fc-2faf1d76e24d	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	5399	3	\N	\N
12	2caeb379-e030-4ff9-9932-f43f380a466a	0b379afc-29fe-4c8b-a783-7f95dbb6c1a9	DJI Air 2S - Drone	20000	2	\N	\N
13	6acad4a6-f761-4cc6-9307-c2651fbd7a46	35c018dd-777f-44ce-99fe-e5db9ac2e85a	Batterie V-Lock BP95 – Haute capacité 95Wh pour caméras professionnelles	4800	2	\N	\N
14	98e5c3a1-2a68-4a2d-b8ef-9b4d6ca60d04	a7c5d912-eba1-47a3-b9e3-d55a71642ceb	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	3400	2	\N	\N
15	07f37bca-025f-4011-98a0-2ab862fcc65b	6971c826-9a63-4c9c-9a44-ae8f80f97132	Kit Panneau LED bicolore NL660 Neewer	12300	3	\N	\N
16	950f6e41-ef27-453e-a7f9-eff39e15b0b4	a7c5d912-eba1-47a3-b9e3-d55a71642ceb	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	3400	2	\N	\N
17	0a279f4a-dfd9-4845-9698-75fea55d9ed1	a7c5d912-eba1-47a3-b9e3-d55a71642ceb	Batterie V-Lock Moman 99Pro – 99Wh Li-ion compacte et puissante pour caméras pro	3400	3	\N	\N
\.


--
-- Data for Name: payment_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."payment_events" ("id", "source", "event_type", "payment_id", "merchant_reference", "payload", "raw_signature", "verified", "created_at") FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profiles" ("id", "first_name", "last_name", "phone") FROM stdin;
07123ccc-9a58-447e-ae4b-d7a62b51b5b8	Matteo	Padalino	0667727557
\.


--
-- Data for Name: profils; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY "public"."profils" ("id", "email", "nom", "created_at") FROM stdin;
\.


--
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."order_items_id_seq"', 17, true);


--
-- Name: payment_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('"public"."payment_events_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
