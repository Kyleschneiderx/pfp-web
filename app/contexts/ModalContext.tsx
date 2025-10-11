"use client";

import { X } from "lucide-react";
import { Dialog, VisuallyHidden } from "radix-ui";
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from "react";
import Button from "../components/elements/Button";
import clsx from "clsx";

interface ComponentProps {
	close: (callback?: () => void) => void;
	toggleProcessing: () => void;
}

interface BaseModalOption {
	allowClose?: boolean;
	onClose?: () => any;
	overlay?: boolean;
	className?: string;
}

interface DefaultModalOption {
	title?: string;
	type: "default";
	component: ((props: ComponentProps) => ReactNode) | ReactNode;
}

interface PanelModalOption {
	title?: string;
	type: "panel";
	component: ((props: ComponentProps) => ReactNode) | ReactNode;
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
	onConfirm?: (props: ComponentProps) => void;
	confirmLabel?: string;
}

type ModalOptions = BaseModalOption & (DefaultModalOption | AlertModalOption | ConfirmModalOption | PanelModalOption);

interface ModalProvider {
	isOpen: boolean;
	open: (options: ModalOptions) => void;
	close: (open?: boolean) => void;
	closeAll: () => void;
	setData: (data: any) => void;
	getData: () => any;
}

const ModalContext = createContext<ModalProvider | null>(null);

interface CreateModalStates {
	isLoading?: boolean;
	isOpen: boolean;
	onToggleOpen?: () => void;
	onToggleProcessing: () => void;
	close: (callback?: () => void) => void;
}

const createModal = (options: ModalOptions, states: CreateModalStates) => {
	switch (options.type) {
		case "default":
			return (
				<Dialog.Content
					onInteractOutside={(e) => e.preventDefault()}
					className={clsx(
						"top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed  mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none",
						options?.className,
					)}
				>
					<VisuallyHidden.Root>
						<Dialog.Description>Modal</Dialog.Description>
					</VisuallyHidden.Root>
					<div className="flex flex-row justify-end items-center py-3">
						{options?.title && <Dialog.Title className="mr-auto font-semibold text-xl">{options.title}</Dialog.Title>}
						{options?.allowClose && (
							<Dialog.Close
								onClick={(e) => {
									e.preventDefault();

									if (states.close) {
										states.close(options?.onClose);
									}
								}}
								asChild
							>
								<button type="button" aria-label="Close">
									<X className="w-6 h-6 cursor-pointer" />
								</button>
							</Dialog.Close>
						)}
					</div>

					{typeof options.component === "function"
						? options.component({ close: states.close, toggleProcessing: states.onToggleProcessing })
						: options.component}
				</Dialog.Content>
			);
		case "panel":
			return (
				<Dialog.Content
					onInteractOutside={(e) => e.preventDefault()}
					onOpenAutoFocus={() => {
						document.body.style.pointerEvents = "auto";
					}}
					className={clsx(
						"overflow-auto top-0 right-0 h-full w-full max-w-[450px] sm:min-w-[360px] data-[state=open]:animate-slide-in data-[state=closed]:animate-slide-out fixed bg-white p-6 shadow-left z-50 focus:outline-none",
						options?.className,
					)}
				>
					<VisuallyHidden.Root>
						<Dialog.Description>Modal</Dialog.Description>
					</VisuallyHidden.Root>
					<div className="flex justify-between">
						{options?.title ? (
							<Dialog.Title className="">{options.title}</Dialog.Title>
						) : (
							<VisuallyHidden.Root>
								<Dialog.Title className="">{options.title}</Dialog.Title>
							</VisuallyHidden.Root>
						)}
						{options?.allowClose && (
							<Dialog.Close
								onClick={(e) => {
									e.preventDefault();

									if (states.close) states.close();
								}}
								asChild
							>
								<button type="button" aria-label="Close">
									<X className="w-6 h-6 cursor-pointer" />
								</button>
							</Dialog.Close>
						)}
					</div>

					{typeof options.component === "function"
						? options.component({ close: states.close, toggleProcessing: states.onToggleProcessing })
						: options.component}
				</Dialog.Content>
			);
		case "alert":
			return (
				<Dialog.Content
					onInteractOutside={(e) => e.preventDefault()}
					className={clsx(
						"top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed  mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none",
						options?.className,
					)}
				>
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
				<Dialog.Content
					onInteractOutside={(e) => e.preventDefault()}
					className={clsx(
						"top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] fixed  mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none",
						options?.className,
					)}
				>
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
								<Dialog.Close
									onClick={(e) => {
										e.preventDefault();

										if (states.close) states.close();
									}}
									asChild
								>
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
										onClick={
											states.isLoading
												? undefined
												: () => {
														states.onToggleProcessing();

														if (options.onConfirm) {
															const result: any = options.onConfirm({
																close: states.close,
																toggleProcessing: states.onToggleProcessing,
															});

															if (result instanceof Promise) {
																result.then(() => states.onToggleProcessing());

																return;
															}
														}

														states.onToggleProcessing();
													}
										}
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
	const dataRef = useRef<any>(null);

	const setupOpen = (options: ModalOptions) => {
		setStack((prev) => [...prev, options]);

		setIsLoading(false);

		setIsOpen(true);
	};

	const open = (options: ModalOptions) => {
		if (stackRef.current.length > 0) {
			setIsOpen(false);

			setTimeout(() => {
				setupOpen(options);
			}, 200);

			return;
		}

		setupOpen(options);
	};

	const close = (open?: boolean) => {
		if (!open) {
			if (stackRef.current.length > 1) {
				setStack((prev) => {
					const newStack = [...prev];
					newStack.pop();
					return newStack;
				});

				setIsOpen(true);

				return;
			}

			dataRef.current = null;
			setStack([]);
			setIsOpen(open ?? false);

			return;
		}
	};

	const setData = (data: any) => {
		dataRef.current = data;
	};

	const getData = () => {
		return dataRef.current;
	};

	const closeAll = () => {
		dataRef.current = null;
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
		setData,
		getData,
	};

	return (
		<ModalContext.Provider value={value}>
			{children}
			{stack[stack.length - 1] && (
				<Dialog.Root open={isOpen} onOpenChange={close}>
					<Dialog.Portal>
						{stack[stack.length - 1].overlay ||
							(stack[stack.length - 1].overlay === undefined && (
								<Dialog.Overlay className="fixed w-full h-full inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30" />
							))}
						{createModal(stack[stack.length - 1], {
							isLoading,
							isOpen,
							onToggleOpen: () => setIsOpen((prev) => !prev),
							onToggleProcessing: (state?: boolean) =>
								state !== undefined ? setIsLoading(state) : setIsLoading((prev) => !prev),
							close: (callback) => {
								console.log("12312312312312312312313");
								if (callback) {
									const result: any = callback();

									if (result instanceof Promise) {
										result.then(() => setIsOpen(!!stackRef.current.length));
									} else {
										setIsOpen(!!stackRef.current.length);
									}
								}

								if (stackRef.current.length > 1) {
									close();
								} else {
									setIsOpen(false);

									setTimeout(() => {
										close();
									}, 200);
								}
							},
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
