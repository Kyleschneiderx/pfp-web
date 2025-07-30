"use client";

import Button from "../../elements/Button";
import Input from "../../elements/Input";
import Textarea from "../../elements/Textarea";
import { useEffect, useState } from "react";
import type { AiCoachSettingsModel } from "@/app/models/settings_models";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { useModal } from "@/app/contexts/ModalContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { updateAiCoachSettings } from "@/app/services/client_side/settings";
import type { ErrorModel } from "@/app/models/error_model";
import InfoPopover from "../../elements/InfoPopover";
import DeleteConversationModal from "../../modals/delete-conversation-modal";

export default function SettingsAiCoachForm({ settings }: { settings: AiCoachSettingsModel }) {
	const { showSnackBar } = useSnackBar();
	const modal = useModal();

	const [systemPrompt, setSystemPrompt] = useState<string>(settings.prompt);
	const [initiatePrompt, setInitiatePrompt] = useState<string>(settings.initiate_prompt);
	const [maxToken, setMaxToken] = useState<number>(Number(settings.max_tokens));

	const onSave = async () => {
		try {
			await updateAiCoachSettings({
				prompt: systemPrompt,
				initiate_prompt: initiatePrompt,
				max_tokens: String(maxToken),
			});

			clearData();

			await revalidatePage("/settings/ai-coach");
		} catch (error) {
			const apiError = error as ErrorModel;

			if (apiError?.msg) {
				showSnackBar({ message: apiError.msg, success: false });
			}
		} finally {
			modal.close();
		}
	};

	const handleSave = () => {
		modal.open({
			type: "confirm",
			title: "Are you sure you want to save this changes?",
			message: "Please confirm that you want to save this. You can always edit them later if needed.",
			onConfirm: onSave,
		});
	};

	const handleDeleteConversation = () => {
		modal.open({
			type: "default",
			component: <DeleteConversationModal />,
		});
	};

	useEffect(() => {
		if (settings) {
			setSystemPrompt(settings.prompt);
			setInitiatePrompt(settings.initiate_prompt);
			setMaxToken(Number(settings.max_tokens));
		}
	}, [settings]);

	const clearData = () => {
		setSystemPrompt("");
		setInitiatePrompt("");
		setMaxToken(20000);
	};

	return (
		<>
			<div className="flex items-center mb-5 sm:mb-7">
				<div>
					<h1 className="text-2xl font-semibold">AI Coach Settings</h1>
					<p className="text-sm text-neutral-600">
						Manage how the AI behaves and responds to input. Set prompts, response limits, and fine-tune creative
						output.
					</p>
				</div>
				<div className="hidden sm:flex ml-auto space-x-3">
					<Button label="Delete Conversation" outlined onClick={handleDeleteConversation} />
					<Button label="Save" onClick={handleSave} />
				</div>
			</div>
			<hr />
			<div className="flex flex-col items-start sm:flex-row mt-3 space-y-4 sm:space-y-0 sm:mt-8">
				<div className="w-full sm:w-4/6 space-y-4 sm:mr-6 z-10">
					<div className="w-full p-5 space-y-4 sm:mr-6 z-10 rounded-lg bg-white drop-shadow-center">
						<div>
							<div className="flex justify-between items-end mb-2">
								<p className="font-medium">System Prompt</p>
								<InfoPopover
									content={
										<div className="space-y-2">
											<h4 className="font-medium">System Prompt</h4>
											<p className="text-sm text-muted-foreground">
												A system prompt is a special instruction given to an AI model at the start of a conversation to
												define its behavior, tone, role, and boundaries. It acts like a behind-the-scenes setup that
												guides how the AI should respond throughout the interaction. Unlike regular user input, the
												system prompt is not visible to the end user during normal usage.
											</p>
										</div>
									}
								/>
							</div>
							<Textarea
								placeholder="Enter system prompt"
								name="prompt"
								value={systemPrompt}
								rows={20}
								className="resize-none !h-auto"
								onChange={(e) => setSystemPrompt(e.currentTarget.value)}
							/>
						</div>
					</div>
					<div className="w-full p-5 space-y-4 sm:mr-6 z-10 rounded-lg bg-white drop-shadow-center">
						<div>
							<div className="flex justify-between items-end mb-2">
								<p className="font-medium">Initial Instructional Prompt</p>
								<InfoPopover
									content={
										<div className="space-y-2">
											<h4 className="font-medium">Initial Instructional Prompt</h4>
											<p className="text-sm text-muted-foreground">
												Initial Instructional Prompt An initial instructional prompt is a carefully crafted directive
												given to an AI to generate its first user-facing message. It sets the tone, persona, and purpose
												of the AI’s initial response, often used to establish trust, introduce the AI’s role, and guide
												the opening of a conversation. Unlike general system prompts that shape behavior throughout the
												session, this type of prompt is focused on producing a warm, structured, and empathetic opening
												message, especially useful for assistant-style or conversational AI. It combines role
												definition, tone guidance, and specific content goals to ensure the AI’s first message aligns
												with the intended user experience.
											</p>
										</div>
									}
								/>
							</div>

							<Textarea
								placeholder="Enter system prompt"
								name="initiate_prompt"
								value={initiatePrompt}
								rows={20}
								className="resize-none !h-auto"
								onChange={(e) => setInitiatePrompt(e.currentTarget.value)}
							/>
						</div>
					</div>
				</div>
				<div className="flex flex-col w-full sm:w-2/6 space-y-4 sm:mr-6 p-5 rounded-lg bg-white drop-shadow-center">
					<div className="flex justify-between items-end mb-2">
						<p className="font-medium">Other Settings</p>
					</div>
					<div>
						<div className="flex justify-between items-end mb-2">
							<p className="font-medium">Max Token</p>
							<InfoPopover
								content={
									<div className="space-y-2">
										<h4 className="font-medium">Max Tokens</h4>
										<p className="text-sm text-muted-foreground">
											Max input tokens (or context length) refers to the maximum number of tokens the model can accept
											in the input prompt, including system messages, user inputs, and any prior conversation history.
											It defines how much information the model can "see" or consider at once before generating a
											response.
										</p>
									</div>
								}
							/>
						</div>
						<Input
							type="number"
							placeholder="Enter patient name"
							value={maxToken}
							onChange={(e) => setMaxToken(Number(e.currentTarget.value))}
						/>
					</div>
				</div>
				<div className="sm:hidden flex flex-col w-full mt-4 space-y-3">
					<Button label="Delete Conversation" outlined onClick={handleDeleteConversation} />
					<Button label="Save" onClick={handleSave} />
				</div>
			</div>
		</>
	);
}
