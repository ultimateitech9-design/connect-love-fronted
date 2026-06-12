import { redirect } from "next/navigation";

export default function SuperAdminLoginRedirect() {
  redirect("/management/super-admin");
}
