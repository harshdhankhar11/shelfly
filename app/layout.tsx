import type { Metadata } from "next";
import "./globals.css";
import { auth } from "@/utils/auth";
import { Providers } from "./providers";
import { Session } from "next-auth";



export const metadata: Metadata = {
  title: "Shelfly - Smart Inventory & Order Management",
  description: "Shelfly helps businesses manage inventory, handle unit conversions, track orders, and streamline quotations with role-based access for admins and sellers.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <Providers session={session as Session | null}>{children}</Providers>
      </body>
    </html>
  );
}
