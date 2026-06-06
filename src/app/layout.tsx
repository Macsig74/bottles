import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { createClient } from "@/lib/supabase/server";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "The Bottles",
  description: "Gestion du groupe The Bottles",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "The Bottles",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  let user = null;
  try {
    // getSession lit le cookie localement (pas d'appel réseau)
    const { data } = await supabase.auth.getSession();
    user = data.session?.user ?? null;
  } catch {
    // Token invalide ou expiré — on traite comme déconnecté
  }

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <ServiceWorkerRegistration />
        <InstallPrompt />
        {user && <Navbar />}
        <main className={user ? "pt-16" : ""}>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
