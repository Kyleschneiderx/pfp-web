import { forwardRef } from "react";
import Avatar from "../elements/Avatar";
import Badge from "../elements/Badge";
import { stringToInitial } from "@/app/lib/string-to-initial";

interface ConversationProps extends React.HTMLAttributes<HTMLDivElement> {
	avatar?: string;
	name: string;
	message: string;
	timestamp: string;
	isGroup?: boolean;
	members?: number;
	unread?: number;
	online?: boolean;
	active?: boolean;
}

const Conversation = forwardRef<HTMLDivElement, ConversationProps>(
	({ avatar, name, message, timestamp, isGroup = false, members, online, active = false, onClick, unread }, ref) => {
		return (
			<div
				onClick={onClick}
				ref={ref}
				onKeyDown={undefined}
				className={`flex text-neutral-900 items-center p-3 hover:bg-primary-50 cursor-pointer transition-colors ${
					active ? "bg-primary-100 border-r-2 border-primary-300" : ""
				}`}
			>
				<div className="relative">
					<div className="flex justify-center items-center h-12 w-12">
						<Avatar src={avatar ?? ""} fallback={stringToInitial(name)} />
					</div>
					{!isGroup && online && (
						<div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
					)}
				</div>
				<div className="ml-3 flex-1 min-w-0">
					<div className="flex items-center justify-between">
						<h3 className="font-medium truncate">{name}</h3>
						<span className="text-xs text-neutral-500">{timestamp}</span>
					</div>
					<div className="flex items-center justify-between">
						<p className="text-sm text-neutral-600 truncate">{message}</p>
						{unread && unread > 0 && (
							<Badge
								label={`${unread}`}
								className="bg-primary-500 hover:bg-primary-600 text-white text-xs p-1 rounded-full !mr-0"
							/>
						)}
					</div>
					{isGroup && <p className="text-xs text-neutral-500">{members} members</p>}
				</div>
			</div>
		);
	},
);

Conversation.displayName = "Conversation";

export default Conversation;
