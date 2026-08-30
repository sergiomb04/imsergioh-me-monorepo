function normalizeEmail(email) {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

export function getAllowedAdminEmails() {
  const rawValue = process.env.ALLOWED_EMAILS || "";

  return new Set(
    rawValue
      .split(",")
      .map((item) => normalizeEmail(item))
      .filter(Boolean),
  );
}

export function isAdminEmailAllowed(email) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return false;
  }

  const allowedEmails = getAllowedAdminEmails();

  // Falla en cerrado para no exponer admin accidentalmente.
  if (allowedEmails.size === 0) {
    return false;
  }

  return allowedEmails.has(normalizedEmail);
}
