import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LoginContent } from "./LoginContent";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/app");

  return <LoginContent />;
}
