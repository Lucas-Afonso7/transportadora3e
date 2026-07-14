"use server";

import { redirect } from "next/navigation";
import { destroyClientSession, destroyAdminSession } from "@/lib/auth/session";

export async function clientLogoutAction() {
  await destroyClientSession();
  redirect("/entrar");
}

export async function adminLogoutAction() {
  await destroyAdminSession();
  redirect("/admin/entrar");
}
