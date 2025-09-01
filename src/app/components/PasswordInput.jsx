"use client";

import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

/** Score simple: 0-4 + hints utiles */
export function scorePassword(pwd) {
  const hints = [];
  let score = 0;
  if (pwd.length >= 12) score++;
  else hints.push("≥ 12 caractères");
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
  else hints.push("Minuscules + majuscules");
  if (/\d/.test(pwd)) score++;
  else hints.push("Au moins un chiffre");
  if (/[^\w\s]/.test(pwd)) score++;
  else hints.push("Au moins un symbole");
  return { score, hints };
}

export default function PasswordInput({
  name = "password",
  value,
  onChange,
  placeholder = "Mot de passe",
  autoComplete = "new-password",
  required = false,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex w-full items-center">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="w-full text-sm outline-none placeholder-gray-400"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="ml-2 p-1 text-gray-500 hover:text-noir"
        aria-label={
          show ? "Masquer le mot de passe" : "Afficher le mot de passe"
        }
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </div>
  );
}
