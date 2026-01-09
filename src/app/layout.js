
import "./globals.css";

import Navbar from "../components/Navbar";
import ClientProvider from "@/components/ClientProvider";
import MainLayout from "@/components/layouts/MainLayout"; // A new component for layout logic

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
      <ClientProvider>
          <div className="pt-15">
          <MainLayout>{children}</MainLayout>
          </div>
      </ClientProvider>
      </body>
    </html>
  );
}
