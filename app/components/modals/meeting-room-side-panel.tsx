import { useState } from "react";
import Card from "../elements/Card";
import Button from "../elements/Button";
import { CreditCardIcon, FileTextIcon, MicIcon, UserIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/Tabs";
import Textarea from "../elements/Textarea";
import Image from "next/image";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import type {
	MeetingSoapNotes,
	Meeting,
	MeetingForm,
	DraftMeetingForm,
	CompleteMeetingForm,
} from "@/app/models/meeting_model";
import { Controller, useForm } from "react-hook-form";
import { useModal } from "@/app/contexts/ModalContext";
import { draftMeeting, completeMeeting } from "@/app/services/client_side/meetings";
import type { ErrorModel } from "@/app/models/error_model";
import { revalidatePage } from "@/app/lib/revalidate";
import { STATUSES } from "@/app/lib/constants";

export default function MeetingRoomSidePanel({ onClose, meeting }: { onClose?: () => void; meeting: Meeting }) {
	const modal = useModal();
	const form = useForm<DraftMeetingForm | CompleteMeetingForm>({
		defaultValues: modal.getData() ?? {
			id: meeting?.id,
			status_id: meeting?.status_id,
			soap_notes: {
				subjective: meeting?.soap_notes?.subjective || "",
				objective: meeting?.soap_notes?.objective || "",
				assestment: meeting?.soap_notes?.assestment || "",
				progress: meeting?.soap_notes?.progress || "",
			},
		},
	});

	const onSubmit = (data: DraftMeetingForm | CompleteMeetingForm) => {
		modal.setData(data);

		modal.open({
			type: "confirm",
			title: "Notes",
			message: "Are you sure you want to process this meeting notes?",
			onConfirm: async () => {
				try {
					const payload = {
						id: meeting.id!,
						body: data,
					};
					const response =
						data.status_id === STATUSES.INCOMPLETE ? await draftMeeting(payload) : await completeMeeting(payload);

					revalidatePage("/telehealth");

					modal.closeAll();
				} catch (e) {
					const error = e as ErrorModel;

					modal.open({
						type: "alert",
						title: "Error",
						message: error.msg,
						onClose: () => modal.close(),
					});
				}
			},
		});
	};

	return (
		<div className="flex flex-col space-y-3 h-full py-3 px-5">
			{onClose && (
				<div className="flex flex-row items-center text-neutral-900">
					<Image src={ArrowLeft} alt="Arrow left" className="cursor-pointer" onClick={() => onClose?.()} />
					<p className="text-2xl font-semibold ml-2">Visit Details</p>
				</div>
			)}

			<Tabs defaultValue="notes">
				<div className="flex items-center">
					<TabsList className="flex-grow">
						<TabsTrigger className="w-full" value="notes">
							Notes
						</TabsTrigger>
						<TabsTrigger className="w-full" value="transcript">
							Transcript
						</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="notes" className="overflow-y-auto h-full">
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col flex-1 py-3 space-y-1">
							<div className="flex flex-col space-y-1">
								<span className="font-semibold text-sm">Subjective</span>
								<Controller
									name="soap_notes.subjective"
									control={form.control}
									render={({ field }) => (
										<Textarea
											className="resize-none !h-auto"
											placeholder="Write your notes..."
											value={field.value}
											onChange={field.onChange}
											rows={5}
										/>
									)}
								/>
							</div>
							<div className="flex flex-col space-y-1">
								<span className="font-semibold text-sm">Objective</span>
								<Controller
									name="soap_notes.objective"
									control={form.control}
									render={({ field }) => (
										<Textarea
											className="resize-none !h-auto"
											placeholder="Write your notes..."
											value={field.value}
											onChange={field.onChange}
											rows={5}
										/>
									)}
								/>
							</div>
							<div className="flex flex-col space-y-1">
								<span className="font-semibold text-sm">Assessment</span>
								<Controller
									name="soap_notes.assestment"
									control={form.control}
									render={({ field }) => (
										<Textarea
											className="resize-none !h-auto"
											placeholder="Write your notes..."
											value={field.value}
											onChange={field.onChange}
											rows={5}
										/>
									)}
								/>
							</div>
							<div className="flex flex-col space-y-1">
								<span className="font-semibold text-sm">Progress</span>
								<Controller
									name="soap_notes.progress"
									control={form.control}
									render={({ field }) => (
										<Textarea
											className="resize-none !h-auto"
											placeholder="Write your notes..."
											value={field.value}
											onChange={field.onChange}
											rows={5}
										/>
									)}
								/>
							</div>
						</div>
						<div className="flex flex-row items-center justify-evenly mt-3">
							<Button type="submit" onClick={() => form.setValue("status_id", 7)} label="Save Draft" secondary />
							<Button type="submit" onClick={() => form.setValue("status_id", 8)} label="Complete Visit" />
						</div>
					</form>
				</TabsContent>
			</Tabs>
		</div>
	);
}
