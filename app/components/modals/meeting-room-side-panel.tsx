import { Fragment, useEffect, useState } from "react";
import Button from "../elements/Button";
import { PlusIcon, SparklesIcon, TrashIcon, XIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../elements/Tabs";
import Textarea from "../elements/Textarea";
import Image from "next/image";
import ArrowLeft from "@/public/svg/arrow-left.svg";
import type {
	Meeting,
	DraftMeetingForm,
	CompleteMeetingForm,
	MeetingSoapNotes,
	MeetingSoapNotesIcdCodes,
	MeetingSoapNotesCptCodes,
} from "@/app/models/meeting_model";
import { Controller, type ControllerRenderProps, useForm } from "react-hook-form";
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
import type { Selection } from "@/app/models/selection_model";
import { getSelections } from "@/app/services/client_side/selections";
import SelectCmp from "../elements/SelectCmp";
import Input from "../elements/Input";
import { getPersonalizedPfPlan } from "@/app/services/client_side/patients";
import type { PfPlanModel } from "@/app/models/pfplan_model";
import CustomizePfPlanListModal from "./customize-pf-plan-list-modal";
import { getPfPlans } from "@/app/services/client_side/pfplans";
import Link from "next/link";
import { Virtuoso } from "react-virtuoso";
import type { PaginationModel } from "@/app/models/global_model";
import Loader from "../elements/Loader";
import { useInView } from "react-intersection-observer";

export default function MeetingRoomSidePanel({ onClose, meeting }: { onClose?: () => void; meeting: Meeting }) {
	const modal = useModal();
	const modalData = modal.getData();
	const { showSnackBar } = useSnackBar();
	const [transcription, setTranscription] = useState<Meeting["transcription"]>();
	const [selections, setSelections] = useState<Selection>();
	const [userPfPlan, setUserPfPlan] = useState<PfPlanModel | undefined>(modalData?.userPfPlan);
	const [userPfPlans, setUserPfPlans] = useState<PfPlanModel[]>(modalData?.userPfPlans);
	const [userPfPlansMetadata, setUserPfPlansMetadata] = useState<PaginationModel>();
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [ref, inView] = useInView();

	const form = useForm<DraftMeetingForm | CompleteMeetingForm>({
		defaultValues: modalData?.data ?? {
			id: meeting?.id,
			status_id: meeting?.status_id,
			soap_notes: {
				subjective: meeting?.soap_notes?.subjective || "",
				objective: meeting?.soap_notes?.objective || "",
				assessment: meeting?.soap_notes?.assessment || "",
				progress: meeting?.soap_notes?.progress || "",
				icd_codes: meeting?.soap_notes?.icd_codes || [],
				cpt_codes: meeting?.soap_notes?.cpt_codes || [],
			},
		},
	});

	useEffect(() => {
		const fetchSelections = async () => {
			try {
				const response = await getSelections({
					select: ["cpt_codes", "icd_codes"],
				});

				setSelections(response);
			} catch (error) {
				const apiError = error as ErrorModel;
			}
		};

		fetchSelections();
	}, []);
	const onSubmit = (data: DraftMeetingForm | CompleteMeetingForm) => {
		modal.setData({
			tab: "notes",
			data: data,
		});

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

	const handleRemoveIcd = (
		field: ControllerRenderProps<DraftMeetingForm | CompleteMeetingForm, "soap_notes.icd_codes">,
		index: number,
	) => {
		field.onChange(field.value?.filter((v, i) => i !== index));
	};

	const handleAddIcd = (
		field: ControllerRenderProps<DraftMeetingForm | CompleteMeetingForm, "soap_notes.icd_codes">,
	) => {
		field.onChange([...(field.value ?? []), {}]);
	};

	const handleChangeIcd = (
		field: ControllerRenderProps<DraftMeetingForm | CompleteMeetingForm, "soap_notes.icd_codes">,
		index: number,
		value: MeetingSoapNotesIcdCodes,
	) => {
		const currentValue = field.value ?? [];
		currentValue[index] = value;
		field.onChange(currentValue);
	};

	const handleRemoveCpt = (
		field: ControllerRenderProps<DraftMeetingForm | CompleteMeetingForm, "soap_notes.cpt_codes">,
		index: number,
	) => {
		field.onChange(field.value?.filter((v, i) => i !== index));
	};

	const handleAddCpt = (
		field: ControllerRenderProps<DraftMeetingForm | CompleteMeetingForm, "soap_notes.cpt_codes">,
	) => {
		field.onChange([...(field.value ?? []), {}]);
	};

	const handleChangeCpt = (
		field: ControllerRenderProps<DraftMeetingForm | CompleteMeetingForm, "soap_notes.cpt_codes">,
		index: number,
		value: MeetingSoapNotesCptCodes,
	) => {
		const currentValue = field.value ?? [];
		currentValue[index] = value;
		field.onChange(currentValue);
	};

	const fetchUserPfPlans = async (page?: number) => {
		if (isLoading) return;
		try {
			setIsLoading(true);
			const pfPlans = await getPfPlans(`user_id=${meeting.user_id}&with_archive=true&sort=id:DESC&page=${page ?? 1}`);

			const { data, ...metadata } = pfPlans;

			const [currentPlan, ...oldPlans] = data;

			if (!userPfPlansMetadata) {
				setUserPfPlan(currentPlan?.is_archived ? undefined : currentPlan);

				setUserPfPlans([...(currentPlan?.is_archived ? [currentPlan] : []), ...oldPlans]);
			} else {
				setUserPfPlans((prev) => [...prev, ...data]);
			}

			setUserPfPlansMetadata((prev) => metadata);
		} catch (error) {
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUserPfPlan = () => {
		modal.setData({
			tab: "pfplan",
			userPfPlans: userPfPlans,
			userPfPlan: userPfPlan,
		});

		modal.open({
			type: "default",
			allowClose: true,
			onClose: async () => {
				await fetchUserPfPlans();
			},
			component: () => (
				<CustomizePfPlanListModal
					onSkip={() => {
						window.open(`/patients/${meeting.user_id}/pf-plan`, "_blank");
					}}
					onSelect={(pfPlan) => {
						window.open(`/patients/${meeting.user_id}/pf-plan/${pfPlan.id}`, "_blank");
					}}
				/>
			),
		});
	};

	useEffect(() => {
		if (!userPfPlansMetadata) return;

		if (inView && userPfPlansMetadata.page < userPfPlansMetadata.max_page) {
			fetchUserPfPlans(userPfPlansMetadata.page + 1);
		}
	}, [inView]);

	return (
		<div className="flex flex-col space-y-3 h-full py-3 px-5">
			{onClose && (
				<div className="flex flex-row items-center text-neutral-900">
					<Image src={ArrowLeft} alt="Arrow left" className="cursor-pointer" onClick={() => onClose?.()} />
					<p className="text-2xl font-semibold ml-2">Visit Details</p>
				</div>
			)}

			<Tabs className="flex flex-col flex-1" defaultValue={modalData?.tab ?? "notes"}>
				<div className="flex items-center">
					<TabsList className="flex-grow">
						<TabsTrigger className="w-full" value="notes">
							Notes
						</TabsTrigger>
						<TabsTrigger
							className="w-full"
							onClick={async () => {
								try {
									const response = await getMeeting(meeting.id!);

									setTranscription(response.transcription);
								} catch (e) {
									const error = e as ErrorModel;
									console.error(error);
								}
							}}
							value="transcription"
						>
							Transcription
						</TabsTrigger>
						<TabsTrigger
							className="w-full"
							onClick={async () => {
								await fetchUserPfPlans();
							}}
							value="pfplan"
						>
							PF Plan
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
										className="relative !py-1 !px-2 ml-auto !rounded-full bg-primary-500 hover:bg-primary-600 text-white overflow-hidden !justify-end group w-8 transition-all duration-300 ease-in-out hover:w-48"
										disabled={isLoading}
										onClick={
											isLoading
												? undefined
												: async () => {
														try {
															setIsLoading(true);
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
														} finally {
															setIsLoading(false);
														}
													}
										}
									>
										{isLoading && (
											<span
												className="absolute inset-0 overflow-hidden
                          before:content-[''] before:absolute before:inset-0
                          before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
                          before:translate-x-[-100%] before:animate-[shimmer_2s_linear_infinite]"
											/>
										)}

										<span className="text-sm mr-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-2 transition-all duration-300">
											{isLoading ? "Generating" : "Generate"} SOAP Notes
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

							<div className="flex flex-col space-y-1">
								<Controller
									name="soap_notes.icd_codes"
									control={form.control}
									render={({ field }) => {
										return (
											<>
												<div className="flex flex-row items-center">
													<span className="font-semibold text-sm">Diagnosis Codes</span>
													{!field.value?.length && (
														<Button onClick={() => handleAddIcd(field)} className="h-8 w-8 !p-0 ml-auto">
															<PlusIcon className="h-4 w-4" />
														</Button>
													)}
												</div>
												{field.value?.map((value, index) => {
													return (
														<div key={`${value.code}-${index}`} className="flex flex-row items-center gap-4">
															<div className="flex-1">
																<div className="flex flex-row items-center">
																	<SelectCmp
																		defaultValue={{
																			label: value.code && value.name ? `${value.code} - ${value.name}` : "",
																			value: value.code,
																		}}
																		value={{
																			label: value.code && value.name ? `${value.code} - ${value.name}` : "",
																			value: value.code,
																		}}
																		placeholder="Select Code"
																		options={selections?.icd_codes
																			?.filter((code) => !field.value?.some((c) => c.code === code.code))
																			.map((code) => ({
																				label: `${code.code} - ${code.name}`,
																				value: code.code,
																				name: code.name,
																			}))}
																		onChange={(e) => {
																			if (!e) return;

																			handleChangeIcd(field, index, { code: e.value, name: e.name });
																		}}
																		wrapperClassName="w-full flex-1"
																		className="!py-[1px]"
																	/>
																	<div className="flex items-center min-w-16">
																		{index === (field.value?.length ?? 0) - 1 && (
																			<Button onClick={() => handleAddIcd(field)} className="h-8 w-8 !p-0 ml-auto">
																				<PlusIcon className="h-4 w-4" />
																			</Button>
																		)}

																		<Button
																			onClick={() => handleRemoveIcd(field, index)}
																			className="h-8 w-8 !p-0 ml-auto"
																		>
																			<XIcon className="h-4 w-4" />
																		</Button>
																	</div>
																</div>
															</div>
														</div>
													);
												})}
											</>
										);
									}}
								/>
							</div>
							<div className="flex flex-col space-y-1">
								<Controller
									name="soap_notes.cpt_codes"
									control={form.control}
									render={({ field }) => {
										return (
											<>
												<div className="flex flex-row items-center">
													<span className="font-semibold text-sm">CPT Codes</span>
													{!field.value?.length && (
														<Button onClick={() => handleAddCpt(field)} className="h-8 w-8 !p-0 ml-auto">
															<PlusIcon className="h-4 w-4" />
														</Button>
													)}
												</div>
												<div className="flex flex-col space-y-3">
													{field.value?.map((value, index) => {
														return (
															<div key={`${value.code}-${index}`} className="flex flex-row items-center">
																<div className="flex-1">
																	<div className="flex flex-row items-center space-x-1">
																		<div className="flex space-x-1 flex-1">
																			<SelectCmp
																				menuPortalTarget={document.body}
																				menuPosition="fixed"
																				defaultValue={{
																					label: value.code && value.name ? `${value.code} - ${value.name}` : "",
																					value: value.code,
																				}}
																				value={{
																					label: value.code && value.name ? `${value.code} - ${value.name}` : "",
																					value: value.code,
																				}}
																				placeholder="Select Code"
																				options={selections?.cpt_codes
																					?.filter((code) => !field.value?.some((c) => c.code === code.code))
																					.map((code) => ({
																						label: `${code.code} - ${code.name}`,
																						value: code.code,
																						name: code.name,
																					}))}
																				onChange={(e) => {
																					if (!e) return;

																					handleChangeCpt(field, index, {
																						code: e.value,
																						name: e.name,
																						duration: value.duration,
																					});
																				}}
																				wrapperClassName="w-full !z-auto"
																				className="!py-[1px]"
																			/>
																			<Input
																				type="number"
																				className="!p-2"
																				min={0}
																				value={value.duration}
																				placeholder="Duration"
																				onChange={(e) => {
																					handleChangeCpt(field, index, {
																						code: value.code,
																						name: value.name,
																						duration: Number(e.target.value),
																					});
																				}}
																			/>
																		</div>
																		<div className="flex items-center min-w-16">
																			{index === (field.value?.length ?? 0) - 1 && (
																				<Button onClick={() => handleAddCpt(field)} className="h-8 w-8 !p-0 ml-auto">
																					<PlusIcon className="h-4 w-4" />
																				</Button>
																			)}
																			<Button
																				onClick={() => handleRemoveCpt(field, index)}
																				className="h-8 w-8 !p-0 ml-auto"
																			>
																				<XIcon className="h-4 w-4" />
																			</Button>
																		</div>
																	</div>
																</div>
															</div>
														);
													})}
												</div>
											</>
										);
									}}
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
										isProcessing={isLoading}
										onClick={
											isLoading
												? undefined
												: async () => {
														try {
															setIsLoading(true);
															const response = await transcribeMeeting(meeting.id!);
															showSnackBar({
																message: response.msg,
																success: true,
															});
														} catch (e) {
															const error = e as ErrorModel;
															showSnackBar({
																message: error.msg,
																success: false,
															});
														} finally {
															setIsLoading(false);
														}
													}
										}
										label="Generate Transcription"
										className="w-full mt-auto"
									/>
								</div>
							</>
						)}
					</div>
				</TabsContent>
				<TabsContent value="pfplan" className="overflow-y-auto h-full">
					<div className="flex flex-col text-neutral-900 text-sm h-full space-y-6">
						{userPfPlan || userPfPlans ? (
							<div className="flex flex-col space-y-1 mt-5">
								<span className="font-semibold text-sm">Personalized PF Plan</span>
								{userPfPlan ? (
									<Link href={`/patients/${meeting.user_id}/pf-plan/${userPfPlan.id}`} target="_blank">
										<div className="flex space-x-4 mb-3">
											<Image
												src={userPfPlan.photo || "/images/exercise-banner.jpg"}
												width={80}
												height={56}
												alt="Thumbnail"
												className="w-[80px] h-[56px] mt-1"
											/>
											<div>
												<p className="line-clamp-1" title={userPfPlan.name}>
													{userPfPlan.name}
												</p>
												<p className="text-sm text-neutral-600 line-clamp-2" title={userPfPlan.description}>
													{userPfPlan.description}
												</p>
											</div>
										</div>
									</Link>
								) : (
									<Button
										className="!w-64 self-center !mt-5"
										onClick={handleUserPfPlan}
										label="Assign Personalized PF Plan"
									/>
								)}
							</div>
						) : (
							<div className="flex flex-col h-full w-full justify-center items-center space-y-3">
								<p className="font-semibold">No PF Plan Found</p>
								<Button onClick={handleUserPfPlan} label="Assign Personalized PF Plan" />
							</div>
						)}

						{userPfPlans && (
							<div className="flex flex-col space-y-1">
								<span className="font-semibold text-sm">Previous Personalized PF Plans</span>
								{userPfPlans?.map((pfPlan) => (
									<Link key={pfPlan.id} href={`/patients/${meeting.user_id}/pf-plan/${pfPlan.id}`} target="_blank">
										<div className="flex space-x-4 mb-3">
											<div>
												<p className="line-clamp-2" title={pfPlan.name}>
													{pfPlan.name}
												</p>
												<p className="text-sm text-neutral-600 line-clamp-3" title={pfPlan.description}>
													{pfPlan.description}
												</p>
											</div>
										</div>
									</Link>
								))}
								{userPfPlansMetadata?.page !== userPfPlansMetadata?.max_page && (
									<div ref={ref} className="flex w-full items-center justify-center py-5">
										<Loader />
										<span>Loading...</span>
									</div>
								)}
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
