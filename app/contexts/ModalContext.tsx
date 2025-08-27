"use client";

import { X } from "lucide-react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import Button from "../components/elements/Button";

interface BaseModalOption {
	allowClose?: boolean;
	onClose?: () => void;
}

interface DefaultModalOption {
	title?: string;
	type: "default";
	component: ReactNode;
}

interface AlertModalOption {
	type: "alert";
	title?: string;
	message: string;
	closeLabel?: string;
}

interface ConfirmModalOption {
	type: "confirm";
	title?: string;
	message: string;
	closeLabel?: string;
	onConfirm?: () => void;
	confirmLabel?: string;
}

type ModalOptions = BaseModalOption & (DefaultModalOption | AlertModalOption | ConfirmModalOption);

interface ModalProvider {
	isOpen: boolean;
	open: (options: ModalOptions) => void;
	close: (open?: boolean) => void;
	closeAll: () => void;
}

const ModalContext = createContext<ModalProvider | null>(null);

interface CreateModalStates {
	isLoading?: boolean;
	onToggleProcessing?: () => void;
}

const createModal = (options: ModalOptions, states: CreateModalStates) => {
	switch (options.type) {
		case "default":
			return (
				<Dialog.Content className="top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed  mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none">
					<VisuallyHidden.Root>
						<Dialog.Description>Modal</Dialog.Description>
					</VisuallyHidden.Root>
					<div className="flex justify-between">
						{options?.title && <Dialog.Title className="">{options.title}</Dialog.Title>}
						{options?.allowClose && (
							<Dialog.Close asChild>
								<button type="button" aria-label="Close">
									<X className="w-6 h-6 cursor-pointer" />
								</button>
							</Dialog.Close>
						)}
					</div>

					{options.component}
				</Dialog.Content>
			);
		case "alert":
			return (
				<Dialog.Content className="top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed  mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none">
					<VisuallyHidden.Root>
						<Dialog.Description>Modal</Dialog.Description>
					</VisuallyHidden.Root>
					<div className="flex justify-between">
						<div className="text-center w-[300px] sm:w-[450px]">
							{options?.title && (
								<Dialog.Title className="text-xl sm:text-2xl font-semibold mb-5">{options.title}</Dialog.Title>
							)}
							<p className="text-neutral-600 mb-[40px]">{options.message}</p>
							<div className="flex justify-center space-x-3">
								<Button
									label={options?.closeLabel ?? "Close"}
									secondary
									onClick={options.onClose ?? undefined}
									className="sm:px-[50px]"
								/>
							</div>
						</div>
					</div>
				</Dialog.Content>
			);
		case "confirm":
			return (
				<Dialog.Content className="top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed  mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none">
					<VisuallyHidden.Root>
						<Dialog.Description>Modal</Dialog.Description>
					</VisuallyHidden.Root>
					<div className="flex justify-between">
						<div className="text-center w-[300px] sm:w-[450px]">
							{options?.title && (
								<Dialog.Title className="text-xl sm:text-2xl font-semibold mb-5">{options.title}</Dialog.Title>
							)}
							<p className="text-neutral-600 mb-[40px]">{options.message}</p>
							<div className="flex justify-center space-x-3">
								<Dialog.Close asChild>
									<Button
										label={options?.closeLabel ?? "Cancel"}
										secondary
										onClick={options.onClose ?? undefined}
										className="sm:px-[50px]"
									/>
								</Dialog.Close>
								{options?.onConfirm && (
									<Button
										label={options?.confirmLabel ?? "Confirm"}
										onClick={() => {
											if (states.onToggleProcessing) states.onToggleProcessing();

											if (options.onConfirm) {
												options.onConfirm();
											}

											if (states.onToggleProcessing) states.onToggleProcessing();
										}}
										className="sm:px-[50px]"
										disabled={states.isLoading}
										isProcessing={states.isLoading}
									/>
								)}
							</div>
						</div>
					</div>
				</Dialog.Content>
			);
		default:
			break;
	}
};

const ModalProvider = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState<boolean>(false);
	// const [stack, setStack] = useState<ReactNode[]>([]);
	// const stackRef = useRef<ReactNode[]>([]);
	const [stack, setStack] = useState<ModalOptions[]>([]);
	const stackRef = useRef<ModalOptions[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const open = (options: ModalOptions) => {
		// setStack((prev) => [...prev, createModal({ ...options })]);
		setStack((prev) => [...prev, options]);

		setIsLoading(false);

		setIsOpen(true);
	};

	const close = (open?: boolean) => {
		if (!open) {
			if (stackRef.current.length > 1) {
				setStack((prev) => {
					const newStack = [...prev];
					newStack.pop();
					return newStack;
				});
				return;
			}

			setStack([]);
			setIsOpen(open ?? false);
		}
	};

	const closeAll = () => {
		setStack([]);
		setIsOpen(false);
	};

	useEffect(() => {
		stackRef.current = stack;
	}, [stack]);

	const value = {
		isOpen,
		open,
		close,
		closeAll,
	};

	return (
		<ModalContext.Provider value={value}>
			{children}
			{stack[stack.length - 1] && (
				<Dialog.Root open={isOpen} onOpenChange={close}>
					<Dialog.Portal>
						<Dialog.Overlay className="fixed w-full h-full inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30" />
						{createModal(stack[stack.length - 1], {
							isLoading,
							onToggleProcessing: () => setIsLoading(!isLoading),
						})}
					</Dialog.Portal>
				</Dialog.Root>
			)}
		</ModalContext.Provider>
	);
};

const useModal = () => {
	const context = useContext(ModalContext);

	if (!context) throw new Error("useModal must be used within a ModalProvider");

	return context;
};

export { useModal, ModalProvider };
