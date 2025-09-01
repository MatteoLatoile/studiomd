import Link from "next/link";

const BtnJaune = ({ href, title, icon: Icon }) => {
  return (
    <Link
      href={href}
      style={{
        background:
          "linear-gradient(90deg, rgba(255,193,25,1) 49%, rgba(255,235,131,1) 100%)",
      }}
      className="inline-flex items-center gap-2 tracking-tight py-4 px-10 rounded-2xl font-medium text-noir hover:opacity-90 transition"
    >
      {Icon && <Icon className="text-xl" />} {/* affiche l'icône si fourni */}
      <span>{title}</span>
    </Link>
  );
};

export default BtnJaune;
