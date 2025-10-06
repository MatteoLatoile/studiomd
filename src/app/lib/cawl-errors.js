export function humanizeCawlError(err) {
  const msg = (err?.message || "").toString();

  if (/ACCESS_TO_MERCHANT_NOT_ALLOWED/i.test(msg))
    return "Clés/API ou marchand incorrects (verrou d’accès au compte).";
  if (/UNAUTHORIZED|NOT AUTHORIZED|SIGNATURE|HMAC/i.test(msg))
    return "Authentification échouée (signature HMAC ou clés invalides).";
  if (/UNKNOWN_HOSTED_CHECKOUT|HOSTEDCHECKOUT.*NOT.*FOUND/i.test(msg))
    return "Session de paiement introuvable ou expirée.";
  if (/AMOUNT|CURRENCY|INVALID/i.test(msg))
    return "Montant ou devise invalide. Vérifie le total envoyé.";
  if (/TEMPORARY|TIMEOUT|GATEWAY/i.test(msg))
    return "Service paiement momentanément indisponible. Réessaie.";

  // défaut
  return "Paiement indisponible pour le moment. Réessaie un peu plus tard.";
}
