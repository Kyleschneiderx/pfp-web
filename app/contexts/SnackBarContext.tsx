"use client";

import SnackBar from "@/app/components/snackbar";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface SnackBarProps {
	message: string;
	success: boolean;
}

interface Props {
	showSnackBar: (props: SnackBarProps) => void;
}

const SnackBarContext = createContext<Props | undefined>(undefined);

export const useSnackBar = () => {
	const context = useContext(SnackBarContext);
	if (!context) {
		throw new Error("useSnackBar must be used within a SnackBarProvider");
	}
	return context;
};

export const SnackBarProvider = ({ children }: { children: ReactNode }) => {
	const [snackBarMessage, setSnackBarMessage] = useState<string>("");
	const [isVisible, setIsVisible] = useState<boolean>(false);
	const [success, setSuccess] = useState<boolean>(true);

	const showSnackBar = useCallback(({ message, success }: SnackBarProps) => {
		setSnackBarMessage(message);
		setIsVisible(true);
		setSuccess(success);
	}, []);

	const closeSnackBar = useCallback(() => {
		setIsVisible(false);
	}, []);

	const contextValue = useMemo(() => ({ showSnackBar }), [showSnackBar]);

	return (
		<SnackBarContext.Provider value={contextValue}>
			{children}
			<SnackBar message={snackBarMessage} isVisible={isVisible} success={success} onClose={closeSnackBar} />
		</SnackBarContext.Provider>
	);
};
