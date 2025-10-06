import { Fragment, useState } from "react";
import Button from "../elements/Button";
import { SparklesIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/Tabs";
import Textarea from "../elements/Textarea";
import Image from "next/image";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import type { Meeting, DraftMeetingForm, CompleteMeetingForm } from "@/app/models/meeting_model";
import { Controller, useForm } from "react-hook-form";
import { useModal } from "@/app/contexts/ModalContext";
import {
	draftMeeting,
	completeMeeting,
	transcribeMeeting,
	generateSoapNotes,
} from "@/app/services/client_side/meetings";
import type { ErrorModel } from "@/app/models/error_model";
import { revalidatePage } from "@/app/lib/revalidate";
import { STATUSES } from "@/app/lib/constants";
import { getMeeting } from "@/app/services/client_side/meetings";
import { useSnackBar } from "@/app/contexts/SnackBarContext";

export default function MeetingRoomSidePanel({ onClose, meeting }: { onClose?: () => void; meeting: Meeting }) {
	const modal = useModal();
	const { showSnackBar } = useSnackBar();
	const [transcription, setTranscription] = useState<Meeting["transcription"]>();
	const form = useForm<DraftMeetingForm | CompleteMeetingForm>({
		defaultValues: modal.getData() ?? {
			id: meeting?.id,
			status_id: meeting?.status_id,
			soap_notes: {
				subjective: meeting?.soap_notes?.subjective || "",
				objective: meeting?.soap_notes?.objective || "",
				assessment: meeting?.soap_notes?.assessment || "",
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

			<Tabs
				className="flex flex-col flex-1"
				defaultValue="notes"
				onValueChange={async (value) => {
					if (value !== "transcription") return;

					try {
						const response = await getMeeting(meeting.id!);

						setTranscription(response.transcription);
					} catch (e) {
						const error = e as ErrorModel;
						console.error(error);
					}
				}}
			>
				<div className="flex items-center">
					<TabsList className="flex-grow">
						<TabsTrigger className="w-full" value="notes">
							Notes
						</TabsTrigger>
						<TabsTrigger className="w-full" value="transcription">
							Transcription
						</TabsTrigger>
					</TabsList>
				</div>
				<TabsContent value="notes" className="overflow-y-auto h-full">
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<div className="flex flex-col flex-1 py-3 space-y-1">
							<div className="flex flex-col space-y-1">
								<div className="flex flex-row items-center">
									<span className="font-semibold text-sm">Subjective</span>
									<Button
										className="!py-1 !px-2 ml-auto !rounded-full bg-primary-500 hover:bg-primary-600 text-white overflow-hidden !justify-end group w-8 transition-all duration-300 ease-in-out hover:w-48"
										title="Generate SOAP Notes"
										onClick={async () => {
											try {
												const soapNotes = await generateSoapNotes(meeting.id!);

												form.reset({
													...form.getValues(),
													soap_notes: soapNotes,
												});
											} catch (e) {
												const error = e as ErrorModel;
												showSnackBar({
													message: error.msg,
													success: false,
												});
											}
										}}
									>
										<span className="text-sm mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
											Generate SOAP Notes
										</span>
										<SparklesIcon className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-0" />
									</Button>
								</div>
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
									name="soap_notes.assessment"
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
						<div className="flex flex-row items-center justify-evenly mt-3 mb-3">
							<Button type="submit" onClick={() => form.setValue("status_id", 7)} label="Save Draft" secondary />
							<Button type="submit" onClick={() => form.setValue("status_id", 8)} label="Complete Visit" />
						</div>
					</form>
				</TabsContent>
				<TabsContent value="transcription" className="overflow-y-auto h-full">
					<div className="flex flex-col flex-wrap text-neutral-900 text-sm h-full">
						{transcription ? (
							<div className="flex flex-col flex-wrap space-y-3 py-5">
								{[...(transcription?.provider_segments ?? []), ...(transcription?.patient_segments ?? [])]
									.sort((a, b) => a.start - b.start)
									.map((message, index) =>
										message.text ? (
											<div key={index} className="flex flex-row space-x-2 ">
												<span className="font-semibold min-w-16 text-end capitalize">{message.speaker}:</span>
												<p>{message.text}</p>
											</div>
										) : (
											<Fragment key={index} />
										),
									)}
							</div>
						) : (
							<>
								<div className="flex flex-col w-full h-full">
									<div className="flex h-full justify-center items-center">
										<p className="font-semibold">No Transcription Found</p>
									</div>
									<Button
										onClick={async () => {
											try {
												await transcribeMeeting(meeting.id!);
											} catch (e) {
												const error = e as ErrorModel;
												showSnackBar({
													message: error.msg,
													success: false,
												});
											}
										}}
										label="Generate Transcription"
										className="w-full mt-auto"
									/>
								</div>
							</>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
