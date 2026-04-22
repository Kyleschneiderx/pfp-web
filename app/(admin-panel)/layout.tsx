"use client";

import Navigation from "@/app/components/navigation";
import dynamic from "next/dynamic";
import { type ReactNode, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";

const Header = dynamic(() => import("@/app/components/header"), { ssr: false });

export default function RootLayout({ children }: { children: ReactNode }) {
	const { sync } = useAuth();
	const didSynced = useRef(false);

	useEffect(() => {
		if (didSynced.current) return;

		didSynced.current = true;

		sync();
	}, [sync]);

	return (
		<div className="flex h-screen overflow-hidden">
			<Navigation />
			<div className="flex flex-col w-full">
				<Header />
				<div className="relative">
					<main className="bg-primary-50 h-[calc(100vh-85px)] relative main-inner-left-shadow p-5 overflow-auto">
						{children}
					</main>
				</div>
			</div>
		</div>
	);
}
