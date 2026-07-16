import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Navbar userName={session.name ?? session.email} />
      <main className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </>
  );
}
