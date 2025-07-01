import { ArrowLeft, UsersIcon } from "lucide-react";
import Button from "../elements/Button";
import Input from "../elements/Input";
import { useRef, useState } from "react";
import Card from "../elements/Card";
import { createGroupConversation } from "@/app/services/firestore/conversation-service";

export default function CreationForm({ onBack }: { onBack?: () => void }) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState<boolean>(false);

	const handleCreateGroup = async () => {
		if (!inputRef.current) return;
		setLoading(true);

		const groupName = inputRef.current.value;

		inputRef.current.value = "";

		if (!groupName.trim()) {
			setLoading(false);
			return;
		}

		await createGroupConversation(groupName);

		setLoading(false);
	};

	return (
		<Card className="h-full w-full !p-0 flex flex-col">
			<div className="flex p-4 border-b border-gray-200">
				<div className="flex items-center">
					<div
						onClick={onBack}
						onKeyDown={undefined}
						className="mr-3 cursor-pointer text-neutral-900 hover:text-neutral-600"
					>
						<ArrowLeft className="h-5 w-5" />
					</div>
					<div>
						<h2 className="font-semibold text-gray-900">Create Group</h2>
						{/* <p className="text-sm text-gray-500">Add members and choose a group name</p> */}
					</div>
				</div>
			</div>

			<div className="flex flex-col flex-1 items-center justify-center p-8 bg-primary-50">
				<div className="w-full max-w-md space-y-8">
					{/* <div className="flex flex-row h-auto w-full md:w-1/2 lg:w-full xl:w-1/2 mb-5 items-center justify-center">
            <div className="w-1/2">
              <UsersIcon className="w-full h-full text-neutral-200" />
            </div>
          </div> */}
					<div className="text-center">
						<div className="mx-auto w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
							<UsersIcon className="h-12 w-12 text-white" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">Create New Group</h3>
						<p className="text-neutral-600 text-sm">
							Give your group a name to get started. You can add members and customize settings later.
						</p>
					</div>
					<div className="space-y-2">
						<span>Group Name</span>
						<Input ref={inputRef} onChange={() => {}} placeholder="Enter group name..." className="w-full" />
					</div>
				</div>
			</div>

			<div className="flex p-4 border-t border-gray-200">
				<Button
					label="Create Group"
					onClick={handleCreateGroup}
					type="button"
					isProcessing={loading}
					className="flex-1"
				/>
			</div>
		</Card>
	);
}
