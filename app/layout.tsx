import type { Metadata } from "next";
import "./globals.css";



export const metadata: Metadata = {
  title: "Shelfly - Smart Inventory & Order Management",
  description: "Shelfly helps businesses manage inventory, handle unit conversions, track orders, and streamline quotations with role-based access for admins and sellers.",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" >
      <body cz-shortcut-listen="true"
      >{children}</body>
    </html>
  );
}
