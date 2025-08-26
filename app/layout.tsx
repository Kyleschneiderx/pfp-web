import { SnackBarProvider } from "@/app/contexts/SnackBarContext";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ProgressBarProvider from "./components/progressbar-provider";
import "./globals.css";
import { ModalProvider } from "./contexts/ModalContext";

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
			<body className={inter.className}>
				<SnackBarProvider>
					<ModalProvider>
						<div id="modal"></div>
						<ProgressBarProvider>{children}</ProgressBarProvider>
					</ModalProvider>
				</SnackBarProvider>
			</body>
		</html>
	);
}
