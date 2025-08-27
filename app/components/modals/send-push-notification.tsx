import type { PatientModel } from "@/app/models/patient_model";
import { useState } from "react";
import Button from "../elements/Button";
import { useModal } from "@/app/contexts/ModalContext";
import Input from "../elements/Input";
import Textarea from "../elements/Textarea";
import { sendPushNotification } from "@/app/services/client_side/notifications";
import type { ErrorModel } from "@/app/models/error_model";
import { useSnackBar } from "@/app/contexts/SnackBarContext";

export default function SendPushNotificationModal() {
	const modal = useModal();
	const { showSnackBar } = useSnackBar();
	const [title, setTitle] = useState<string>("");
	const [description, setDescription] = useState<string>("");
	const [isProcessing, setIsProcessing] = useState<boolean>(false);

	const onSend = () => {
		modal.open({
			title: "Send Push Notification",
			type: "confirm",
			message: "Are you sure you want to send this notification?",
			onConfirm: async () => {
				try {
					await sendPushNotification({ title, description });

					showSnackBar({
						message: "Notification successfully sent",
						success: true,
					});

					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;

					modal.open({
						title: "Attention!",
						type: "alert",
						message: error.msg,
						onClose: () => modal.close(),
					});
				}
			},
		});
	};

	return (
		<div className=" w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
			<p className="text-neutral-600 mb-2">
				Sends real-time alerts and updates directly to users’ devices, even when the app isn’t open.
			</p>
			<div className="flex flex-col space-y-5">
				<div className="w-full">
					<p className="font-medium mb-2">Title</p>
					<Input
						type="text"
						placeholder={"Enter the notification title"}
						value={title}
						onChange={(e) => setTitle(e.currentTarget.value)}
					/>
				</div>
				<div className="w-full">
					<p className="font-medium mb-2">Description</p>
					<Textarea
						placeholder={"Enter the notification description"}
						rows={8}
						className="resize-none !h-auto"
						value={description}
						onChange={(e) => setDescription(e.currentTarget.value)}
					/>
				</div>
			</div>
			<div className="flex justify-center space-x-3 mt-9">
				<Button label="Cancel" secondary onClick={() => modal.close()} className="sm:px-[50px]" />
				<Button label={"Send"} onClick={onSend} className="sm:px-[50px]" isProcessing={isProcessing} />
			</div>
		</div>
	);
}
