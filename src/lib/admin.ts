// Admin email whitelist — configure via ADMIN_EMAILS env var (comma-separated)
// Falls back to hardcoded list if env var not set
function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS;
  if (envEmails) {
    return envEmails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  }
  return ["benhoward970@gmail.com", "hello@referaus.com"];
}

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}
