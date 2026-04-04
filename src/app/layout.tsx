import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "The Bottles",
  description: "Band management app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {user && <Navbar />}
        <main className={user ? "pt-16" : ""}>{children}</main>
      </body>
    </html>
  );
}
