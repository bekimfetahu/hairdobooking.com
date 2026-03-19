
import "./globals.css";

import ClientProvider from "@/components/ClientProvider";
import MainLayout from "@/components/layouts/MainLayout"; // A new component for layout logic

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="antialiased bg-background text-foreground"
      >
      <ClientProvider>
          <div className="pt-16">
          <MainLayout>{children}</MainLayout>
          </div>
      </ClientProvider>
      </body>
    </html>
  );
}
