import { useEffect, useState } from "react";

export const useWindowSizeCheck = () => {
	const [width, setWidth] = useState<number>(() => (typeof window !== "undefined" ? window.innerWidth : 0));

	useEffect(() => {
		const handleResize = () => {
			setWidth(window.innerWidth);
		};
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const isMobile = width < 640;
	const isTablet = width >= 640 && width < 768;

	return { width, isMobile, isTablet };
};
