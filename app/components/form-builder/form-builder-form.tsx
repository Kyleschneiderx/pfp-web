"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import type { ErrorModel } from "@/app/models/error_model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useModal } from "@/app/contexts/ModalContext";
import type {
	CustomForm,
	CustomFormField,
	CustomFormFieldType,
	CustomFormSchema,
	CustomFormFieldOption,
} from "@/app/models/custom_form_model";
import { createCustomForm, updateCustomForm, deleteCustomForm } from "@/app/services/client_side/custom-forms";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import clsx from "clsx";
import Card from "../elements/Card";
import MoveTaskIcon from "../icons/move_task_icon";
import SelectCmp from "../elements/SelectCmp";
import type { OptionsModel } from "@/app/models/common_model";
import { ArrowLeft, CircleX, Plus, X } from "lucide-react";

const FIELD_TYPES: { value: CustomFormFieldType; label: string }[] = [
	{ value: "Input", label: "Input" },
	{ value: "Textarea", label: "Textarea" },
	{ value: "Checkbox", label: "Checkbox" },
	{ value: "Radio", label: "Radio" },
	{ value: "Select", label: "Select" },
];

function newFieldId() {
	return `f${Date.now()}`;
}

function emptyOption(): CustomFormFieldOption {
	return { value: "", label: "" };
}

export default function FormBuilderForm({ customForm }: { customForm?: CustomForm }) {
	const router = useRouter();
	const modal = useModal();
	const { showSnackBar } = useSnackBar();
	const [name, setName] = useState("");
	const [fields, setFields] = useState<CustomFormField[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (customForm) {
			setName(customForm.name ?? "");
			setFields(
				customForm.schema?.fields?.length
					? customForm.schema.fields.map((f) => ({
							...f,
							options: f.options?.length ? [...f.options] : undefined,
						}))
					: [],
			);
		}
	}, [customForm]);

	const onDragEnd = (result: DropResult) => {
		if (result.destination == null || result.source == null) return;
		const next = [...fields];
		const [removed] = next.splice(result.source.index, 1);
		next.splice(result.destination.index, 0, removed);
		setFields(next);
	};

	const addField = () => {
		setFields((prev) => [...prev, { id: newFieldId(), type: "Input", label: "", required: false }]);
	};

	const removeField = (id: string) => {
		setFields((prev) => prev.filter((f) => f.id !== id));
	};

	const updateField = (id: string, patch: Partial<CustomFormField>) => {
		setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
	};

	const addOption = (fieldId: string) => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.id !== fieldId) return f;
				const opts = f.options ?? [];
				return { ...f, options: [...opts, emptyOption()] };
			}),
		);
	};

	const removeOption = (fieldId: string, index: number) => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.id !== fieldId || !f.options) return f;
				const opts = f.options.filter((_, i) => i !== index);
				return { ...f, options: opts.length ? opts : undefined };
			}),
		);
	};

	const updateOption = (fieldId: string, index: number, key: "value" | "label", value: string) => {
		setFields((prev) =>
			prev.map((f) => {
				if (f.id !== fieldId || !f.options) return f;
				const opts = [...f.options];
				opts[index] = { ...opts[index], [key]: value };
				return { ...f, options: opts };
			}),
		);
	};

	const validate = (): boolean => {
		if (name.length > 255) {
			showSnackBar({ message: "Name must be at most 255 characters.", success: false });
			return false;
		}
		const emptyLabel = fields.some((f) => !f.label?.trim());
		if (emptyLabel) {
			showSnackBar({ message: "Every question must have a label.", success: false });
			return false;
		}
		return true;
	};

	const handleSubmit = () => {
		if (!validate()) return;
		const schema: CustomFormSchema = { fields };
		modal.open({
			type: "confirm",
			title: customForm ? "Update Form" : "Create Form",
			message: `Are you sure you want to ${customForm ? "update" : "create"} this form?`,
			onConfirm: async () => {
				setIsSubmitting(true);
				try {
					if (customForm) {
						await updateCustomForm(customForm.id, {
							name: name.trim() || null,
							schema,
						});
						await revalidatePage("/settings/form-builder");
						modal.closeAll();
						showSnackBar({ message: "Form updated.", success: true });
						router.push(`/settings/form-builder/${customForm.id}/edit`);
					} else {
						const created = await createCustomForm({
							name: name.trim() || undefined,
							schema,
						});
						await revalidatePage("/settings/form-builder");
						modal.closeAll();
						showSnackBar({ message: "Form created.", success: true });
						router.push(`/settings/form-builder/${created.id}/edit`);
					}
				} catch (e) {
					const err = e as ErrorModel;
					showSnackBar({ message: err?.msg ?? "Request failed", success: false });
				} finally {
					setIsSubmitting(false);
				}
			},
		});
	};

	const handleDelete = () => {
		if (!customForm) return;
		modal.open({
			type: "confirm",
			title: "Delete Form",
			message: "Are you sure you want to remove this form?",
			onConfirm: async () => {
				try {
					await deleteCustomForm(customForm.id);
					await revalidatePage("/settings/form-builder");
					modal.closeAll();
					showSnackBar({ message: "Form removed.", success: true });
					router.push("/settings/form-builder");
				} catch (e) {
					const err = e as ErrorModel;
					showSnackBar({ message: err?.msg ?? "Delete failed", success: false });
				}
			},
		});
	};

	const typeOptions: OptionsModel[] = FIELD_TYPES.map((t) => ({ label: t.label, value: t.value }));

	return (
		<div className="flex flex-col h-full min-h-[calc(100vh-85px)]">
			<header className="sticky -top-5 z-20 flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-neutral-200 shrink-0 shadow-sm">
				<div className="flex items-center gap-4 min-w-0">
					<Link
						href="/settings/form-builder"
						className="text-neutral-600 hover:text-neutral-900 shrink-0"
						aria-label="Back to Form Builder"
					>
						<ArrowLeft className="w-5 h-5" />
					</Link>
					<div className="min-w-0">
						<h1 className="text-xl font-semibold truncate">{customForm ? name || "Edit Form" : "Create Form"}</h1>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<Link href="/settings/form-builder">
						<Button label="Cancel" secondary className="hidden sm:inline-flex" />
					</Link>
					{customForm && <Button label="Delete" outlined onClick={handleDelete} className="hidden sm:inline-flex" />}
					<Button
						label="Save"
						type="button"
						onClick={handleSubmit}
						className="hidden sm:inline-flex"
						disabled={isSubmitting}
					/>
				</div>
			</header>

			<div className="flex-1 overflow-auto relative z-0">
				<div className="mx-auto w-full max-w-4xl px-6 py-8">
					<div className="space-y-8">
						<Card className="p-6 sm:p-8">
							<h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">Form details</h2>
							<div className="grid gap-6 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<p className="font-medium mb-2">Name</p>
									<Input
										type="text"
										placeholder="e.g. Patient Intake"
										value={name}
										onChange={(e) => setName(e.target.value)}
									/>
								</div>
								{customForm != null && (
									<div>
										<p className="text-sm font-medium text-neutral-500">Version</p>
										<p className="text-neutral-700">{customForm.version}</p>
									</div>
								)}
							</div>
						</Card>

						<Card className="p-6 sm:p-8">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
								<h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Questions</h2>
							</div>
							<div className="min-h-[240px] overflow-visible">
								<DragDropContext onDragEnd={onDragEnd}>
									<Droppable droppableId="FormFields">
										{(provided) => (
											<div className="space-y-4" ref={provided.innerRef} {...provided.droppableProps}>
												{fields.map((field, index) => (
													<Draggable key={field.id} draggableId={field.id} index={index}>
														{(provided, snapshot) => {
															const cardContent = (
																<div className="flex items-start gap-4">
																	<div
																		{...provided.dragHandleProps}
																		className="cursor-grab active:cursor-grabbing pt-1.5 shrink-0 text-neutral-400 hover:text-neutral-600"
																	>
																		<MoveTaskIcon className="text-current" />
																	</div>
																	<div className="flex-1 min-w-0 space-y-4">
																		<div className="flex items-center justify-between gap-3">
																			<div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
																				<div className="min-w-[140px] flex-1 max-w-[200px]">
																				<SelectCmp
																					placeholder="Type"
																					options={typeOptions}
																					value={typeOptions.find((o) => o.value === field.type) ?? null}
																					onChange={(v) =>
																						updateField(field.id, {
																							type: (v?.value as CustomFormFieldType) ?? "Input",
																						})
																					}
																				/>
																			</div>
																			<label className="flex items-center gap-2 shrink-0 cursor-pointer">
																				<input
																					type="checkbox"
																					checked={!!field.required}
																					onChange={(e) => updateField(field.id, { required: e.target.checked })}
																					className="rounded border-neutral-300"
																				/>
																				<span className="text-sm">Required</span>
																			</label>
																			</div>
																			<button
																				type="button"
																				onClick={() => removeField(field.id)}
																				className="p-1 text-neutral-400 hover:text-error-600 rounded shrink-0"
																				aria-label="Remove question"
																			>
																				<CircleX size={20} />
																			</button>
																		</div>
																		<Input
																			type="text"
																			placeholder="Question label"
																			value={field.label}
																			onChange={(e) => updateField(field.id, { label: e.target.value })}
																		/>
																		{(field.type === "Select" ||
																			field.type === "Radio" ||
																			field.type === "Checkbox") && (
																			<div className="space-y-3 pt-2 border-t border-neutral-100">
																				<p className="text-sm font-medium text-neutral-600">Options</p>
																				<div className="space-y-2">
																					{(field.options ?? []).map((opt, optIndex) => (
																						<div key={optIndex} className="flex gap-2 items-center">
																							<Input
																								placeholder="Value"
																								value={opt.value}
																								onChange={(e) =>
																									updateOption(field.id, optIndex, "value", e.target.value)
																								}
																								className="flex-1"
																							/>
																							<Input
																								placeholder="Label"
																								value={opt.label}
																								onChange={(e) =>
																									updateOption(field.id, optIndex, "label", e.target.value)
																								}
																								className="flex-1"
																							/>
																							<button
																								type="button"
																								onClick={() => removeOption(field.id, optIndex)}
																								className="p-1.5 text-neutral-400 hover:text-error-600 rounded shrink-0"
																								aria-label="Remove option"
																							>
																								<X size={18} />
																							</button>
																						</div>
																					))}
																				</div>
																				<Button
																					label="Add option"
																					outlined
																					className="!py-2 !px-3 text-sm"
																					onClick={() => addOption(field.id)}
																				/>
																			</div>
																		)}
																	</div>
																</div>
															);
															const cardClassName = clsx(
																"border rounded-lg border-neutral-200 bg-white p-5 group transition-shadow relative",
																snapshot.isDragging ? "shadow-lg ring-2 ring-primary-200" : "hover:border-neutral-300",
															);
															if (snapshot.isDragging && typeof document !== "undefined") {
																return (
																	<>
																		<div
																			aria-hidden
																			style={{ height: 0, overflow: "hidden", margin: 0, padding: 0, minHeight: 0 }}
																		/>
																		{createPortal(
																			<div
																				ref={provided.innerRef}
																				{...provided.draggableProps}
																				className={cardClassName}
																				style={{ ...provided.draggableProps.style }}
																			>
																				{cardContent}
																			</div>,
																			document.body,
																		)}
																	</>
																);
															}
															return (
																<div ref={provided.innerRef} {...provided.draggableProps} className={cardClassName}>
																	{cardContent}
																</div>
															);
														}}
													</Draggable>
												))}
												{provided.placeholder}
											</div>
										)}
									</Droppable>
								</DragDropContext>
								{fields.length > 0 && (
									<button
										type="button"
										onClick={addField}
										className="w-full flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50 hover:border-neutral-300 hover:bg-neutral-50 transition-colors cursor-pointer mt-4"
									>
										<Plus className="w-8 h-8 text-neutral-400 mb-2" strokeWidth={1.5} />
										<p className="text-neutral-500 mb-1">Add question</p>
										<p className="text-sm text-neutral-400">Click to add another question to this form</p>
									</button>
								)}
								{fields.length === 0 && (
									<div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
										<p className="text-neutral-500 mb-2">No questions yet</p>
										<p className="text-sm text-neutral-400 mb-4">Add questions and drag to reorder.</p>
										<Button label="Add question" outlined onClick={addField} />
									</div>
								)}
							</div>
						</Card>
					</div>
				</div>
			</div>

			<footer className="sm:hidden relative flex flex-col gap-2 p-4 bg-white border-t border-neutral-200 shrink-0">
				<Link href="/settings/form-builder">
					<Button type="button" label="Cancel" secondary className="w-full" />
				</Link>
				{customForm && <Button type="button" label="Delete" outlined onClick={handleDelete} />}
				<Button type="button" label="Save" onClick={handleSubmit} disabled={isSubmitting} />
			</footer>
		</div>
	);
}
