import { forwardRef } from "react";
import Avatar from "../elements/Avatar";
import { stringToInitial } from "@/app/lib/string-to-initial";
import { Popover } from "radix-ui";
import Button from "../elements/Button";
import { ArchiveIcon, BanIcon, EllipsisIcon, MoreVerticalIcon, UserIcon } from "lucide-react";
import clsx from "clsx";

type MessageProps = {
	className?: string;
	isOwn: boolean;
	isSending?: boolean;
	isSystem: boolean;
	name?: string;
	avatar?: string;
	avatarFallback?: string;
	message: string;
	timestamp: string;
	onArchive?: () => void;
	onKick?: () => void;
	onViewProfile?: () => void;
	allowOption?: boolean;
};

const MessageOptions = ({
	onArchive,
	onKick,
	onViewProfile,
}: { onArchive?: () => void; onKick?: () => void; onViewProfile?: () => void }) => {
	return (
		<div className="self-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
			{/* <div className="flex items-center justify-center h-8 w-8 p-0 bg-white shadow-md hover:bg-primary-50 border cursor-pointer border-neutral-200 rounded-full">
				<ArchiveIcon className="h-4 w-4 text-neutral-900" />
			</div> */}
			<Popover.Root>
				<Popover.Trigger asChild>
					<div className="h-6 w-6 flex items-center justify-center p-0 bg-white shadow-md hover:bg-neutral-50 border border-neutral-200 rounded-full cursor-pointer">
						<EllipsisIcon className="h-4 w-4 text-neutral-600" />
					</div>
				</Popover.Trigger>
				<Popover.Content
					className="w-24 z-20 p-1 outline-none rounded-md drop-shadow-center bg-white text-xs"
					align="end"
				>
					<div className="space-y-1">
						{onViewProfile && (
							<div
								className="w-full flex justify-start text-left cursor-pointer hover:bg-primary-100 bg-white p-2"
								onKeyDown={undefined}
								onClick={onViewProfile}
							>
								<UserIcon className="mr-2 h-4 w-4" />
								Profile
							</div>
						)}
						<div
							className="w-full flex justify-start text-left cursor-pointer hover:bg-primary-100 bg-white p-2"
							onKeyDown={undefined}
							onClick={onArchive}
						>
							<ArchiveIcon className="mr-2 h-4 w-4" />
							Remove
						</div>
						{onKick && (
							<div
								className="w-full flex justify-start text-left cursor-pointer hover:bg-primary-100 bg-white p-2"
								onKeyDown={undefined}
								onClick={onKick}
							>
								<BanIcon className="mr-2 h-4 w-4" />
								Kick
							</div>
						)}
					</div>
				</Popover.Content>
			</Popover.Root>
		</div>
	);
};

const Message = forwardRef<HTMLDivElement, MessageProps>(
	(
		{
			isOwn,
			isSending = false,
			isSystem = false,
			name,
			avatar,
			avatarFallback,
			message,
			timestamp,
			onArchive,
			onKick,
			onViewProfile,
			allowOption,
			className,
		},
		ref,
	) => {
		return (
			<div ref={ref} className={clsx("flex items-end space-x-2", isOwn ? "justify-end" : "justify-start", className)}>
				{!isOwn && (avatar || avatarFallback) && (
					<div className="flex-shrink-0 overflow-hidden h-8 w-8">
						<Avatar
							src={avatar ?? ""}
							fallback={stringToInitial(avatarFallback)}
							className="w-full h-full object-cover"
						/>
					</div>
				)}

				<div className={clsx("relative", isSystem ? "w-full" : "")}>
					{!isOwn && name && <p className="text-xs text-neutral-500 mb-1 ml-2">{name}</p>}
					<div className={clsx("flex group space-x-2", isSystem ? "items-center justify-center" : "")}>
						{isOwn && allowOption && <MessageOptions onArchive={onArchive} />}
						<div
							className={clsx(
								"max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
								isOwn
									? isSending
										? "bg-primary-300 text-white"
										: "bg-primary-500 text-white"
									: "bg-neutral-100 text-neutral-900",
								isSystem ? "text-center selft-center bg-transparent !text-neutral-300 text-xs" : "",
							)}
						>
							<p className="text-sm">{message}</p>
							<p
								className={clsx(
									"text-xs mt-1",
									isOwn ? "text-primary-100" : "text-neutral-500",
									isSystem ? "!text-neutral-300" : "",
								)}
							>
								{isSending ? "sending..." : timestamp}
							</p>
						</div>
						{!isOwn && allowOption && (
							<MessageOptions onArchive={onArchive} onKick={onKick} onViewProfile={onViewProfile} />
						)}
					</div>
				</div>
			</div>
		);
	},
);

Message.displayName = "Message";

export default Message;
