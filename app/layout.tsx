import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VehicleProvider } from "@/lib/context/VehicleContext";
import Navbar from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chargely - EV Tracker",
  description: "Track your EV charging and mileage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="antialiased">
      <body className={inter.className}>
        <VehicleProvider>
          <div className="min-h-screen bg-slate-50/50">
            <Navbar />
            <main className="max-w-5xl mx-auto p-4 md:p-8">
              {children}
            </main>
          </div>
        </VehicleProvider>
      </body>
    </html>
  );
}
