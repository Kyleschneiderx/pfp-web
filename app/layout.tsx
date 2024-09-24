import { SnackBarProvider } from "@/app/contexts/SnackBarContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// import PageProgressBar from "./pageProgressBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pelvic Floor Pro",
  description: "Pelvic Floor Pro",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="upgrade-insecure-requests"
        />
      </head>
      <body className={inter.className}>
        <SnackBarProvider>
          {/* <PageProgressBar /> */}
          <div id="modal"></div>
          {children}
        </SnackBarProvider>
      </body>
    </html>
  );
}
