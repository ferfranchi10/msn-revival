import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { PresenceManager } from "@/components/PresenceManager";
import { NudgeManager } from "@/components/NudgeManager";
import { MessageManager } from "@/components/MessageManager";
import { FriendRequestManager } from "@/components/FriendRequestManager";
import { ChatManager } from "@/components/ChatManager";
import { InstallPrompt } from "@/components/InstallPrompt";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://msn-revival.vercel.app";
const DESCRIPTION = "Un mensaje hacia la nostalgia.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "MSN Revival",
  description: DESCRIPTION,
  // App privada para un grupo cerrado de amigos: no tiene sentido que la indexen buscadores.
  robots: { index: false, follow: false },
  openGraph: {
    title: "MSN Revival",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "MSN Revival",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MSN Revival",
    description: DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MSN Revival",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  // Necesario para que env(safe-area-inset-*) valga algo en iPhone con notch/barra de estado translúcida.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ServiceWorkerRegister />
        <AuthProvider>
          <ChatProvider>
            {children}
            <PresenceManager />
            <NudgeManager />
            <MessageManager />
            <FriendRequestManager />
            <ChatManager />
            <InstallPrompt />
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
