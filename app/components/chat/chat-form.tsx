"use client";

import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import type { ConversationMessageModel, ConversationModel } from "@/app/models/chat_model";
import CreationForm from "./creation-form";
import Card from "../elements/Card";
import { ArrowLeft, EllipsisIcon, PlusIcon, Send, Trash2Icon } from "lucide-react";
import { DropdownMenu, Tabs } from "radix-ui";
import { ConversationListSkeleton } from "./conversation-list-skeleton";
import Conversation from "./conversation";
import { toRelativeTime } from "@/app/lib/to-relative-time";
import Loader from "../elements/Loader";
import useAuth from "@/app/hooks/useAuth";
import { stringToInitial } from "@/app/lib/string-to-initial";
import Avatar from "../elements/Avatar";
import Message from "./message";
import { MessageListSkeleton } from "./message-list-skeleton";
import Input from "../elements/Input";
import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import { Virtuoso } from "react-virtuoso";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLogout } from "@/app/hooks/useLogout";
import socketClient from "@/app/services/socket-client";
import {
	deleteGroup,
	deleteGroupMessage,
	getGroupConversationMessages,
	getGroupConversations,
	getProviderConversationMessages,
	getProviderConversations,
	kickGroupParticipant,
} from "@/app/services/client_side/chats";

export default function ChatForm() {
	const user = useAuth();
	const logout = useLogout();
	const modal = useModal();
	const router = useRouter();
	const { isMobile, isTablet } = useWindowSizeCheck();
	const isSmallDevice = isMobile || isTablet;

	const [isGroup, setIsGroup] = useState<boolean>(false);
	const [showMessageContainer, setShowMessageContainer] = useState<boolean>(!isSmallDevice);

	const [selectedConversation, setSelectedConversation] = useState<ConversationModel>();
	const selectedConversationRef = useRef<boolean | undefined>();
	const [isCreationOpen, setIsCreationOpen] = useState<boolean>(false);

	const providerChatSocket = useMemo(() => socketClient({ namespace: "chat-provider" }), []);

	const groupChatSocket = useMemo(() => socketClient({ namespace: "chat-group" }), []);

	useEffect(() => {
		getProviderConversationList();

		getGroupConversationList();

		providerChatSocket.connect();

		providerChatSocket.on("conversation", (data) => {
			setProviderConversations((prev) => {
				const filteredPrev = prev ? prev.filter((conversation) => conversation.id !== data.id) : [];

				return [data, ...filteredPrev];
			});
		});

		groupChatSocket.connect();

		groupChatSocket.on("conversation", (data) => {
			setGroupConversations((prev) => {
				const filteredPrev = prev ? prev.filter((conversation) => conversation.id !== data.id) : [];

				return [data, ...filteredPrev];
			});
		});

		return () => {
			providerChatSocket.disconnect();

			groupChatSocket.disconnect();
		};
	}, []);

	const [providerConversations, setProviderConversations] = useState<ConversationModel[]>();
	const [groupConversations, setGroupConversations] = useState<ConversationModel[]>();
	const providerConversationNextPageId = useRef<string>();
	const groupConversationNextPageId = useRef<string>();

	const handleTabChange = async (value: string) => {
		setIsGroup(value === "groups");
	};

	const handleDeleteConversation = async (conversation: ConversationModel) => {
		modal.open({
			type: "confirm",
			title: "Remove Group",
			message: "Are you sure you want to remove this group?",
			onConfirm: async () => {
				if (!conversation.id) return;

				await deleteGroup(conversation.id);

				setGroupConversations((prev) => prev?.filter((c) => c.id !== conversation.id));

				setSelectedConversation(undefined);

				setMessages(undefined);

				modal.close();
			},
		});
	};

	const getProviderConversationList = async (nextPageId?: string) => {
		try {
			const conversations = await getProviderConversations({
				next_page_id: nextPageId,
			});

			providerConversationNextPageId.current = undefined;
			if (conversations.has_next_page) {
				providerConversationNextPageId.current = conversations.next_page_id;
			}

			if (!nextPageId) {
				setProviderConversations(conversations.data);
				return;
			}

			setProviderConversations((prev) => [...(prev ? [...prev] : []), ...conversations.data]);
		} catch (error) {
			setProviderConversations([]);
		}
	};

	const getGroupConversationList = async (nextPageId?: string) => {
		try {
			const conversations = await getGroupConversations({
				next_page_id: nextPageId,
			});

			groupConversationNextPageId.current = undefined;
			if (conversations.has_next_page) {
				groupConversationNextPageId.current = conversations.next_page_id;
			}

			if (!nextPageId) {
				setGroupConversations(conversations.data);
				return;
			}

			setGroupConversations((prev) => [...(prev ? [...prev] : []), ...conversations.data]);
		} catch (error) {
			setGroupConversations([]);
		}
	};

	const [messages, setMessages] = useState<ConversationMessageModel[]>();
	const messageNextPageId = useRef<string>();
	const postInputRef = useRef<HTMLInputElement>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);
	const bottomMessageContainerRef = useRef<HTMLDivElement | null>(null);
	const lastMessageContainerScrollPositionRef = useRef<number>();
	const headerInfo = useMemo(() => {
		if (!selectedConversation) return null;

		const { participants } = selectedConversation;

		const otherParticipant = Object.entries(participants).find(
			([participantId, _]) => participantId !== String(user.id),
		);

		return {
			isGroup: selectedConversation.isGroup,
			userId: otherParticipant?.[0],
			...otherParticipant?.[1],
			...(selectedConversation.isGroup ? { name: selectedConversation.name } : { name: otherParticipant?.[1]?.name }),
		};
	}, [selectedConversation]);

	const getProviderMessageList = async (nextPageId?: string) => {
		if (!selectedConversation?.id) return;

		const messages = await getProviderConversationMessages({ next_page_id: nextPageId, id: selectedConversation.id });

		messageNextPageId.current = undefined;
		if (messages.has_next_page) {
			messageNextPageId.current = messages.next_page_id;
		}

		messages.data.reverse();

		if (!nextPageId) {
			setMessages(messages.data);
			return;
		}

		setMessages((prev) => {
			return [...messages.data, ...(prev ? [...prev] : [])];
		});
	};

	const getGroupMessageList = async (nextPageId?: string) => {
		if (!selectedConversation?.id) return;

		const messages = await getGroupConversationMessages({
			next_page_id: nextPageId,
			id: selectedConversation.id,
		});

		messageNextPageId.current = undefined;
		if (messages.has_next_page) {
			messageNextPageId.current = messages.next_page_id;
		}

		messages.data.reverse();

		if (!nextPageId) {
			setMessages(messages.data);
			return;
		}

		setMessages((prev) => {
			return [...messages.data, ...(prev ? [...prev] : [])];
		});
	};

	const handlePostMessage = async () => {
		if (!postInputRef.current) return;

		const message = postInputRef.current.value;

		if (!message.trim()) return;

		postInputRef.current.value = "";

		if (!selectedConversation?.id) return;

		if (messageContainerRef.current) {
			lastMessageContainerScrollPositionRef.current = messageContainerRef.current.scrollTop;
		}

		if (!selectedConversation.isGroup) {
			providerChatSocket.emit("message", {
				message: message,
				conversation_id: selectedConversation.id,
			});
			return;
		}

		groupChatSocket.emit("message", {
			message: message,
			conversation_id: selectedConversation.id,
		});
	};

	const handleSelectConversation = (conversation: ConversationModel) => {
		if (conversation.id === selectedConversation?.id) return;

		if (selectedConversation) {
			providerChatSocket.emit("leave", { roomId: selectedConversation.id });
			groupChatSocket.emit("leave", { roomId: selectedConversation.id });
		}

		if (conversation.isGroup) {
			groupChatSocket.emit("join", { roomId: conversation.id });

			groupChatSocket.on("reply", (data) => {
				setMessages((prev) => [...(prev ?? []), data]);
			});
		} else {
			providerChatSocket.emit("join", { roomId: conversation.id });

			providerChatSocket.on("reply", (data) => {
				setMessages((prev) => [...(prev ?? []), data]);
			});
		}

		// initialIndexMessage.current = undefined;
		setSelectedConversation(conversation);
		setShowMessageContainer(true);
		setMessages(undefined);
		messageNextPageId.current = undefined;
		lastMessageContainerScrollPositionRef.current = undefined;

		if (bottomMessageContainerRef.current) {
			bottomMessageContainerRef.current.scrollIntoView({ behavior: "instant", block: "end" });
		}
	};

	const handleRemoveMessage = async (conversation: ConversationModel, message: ConversationMessageModel) => {
		modal.open({
			type: "confirm",
			title: "Remove Message",
			message: "Are you sure you want to remove this message?",
			onConfirm: async () => {
				if (!conversation.id) return;

				if (!message.id) return;

				await deleteGroupMessage(conversation.id, message.id);

				setMessages((prev) => {
					const filteredPrev = prev ? prev.filter((msg) => msg.id !== message.id) : [];

					return [...filteredPrev];
				});

				modal.close();
			},
		});
	};

	const handleKickParticipant = async (conversation: ConversationModel, message: ConversationMessageModel) => {
		modal.open({
			type: "confirm",
			title: "Kick Member",
			message: "Are you sure you want to kick this member?",
			onConfirm: async () => {
				if (!conversation.id) return;

				if (!message.senderId) return;

				await kickGroupParticipant(conversation.id, message.senderId);

				modal.close();
			},
		});
	};

	useEffect(() => {
		selectedConversationRef.current = !!selectedConversation;

		if (!selectedConversation) return;

		if (!selectedConversation.isGroup) {
			getProviderMessageList();
			return;
		}

		getGroupMessageList();
	}, [selectedConversation]);

	return (
		<>
			<Card
				className={clsx(
					"w-full h-full md:min-w-96 md:w-96 flex !p-0 rounded-xl",
					!isSmallDevice || (isSmallDevice && !showMessageContainer && !isCreationOpen) ? "flex" : "hidden",
				)}
			>
				<div className="w-full border-r border-neutral-200 flex flex-col rounded-xl">
					<div className="p-4 border-b border-neutral-200">
						<div className="flex items-center justify-between mb-4">
							<h1 className="text-xl font-semibold text-neutral-900">Messages</h1>
							{isGroup && (
								<div
									onClick={() => {
										setIsCreationOpen(true);
										setShowMessageContainer(false);
									}}
									onKeyDown={undefined}
									className="cursor-pointer  rounded-full text-neutral-900 hover:text-neutral-600"
									title="Create Group"
								>
									<PlusIcon className="h-6 w-6" />
								</div>
							)}
						</div>

						<div className="relative">
							{/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" /> */}
							{/* <Input placeholder="Search conversations..." className="pl-10 bg-gray-50 border-gray-200" /> */}
						</div>
					</div>

					{/* Tabs */}
					<Tabs.Root
						defaultValue={!isGroup ? "personal" : "groups"}
						onValueChange={handleTabChange}
						className="flex flex-col h-full p-0 overflow-y-auto rounded-ee-xl rounded-es-xl"
					>
						<Tabs.List className="grid w-full grid-cols-2 p-3">
							<Tabs.Trigger
								value="personal"
								className="data-[state=active]:bg-primary-500 data-[state=active]:text-white bg-neutral-100 text-neutral-800 p-2 rounded-ss-xl rounded-es-xl"
							>
								Personal
							</Tabs.Trigger>
							<Tabs.Trigger
								value="groups"
								className="data-[state=active]:bg-primary-500 data-[state=active]:text-white bg-neutral-100 text-neutral-800 p-2 rounded-se-xl rounded-ee-xl"
							>
								Groups
							</Tabs.Trigger>
						</Tabs.List>

						<div className="flex-1 overflow-y-auto">
							<Tabs.Content value="personal" className="mt-0 h-full">
								{!providerConversations ? (
									<ConversationListSkeleton count={5} />
								) : (
									<Virtuoso
										data={providerConversations ?? []}
										components={{
											EmptyPlaceholder: () => (
												<div className="flex h-full w-full p-5 mt-auto items-center text-neutral-300 justify-center">
													<span>No conversations found</span>
												</div>
											),
											Footer: providerConversationNextPageId.current
												? () => (
														<div className="flex w-full items-center justify-center py-5">
															<Loader />
															<span>Loading...</span>
														</div>
													)
												: undefined,
										}}
										endReached={
											providerConversationNextPageId.current
												? () => {
														getProviderConversationList(providerConversationNextPageId.current);
													}
												: undefined
										}
										itemContent={(index, conversation) => {
											const conversationUser = Object.entries(conversation.participants)[0][1];
											return (
												<Conversation
													key={index}
													name={conversationUser?.name ?? ""}
													avatar={conversationUser?.avatar ?? ""}
													message={conversation?.lastMessage?.message}
													timestamp={toRelativeTime(conversation.updatedAt)}
													active={conversation.id === selectedConversation?.id}
													onClick={() => handleSelectConversation(conversation)}
												/>
											);
										}}
									/>
								)}
							</Tabs.Content>

							<Tabs.Content value="groups" className="mt-0 h-full">
								{!groupConversations ? (
									<ConversationListSkeleton count={5} />
								) : (
									<Virtuoso
										data={groupConversations ?? []}
										components={{
											EmptyPlaceholder: () => (
												<div className="flex h-full w-full p-5 mt-auto items-center text-neutral-300 justify-center">
													<span>No conversations found</span>
												</div>
											),
											Footer: groupConversationNextPageId.current
												? () => (
														<div className="flex w-full items-center justify-center py-5">
															<Loader />
															<span>Loading...</span>
														</div>
													)
												: undefined,
										}}
										endReached={
											groupConversationNextPageId.current
												? () => {
														getGroupConversationList(groupConversationNextPageId.current);
													}
												: undefined
										}
										itemContent={(index, conversation) => {
											return (
												<Conversation
													key={index}
													isGroup={true}
													name={conversation.name}
													message={conversation?.lastMessage?.message}
													members={Object.keys(conversation.participants).length}
													timestamp={toRelativeTime(conversation.updatedAt)}
													active={conversation.id === selectedConversation?.id}
													onClick={() => handleSelectConversation(conversation)}
												/>
											);
										}}
									/>
								)}
							</Tabs.Content>
						</div>
					</Tabs.Root>
				</div>
			</Card>
			<Card
				className={clsx(
					"h-full flex-1 !p-0 rounded-xl",
					(!isSmallDevice && !isCreationOpen) || (showMessageContainer && !isCreationOpen) ? "flex" : "hidden",
				)}
			>
				<div className="flex flex-col w-full rounded-xl">
					<div className="p-4 border-b border-neutral-200">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								{isSmallDevice && (
									<div
										onClick={() => {
											setShowMessageContainer(false);
											setSelectedConversation(undefined);
										}}
										onKeyDown={undefined}
										className={clsx("cursor-pointer mr-3")}
									>
										<ArrowLeft size={24} className="text-neutral-900 hover:text-neutral-500" />
									</div>
								)}

								<div className="w-12 h-12">
									{selectedConversation && (
										<Avatar
											src={headerInfo?.userId ? (headerInfo?.avatar ?? "") : ""}
											fallback={stringToInitial(headerInfo?.name ?? "")}
										/>
									)}
								</div>
								<div className="ml-3">
									{selectedConversation &&
										(headerInfo?.userId ? (
											<Link href={`/patients/${headerInfo?.userId}/edit`} target="_blank">
												<h2 className="font-semibold text-neutral-900 hover:text-neutral-600">
													{headerInfo?.name ?? ""}
												</h2>
											</Link>
										) : (
											<h2 className="font-semibold text-neutral-900">{headerInfo?.name ?? ""}</h2>
										))}
								</div>
							</div>
							{selectedConversation?.isGroup && (
								<div className="flex items-center space-x-2">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger asChild className="cursor-pointer">
											<EllipsisIcon className="h-5 w-5 text-neutral-900 hover:text-neutral-600" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content
											align="end"
											className="w-38 drop-shadow-center text-xs p-1 bg-white rounded-md z-10 text-neutral-900"
										>
											<DropdownMenu.Item
												onClick={() => {
													handleDeleteConversation(selectedConversation);
												}}
												className="cursor-pointer p-2 bg-white flex items-center justify-center outline-none hover:bg-primary-100"
											>
												<Trash2Icon className="mr-2 h-4 w-4" />
												<span>Delete Group</span>
											</DropdownMenu.Item>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</div>
							)}
						</div>
					</div>

					<div className="flex-1 overflow-y-auto justify-end px-4 py-2 flex flex-col-reverse bg-white">
						{selectedConversation && messages ? (
							<Virtuoso
								data={messages ?? []}
								alignToBottom={true}
								firstItemIndex={100000 - messages.length}
								totalCount={100000}
								components={{
									EmptyPlaceholder: () => (
										<div className="flex h-full w-full px-5 items-center justify-center">
											<span>Start sending messages...</span>
										</div>
									),
									Header: messageNextPageId.current
										? () => (
												<div className="flex w-full items-center justify-center">
													<Loader />
													<span>Loading...</span>
												</div>
											)
										: undefined,

									List: React.forwardRef((props, ref) => {
										return <div ref={ref} {...props} className="space-y-1" />;
									}),
								}}
								initialTopMostItemIndex={messages.length}
								startReached={
									messageNextPageId.current
										? () => {
												if (!selectedConversation.isGroup) {
													getProviderMessageList(messageNextPageId.current);
													return;
												}
												getGroupMessageList(messageNextPageId.current);
											}
										: undefined
								}
								itemContent={(index, message) => {
									const realIndex = Math.abs(index + messages.length - 100000 - 1);

									const messageUser = Object.entries(selectedConversation.participants).find(
										([participantId, participant]) => participantId === message.senderId,
									)?.[1];

									return (
										<Message
											key={index}
											isOwn={String(user.id) === message.senderId}
											isSystem={!message.senderId}
											name={
												message.senderId && messages[realIndex]?.senderId !== message?.senderId
													? (messageUser?.name ?? "")
													: undefined
											}
											avatar={messageUser?.avatar ?? ""}
											allowOption={!!message.senderId}
											onArchive={async () => handleRemoveMessage(selectedConversation, message)}
											onKick={isGroup ? async () => handleKickParticipant(selectedConversation, message) : undefined}
											onViewProfile={
												message.senderId && !messageUser?.isAdmin
													? () => {
															if (message.senderId) {
																router.push(`/patients/${message.senderId}/edit`);
															}
														}
													: undefined
											}
											message={message.message}
											timestamp={toRelativeTime(message.createdAt)}
										/>
									);
								}}
							/>
						) : selectedConversation && !messages ? (
							<MessageListSkeleton count={6} />
						) : (
							<div className="flex h-full w-full px-5 items-center !pb-0 text-neutral-300 justify-center">
								<span>No conversation selected</span>
							</div>
						)}
					</div>

					<div className="p-4 border-t w-full border-gray-200">
						{selectedConversation && (
							<div className="flex items-center justify-center space-x-2">
								<Input
									ref={postInputRef}
									onChange={(e) => () => {}}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handlePostMessage();
										}
									}}
									placeholder="Type a message..."
									containerClassName="w-full"
								/>
								<Button
									icon={<Send className="h-4 w-4" />}
									label=""
									type="submit"
									className=" text-white px-2"
									onClick={handlePostMessage}
									onKeyDown={() => {}}
								/>
							</div>
						)}
					</div>
				</div>
			</Card>
			{isCreationOpen && (
				<CreationForm
					onBack={() => {
						if (!isSmallDevice) {
							setShowMessageContainer(true);
						}
						setIsCreationOpen(false);
					}}
				/>
			)}
		</>
	);
}
