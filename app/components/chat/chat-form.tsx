"use client";

import clsx from "clsx";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useWindowSizeCheck } from "@/app/hooks/useWindowSizeCheck";
import type { ConversationMessageModel, ConversationModel } from "@/app/models/firestore/conversation_model";
import CreationForm from "./creation-form";
import Card from "../elements/Card";
import { ArrowLeft, EllipsisIcon, PlusIcon, Send, Trash2Icon } from "lucide-react";
import { DropdownMenu, Tabs } from "radix-ui";
import { onSnapshot, type QueryDocumentSnapshot, type Unsubscribe } from "firebase/firestore";
import { ConversationListSkeleton } from "./conversation-list-skeleton";
import Conversation from "./conversation";
import type { UserModel } from "@/app/models/firestore/user_model";
import { toRelativeTime } from "@/app/lib/to-relative-time";
import Loader from "../elements/Loader";
import useAuth from "@/app/hooks/useAuth";
import {
	deleteConversation,
	deleteConversationMessage,
	getConversationMessages,
	getConversations,
	postConversationMessage,
	removeParticipant,
} from "@/app/services/firestore/conversation-service";
import { getUsers } from "@/app/services/firestore/user-service";
import { FIRESTORE_LIMIT } from "@/app/lib/constants";
import {
	getConversationMessagesQuery,
	getConversationsQuery,
} from "@/app/services/firestore/queries/conversation-queries";
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

export default function ChatForm() {
	const user = useAuth();
	const modal = useModal();
	const router = useRouter();
	const { isMobile, isTablet } = useWindowSizeCheck();
	const isSmallDevice = isMobile || isTablet;

	const [isGroup, setIsGroup] = useState<boolean>();
	const [showMessageContainer, setShowMessageContainer] = useState<boolean>(!isSmallDevice);

	const [selectedConversation, setSelectedConversation] = useState<ConversationModel>();
	const selectedConversationRef = useRef<boolean | undefined>();
	const [isCreationOpen, setIsCreationOpen] = useState<boolean>(false);

	const [usersMap, setUsersMap] = useState<Record<string, UserModel>>({});
	const getUsersMap = async (userId?: string[]) => {
		const filteredUserId = userId ? userId.filter((id) => !Object.keys(usersMap).some((key) => key === id)) : [];

		const users = await getUsers({ userId: filteredUserId, limit: Number.POSITIVE_INFINITY });

		setUsersMap((prev) => {
			for (const user of users.data) {
				prev[user.id] = user;
			}

			return { ...prev };
		});
	};

	const [conversations, setConversations] = useState<ConversationModel[]>();
	const nextStartConversation = useRef<QueryDocumentSnapshot>();
	const initialIndexConversation = useRef<QueryDocumentSnapshot>();

	const handleTabChange = async (value: string) => {
		initialIndexConversation.current = undefined;
		nextStartConversation.current = undefined;
		setConversations(undefined);
		setIsGroup(value === "groups");
	};

	const handleDeleteConversation = async (conversation: ConversationModel) => {
		modal.open({
			type: "confirm",
			title: "Remove Group",
			message: "Are you sure you want to remove this group?",
			onConfirm: async () => {
				if (!conversation.id) return;

				await deleteConversation(conversation.id);

				setConversations((prev) => prev?.filter((c) => c.id !== conversation.id));

				setSelectedConversation(undefined);

				setMessages(undefined);

				modal.close();
			},
		});
	};

	const getConversationList = async (nextStart?: QueryDocumentSnapshot) => {
		const conversations = await getConversations({
			where: [["isGroup", "==", isGroup]],
			orderBy: [
				["updatedAt", "desc"],
				["__name__", "desc"],
			],
			...(nextStart && { nextAfter: nextStart }),
		});

		nextStartConversation.current = conversations.nextAfter;
		if (!conversations.hasNext) {
			nextStartConversation.current = undefined;
		}

		if (initialIndexConversation.current === undefined) {
			initialIndexConversation.current = conversations.initialDocs;
		}

		let participants: string[] = [];

		for (const conversation of conversations.data) {
			participants = [...participants, ...conversation.participants];
		}

		participants = Array.from(new Set(participants));

		if (participants.length) {
			await getUsersMap(participants);
		}
		if (!nextStart) {
			setConversations(conversations.data);
			return;
		}

		setConversations((prev) => [...(prev ? [...prev] : []), ...conversations.data]);
	};

	useEffect(() => {
		setIsGroup(false);
	}, []);

	useEffect(() => {
		if (isGroup === undefined) return;

		let unsubscribe: Unsubscribe;

		const listenConversation = async () => {
			await getConversationList();

			if (!initialIndexConversation.current) return;

			unsubscribe = onSnapshot(
				getConversationsQuery({
					where: [["isGroup", "==", isGroup]],
					orderBy: [
						["updatedAt", "asc"],
						["__name__", "asc"],
					],
					limit: FIRESTORE_LIMIT,
					nextAfter: initialIndexConversation.current,
				}),
				async (snapshot) => {
					const newRooms: ConversationModel[] = [];

					for (const change of snapshot.docChanges()) {
						if (change.type === "added") {
							newRooms.push({ ...change.doc.data(), id: change.doc.id });
						} else if (change.type === "modified") {
							newRooms.push({ ...change.doc.data(), id: change.doc.id });
						}
					}

					let participants: string[] = [];
					for (const room of newRooms) {
						participants = [...participants, ...room.participants];
					}
					participants = Array.from(new Set(participants));
					if (participants.length) {
						await getUsersMap(participants);
					}

					setConversations((prev) => {
						const filteredPrev = prev ? prev.filter((room) => !newRooms.some((newRoom) => newRoom.id === room.id)) : [];

						return [...newRooms, ...filteredPrev];
					});
				},
			);
		};

		listenConversation();

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, [isGroup]);

	const [messages, setMessages] = useState<ConversationMessageModel[]>();
	const nextStartMessage = useRef<QueryDocumentSnapshot>();
	const initialIndexMessage = useRef<QueryDocumentSnapshot>();
	const postInputRef = useRef<HTMLInputElement>(null);
	const messageContainerRef = useRef<HTMLDivElement>(null);
	const bottomMessageContainerRef = useRef<HTMLDivElement | null>(null);
	const lastMessageContainerScrollPositionRef = useRef<number>();
	const [headerName, headerUserId] = useMemo(() => {
		if (!selectedConversation) return [undefined, undefined];

		if (!usersMap) return [undefined, undefined];

		const otherParticipant = selectedConversation.participants.filter((participant) => participant !== String(user.id));

		return selectedConversation?.isGroup
			? [selectedConversation?.name]
			: [usersMap[otherParticipant[0]]?.name, otherParticipant[0]];
	}, [selectedConversation, usersMap]);

	const getMessageList = async (nextStart?: QueryDocumentSnapshot) => {
		if (!selectedConversation?.id) return;

		const response = await getConversationMessages(selectedConversation.id, {
			orderBy: [
				["updatedAt", "desc"],
				["__name__", "desc"],
			],
			...(nextStart && { nextAfter: nextStart }),
		});

		nextStartMessage.current = response.nextAfter;
		if (!response.hasNext) {
			nextStartMessage.current = undefined;
		}

		if (initialIndexMessage.current === undefined) {
			initialIndexMessage.current = response.initialDocs;
		}

		response.data.reverse();

		setMessages((prev) => {
			return [...response.data, ...(prev ? [...prev] : [])];
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

		await postConversationMessage(message, selectedConversation.id);
	};

	const handleSelectConversation = (conversation: ConversationModel) => {
		if (conversation.id === selectedConversation?.id) return;

		initialIndexMessage.current = undefined;
		setSelectedConversation(conversation);
		setShowMessageContainer(true);
		setMessages(undefined);
		nextStartMessage.current = undefined;
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

				await deleteConversationMessage(conversation.id, message.id);

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

				await removeParticipant(conversation.id, message.senderId);

				modal.close();
			},
		});
	};

	useEffect(() => {
		selectedConversationRef.current = !!selectedConversation;

		if (!selectedConversation) return;

		let unsubscribe: Unsubscribe;

		const listenMessages = async () => {
			if (!selectedConversation.id) return;

			await getMessageList();

			unsubscribe = onSnapshot(
				getConversationMessagesQuery(selectedConversation.id, {
					orderBy: [
						["updatedAt", "asc"],
						["__name__", "asc"],
					],
					limit: FIRESTORE_LIMIT,
					nextAfter: initialIndexMessage.current,
				}),
				async (snapshot) => {
					const newMessages: ConversationMessageModel[] = [];

					for (const change of snapshot.docChanges()) {
						if (change.type === "added") {
							newMessages.push({ ...change.doc.data(), id: change.doc.id });
						}
					}

					newMessages.reverse();

					setMessages((prev) => {
						const filteredNewMessages = newMessages.filter(
							(newMessage) => !prev?.some((prevMessage) => prevMessage.id === newMessage.id),
						);

						return [...(prev ? [...prev] : []), ...filteredNewMessages];
					});
				},
			);
		};

		listenMessages();

		return () => {
			setMessages(undefined);
			if (unsubscribe) unsubscribe();
		};
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
								{!conversations ? (
									<ConversationListSkeleton count={5} />
								) : (
									<Virtuoso
										data={conversations ?? []}
										components={{
											EmptyPlaceholder: () => (
												<div className="flex h-full w-full p-5 mt-auto items-center text-neutral-300 justify-center">
													<span>No conversations found</span>
												</div>
											),
											Footer: nextStartConversation.current
												? () => (
														<div className="flex w-full items-center justify-center py-5">
															<Loader />
															<span>Loading...</span>
														</div>
													)
												: undefined,
										}}
										endReached={
											nextStartConversation.current
												? () => {
														getConversationList(nextStartConversation.current);
													}
												: undefined
										}
										itemContent={(index, conversation) => {
											const conversationUser: UserModel =
												usersMap[conversation.participants.filter((participant) => participant !== String(user.id))[0]];

											return (
												<Conversation
													key={index}
													name={conversationUser?.name}
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
								{!conversations ? (
									<ConversationListSkeleton count={5} />
								) : (
									<Virtuoso
										data={conversations ?? []}
										components={{
											EmptyPlaceholder: () => (
												<div className="flex h-full w-full p-5 mt-auto items-center text-neutral-300 justify-center">
													<span>No conversations found</span>
												</div>
											),
											Footer: nextStartConversation.current
												? () => (
														<div className="flex w-full items-center justify-center py-5">
															<Loader />
															<span>Loading...</span>
														</div>
													)
												: undefined,
										}}
										endReached={
											nextStartConversation.current
												? () => {
														getConversationList(nextStartConversation.current);
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
													members={conversation.participants.length}
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
											src={headerUserId && usersMap[headerUserId]?.avatar ? usersMap[headerUserId]?.avatar : ""}
											fallback={stringToInitial(headerName)}
										/>
									)}
								</div>
								<div className="ml-3">
									{selectedConversation &&
										(headerUserId ? (
											<Link href={`/patients/${headerUserId}/edit`} target="_blank">
												<h2 className="font-semibold text-neutral-900 hover:text-neutral-600">{headerName}</h2>
											</Link>
										) : (
											<h2 className="font-semibold text-neutral-900">{headerName}</h2>
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
									Header: nextStartMessage.current
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
									nextStartMessage.current
										? () => {
												getMessageList(nextStartMessage.current);
											}
										: undefined
								}
								itemContent={(index, message) => {
									const realIndex = Math.abs(index + messages.length - 100000 - 1);

									const messageUser = message.senderId ? usersMap[message.senderId] : undefined;
									return (
										<Message
											key={index}
											isOwn={String(user.id) === message.senderId}
											isSystem={!message.senderId}
											name={
												message.senderId && messages[realIndex]?.senderId !== message?.senderId
													? usersMap[message.senderId]?.name
													: undefined
											}
											avatar={messageUser?.avatar ?? ""}
											allowOption={!!message.senderId}
											onArchive={async () => handleRemoveMessage(selectedConversation, message)}
											onKick={isGroup ? async () => handleKickParticipant(selectedConversation, message) : undefined}
											onViewProfile={
												message.senderId && !usersMap[message.senderId]?.isAdmin
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
