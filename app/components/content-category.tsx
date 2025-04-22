"use client";
import type { SurveyGroupModel } from "../models/survey_group_model";
import ConfirmModal from "./elements/ConfirmModal";
import { useEffect, useState } from "react";
import type { OptionsModel } from "../models/common_model";
import SelectCmp from "./elements/SelectCmp";
import {
	deleteSurveyGroup,
	getSurveyGroups,
	getSurveyQuestions,
	saveSurveyGroup,
} from "../services/client_side/surveys";
import type { ErrorModel } from "../models/error_model";
import { CONFIRM_DELETE_DESCRIPTION, CONFIRM_SAVE_DESCRIPTION, LIST_CATEGORIES_DESCRIPTION } from "../lib/constants";
import FilePenIcon from "./icons/filepen_icon";
import TrashbinIcon from "./icons/trashbin_icon";
import ModalCmp from "./elements/ModalCmp";
import Input from "./elements/Input";
import Button from "./elements/Button";
import { useSnackBar } from "../contexts/SnackBarContext";

interface ContentCategoryFormModalProps {
	onClose: () => void;
	category?: SurveyGroupModel;
	onProceed: (data: { name: string; questions: OptionsModel[] }) => void;
}

export function ContentCategoryFormModal({ onClose, category, onProceed }: ContentCategoryFormModalProps) {
	const [name, setName] = useState<string>("");
	const [questions, setQuestions] = useState<OptionsModel[]>([]);
	const [questionList, setQuestionList] = useState<OptionsModel[]>([]);

	const handleAddclick = () => {
		if (name.trim() !== "") {
			onProceed({
				name,
				questions,
			});
		}
	};

	const getQuestions = async () => {
		try {
			const list = await getSurveyQuestions();
			const transformList = list.map((el) => ({
				label: el.question,
				value: el.id.toString(),
			}));
			setQuestionList(transformList);
		} catch (error) {
			const apiError = error as ErrorModel;
			const errorMessage = apiError.msg || "Failed to fetch questions";
			throw new Error(errorMessage);
		}
	};

	useEffect(() => {
		getQuestions();
	}, []);

	useEffect(() => {
		if (category) {
			setName(category.description);
			setQuestions(
				category.questions.map((el) => ({
					label: el.question,
					value: el.id.toString(),
				})),
			);
		}
	}, [category]);

	return (
		<ModalCmp isOpen={true}>
			<div className="text-left w-[300px] sm:w-[600px] sm:py-5 sm:px-3">
				<p className="text-2xl text-center font-semibold mb-7">{category ? "Update" : "Add a New"} Category</p>
				<div className="mt-2">
					<p className="mb-2">Category</p>
					<Input type="text" placeholder="Enter new category" value={name} onChange={(e) => setName(e.target.value)} />
				</div>
				<div className="mt-2">
					<p className="mb-2">Questions</p>
					<SelectCmp
						isMulti={true}
						options={questionList}
						value={questions}
						invalid={false}
						onChange={(e) => setQuestions(e as OptionsModel[])}
						placeholder="Choose question"
					/>
				</div>
				<div className="flex justify-center space-x-3 mt-9">
					<Button label="Cancel" secondary onClick={onClose} className="sm:px-[50px]" />
					<Button
						label={category ? "Update" : "Add"}
						onClick={handleAddclick}
						className="sm:px-[50px]"
						disabled={name.trim() === ""}
					/>
				</div>
			</div>
		</ModalCmp>
	);
}

interface ContentCategoryListModalProps {
	onClose: () => void;
	categories: SurveyGroupModel[];
	onEditClick: (category: SurveyGroupModel) => void;
	onDeleteClick: (category: SurveyGroupModel) => void;
}

export function ContentCategoryListModal({
	onClose,
	categories,
	onEditClick,
	onDeleteClick,
}: ContentCategoryListModalProps) {
	return (
		<ModalCmp isOpen={true} handleClose={onClose} showCloseBtn>
			<div className="text-center w-[300px] sm:w-[450px] sm:py-5 sm:px-3">
				<p className="text-2xl font-semibold mb-2">All Categories</p>
				<p className="text-neutral-600 mb-[40px]">{LIST_CATEGORIES_DESCRIPTION}</p>
				<ul className="border border-neutral-300 rounded-lg text-start overflow-auto h-[200px]">
					{categories.map((item) => (
						<li
							key={item.description}
							className="flex w-full py-2 px-4 text-neutral-600 hover:bg-primary-50 hover:text-primary-500 group"
						>
							<span>{item.description}</span>
							<FilePenIcon
								className="ml-auto mr-2 hidden group-hover:inline-block cursor-pointer"
								onClick={() => onEditClick(item)}
							/>
							<TrashbinIcon
								className="hidden group-hover:inline-block cursor-pointer"
								onClick={() => onDeleteClick(item)}
							/>
						</li>
					))}
				</ul>
			</div>
		</ModalCmp>
	);
}

interface Props {
	onChange: (category: OptionsModel[]) => void;
	categories?: OptionsModel[] | null;
	className?: string;
}

export default function ContentCategory({ onChange, categories, className }: Props) {
	const { showSnackBar } = useSnackBar();
	const [categoryList, setCategoryList] = useState<SurveyGroupModel[]>([]);
	const [categoryOptionList, setCategoryOptionList] = useState<OptionsModel[]>([]);
	const [isContentCategoryFormModalOpen, setIsContentCategoryFormModalOpen] = useState(false);
	const [isContentCategoryListModalOpen, setIsContentCategoryListModalOpen] = useState<boolean>(false);
	const [categoryName, setCategoryName] = useState<string>("");
	const [contentCategory, setContentCategory] = useState<SurveyGroupModel>();
	const [categoryQuestionId, setCategoryQuestionId] = useState<OptionsModel[]>([]);
	const [isContentCategoryProcessing, setIsContentCategoryProcessing] = useState<boolean>(false);
	const [isSaveContentCategoryConfirmModalOpen, setIsSaveContentCategoryConfirmModalOpen] = useState<boolean>(false);
	const [isDeleteContentCategoryConfirmModalOpen, setIsDeleteContentCategoryConfirmModalOpen] =
		useState<boolean>(false);

	const getCategories = async () => {
		try {
			const list = await getSurveyGroups();
			setCategoryList(list);
			const transformList = list.map((el) => ({
				label: el.description,
				value: el.id.toString(),
			}));
			setCategoryOptionList(transformList);
		} catch (error) {
			const apiError = error as ErrorModel;
			const errorMessage = apiError.msg || "Failed to fetch pf plan categories";
			throw new Error(errorMessage);
		}
	};

	useEffect(() => {
		getCategories();
	}, []);

	const handleCreateCategory = ({ name, questions }: { name: string; questions: OptionsModel[] }) => {
		setCategoryName(name);
		setCategoryQuestionId(questions);
		setIsContentCategoryFormModalOpen(false);
		setIsSaveContentCategoryConfirmModalOpen(true);
	};

	const handleEditCategory = (category: SurveyGroupModel) => {
		setContentCategory(category);
		setIsContentCategoryListModalOpen(false);
		setIsContentCategoryFormModalOpen(true);
	};

	const handleDeleteCategory = (category: SurveyGroupModel) => {
		setContentCategory(category);
		setIsContentCategoryListModalOpen(false);
		setIsDeleteContentCategoryConfirmModalOpen(true);
	};

	const handleSaveContentCategoryConfirm = async () => {
		if (!isContentCategoryProcessing) {
			try {
				setIsContentCategoryProcessing(true);
				await saveSurveyGroup(contentCategory ? "PUT" : "POST", contentCategory?.id, {
					description: categoryName,
					question_id: categoryQuestionId.map((category) => Number(category.value)),
				});
				showSnackBar({
					message: "Category successfully saved.",
					success: true,
				});
				setIsContentCategoryProcessing(false);
				setIsSaveContentCategoryConfirmModalOpen(false);
				setContentCategory(undefined);
				await getCategories();
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsContentCategoryProcessing(false);
				setIsSaveContentCategoryConfirmModalOpen(false);
			}
		}
	};

	const handleDeleteContentCategoryConfirm = async () => {
		if (!isContentCategoryProcessing && contentCategory) {
			try {
				setIsContentCategoryProcessing(true);
				await deleteSurveyGroup(contentCategory.id);
				showSnackBar({
					message: "Category successfully deleted.",
					success: true,
				});
				setIsContentCategoryProcessing(false);
				setIsDeleteContentCategoryConfirmModalOpen(false);
				setContentCategory(undefined);
				await getCategories();
			} catch (error) {
				const apiError = error as ErrorModel;

				if (apiError?.msg) {
					showSnackBar({ message: apiError.msg, success: false });
				}
				setIsContentCategoryProcessing(false);
				setIsDeleteContentCategoryConfirmModalOpen(false);
			}
		}
	};

	return (
		<>
			<div className="flex justify-between">
				<p className="font-medium mb-2">Category</p>
				<span
					className="text-primary-500 cursor-pointer"
					onKeyUp={() => {}}
					onClick={() => setIsContentCategoryFormModalOpen(true)}
				>
					+ Add a new category
				</span>
			</div>

			<SelectCmp
				isMulti={true}
				options={categoryOptionList}
				value={categories}
				invalid={false}
				onChange={(e) => onChange(e as OptionsModel[])}
				placeholder="Choose category"
				wrapperClassName={className}
			/>
			<span
				className="text-sm text-neutral-600 cursor-pointer underline"
				onKeyUp={() => {}}
				onClick={() => setIsContentCategoryListModalOpen(true)}
			>
				View All Categories
			</span>
			{isContentCategoryFormModalOpen && (
				<ContentCategoryFormModal
					category={contentCategory}
					onClose={() => {
						setIsContentCategoryFormModalOpen(false);
					}}
					onProceed={handleCreateCategory}
				/>
			)}
			{isContentCategoryListModalOpen && (
				<ContentCategoryListModal
					onClose={() => {
						setIsContentCategoryListModalOpen(false);
					}}
					categories={categoryList}
					onEditClick={handleEditCategory}
					onDeleteClick={handleDeleteCategory}
				/>
			)}
			<ConfirmModal
				title={"Are you sure you want to continue with this action?"}
				subTitle={CONFIRM_SAVE_DESCRIPTION}
				isOpen={isSaveContentCategoryConfirmModalOpen}
				confirmBtnLabel="Confirm"
				isProcessing={isContentCategoryProcessing}
				onConfirm={handleSaveContentCategoryConfirm}
				onClose={() => {
					setIsSaveContentCategoryConfirmModalOpen(false);
				}}
			/>
			<ConfirmModal
				title={"Are you sure you want to continue with this action?"}
				subTitle={CONFIRM_DELETE_DESCRIPTION}
				isOpen={isDeleteContentCategoryConfirmModalOpen}
				confirmBtnLabel="Confirm"
				isProcessing={isContentCategoryProcessing}
				onConfirm={handleDeleteContentCategoryConfirm}
				onClose={() => {
					setIsDeleteContentCategoryConfirmModalOpen(false);
				}}
			/>
		</>
	);
}
