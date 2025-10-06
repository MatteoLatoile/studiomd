export function requireEnv(keys = []) {
  const missing = keys.filter((k) => !process.env[k]);
  if (missing.length) {
    const msg = `Variables d'environnement manquantes: ${missing.join(", ")}`;
    if (process.env.NODE_ENV !== "production") {
      console.warn("[ENV]", msg);
    }
  }
}
