import { redirect } from "next/navigation";
import { createAdminSessionToken } from "@/lib/adminAuth";
import { isAdminEmailAllowed } from "@/lib/adminAllowedEmails";
import { auth } from "@/auth";

export async function getAdminSessionToken() {
  const session = await auth();
  const email = session?.user?.email;

  if (!isAdminEmailAllowed(email)) {
    return null;
  }

  return createAdminSessionToken();
}

export async function isAdminAuthenticated() {
  const token = await getAdminSessionToken();
  return Boolean(token);
}

export async function requireAdminSession() {
  const token = await getAdminSessionToken();

  if (!token) {
    redirect("/admin");
  }

  return token;
}
