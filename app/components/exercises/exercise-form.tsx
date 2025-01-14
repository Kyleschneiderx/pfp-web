"use client";

import Button from "@/app/components/elements/Button";
import Input from "@/app/components/elements/Input";
import ReqIndicator from "@/app/components/elements/ReqIndicator";
import Textarea from "@/app/components/elements/Textarea";
import UploadCmp from "@/app/components/elements/UploadCmp";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import {
  CONFIRM_DELETE_DESCRIPTION,
  CONFIRM_SAVE_DESCRIPTION,
  CREATE_EXERCISE_DESCRIPTION,
  UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { getFileContentType } from "@/app/lib/utils";
import { ErrorModel } from "@/app/models/error_model";
import {
  CategoryOptionsModel,
  ExerciseModel,
} from "@/app/models/exercise_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import {
  createExerciseCategory,
  deleteExercise,
  deleteExerciseCategory,
  getExerciseCategories,
  saveExercise,
  updateExerciseCategory,
} from "@/app/services/client_side/exercises";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { validateForm } from "./validation";
const SelectCmp = dynamic(() => import("@/app/components/elements/SelectCmp"), {
  ssr: false,
});
const ConfirmModal = dynamic(
  () => import("@/app/components/elements/ConfirmModal"),
  { ssr: false }
);
const CreateCategoryModal = dynamic(
  () => import("@/app/components/exercises/create-category-modal"),
  { ssr: false }
);
const CategoryListModal = dynamic(
  () => import("@/app/components/exercises/category-list-modal"),
  { ssr: false }
);
const ModalRename = dynamic(
  () => import("@/app/components/elements/ModalRename"),
  { ssr: false }
);

interface Props {
  action: "Create" | "Edit";
  exercise?: ExerciseModel;
}

export default function ExerciseForm({ action = "Create", exercise }: Props) {
  const { showSnackBar } = useSnackBar();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<CategoryOptionsModel | null>(null);
  const [sets, setSets] = useState<number>(1);
  const [reps, setReps] = useState<number>(1);
  const [hold, setHold] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  const [howTo, setHowTo] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [categoryName, setCategoryName] = useState<string>("");
  const [categoryList, setCategoryList] = useState<CategoryOptionsModel[]>([]);
  const [catToEditDelete, setCatToEditDelete] = useState<CategoryOptionsModel>({
    label: "",
    value: "",
  });
  const [isDeleteCat, setIsDeleteCat] = useState(false);
  const [isCategoryProcessing, setIsCategoryProcessing] =
    useState<boolean>(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState(false);
  const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
  const [categoryConfirmModalOpen, setCategoryConfirmModalOpen] =
    useState(false);
  const [renameCatModalOpen, setRenameCatModalOpen] = useState(false);

  useEffect(() => {
    if (action === "Edit" && exercise) {
      setName(exercise.name);
      setCategory({
        label: exercise.exercise_category.value,
        value: exercise.exercise_category.id.toString(),
      });
      setSets(exercise.sets);
      setReps(exercise.reps);
      setHold(exercise.hold);
      setDescription(exercise.description ?? "");
      setHowTo(exercise.how_to ?? "");
    }
  }, [exercise]);

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setDeleteModalOpen(false);
      setAddCategoryModalOpen(false);
      setCategoryConfirmModalOpen(false);
      setCategoriesModalOpen(false);
      setRenameCatModalOpen(false);
    }
  };

  const isValid = () => {
    const validationErrors = validateForm({
      name,
      category,
      photo: photo ?? exercise?.photo,
      video: video ?? exercise?.video,
      sets: sets,
      reps: reps,
      hold: hold,
    });
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  useEffect(() => {
    if (errors.length > 0) {
      const errorMessages = errors.map((error) => error.message).join("\n");
      showSnackBar({ message: errorMessages, success: false });
    }
  }, [errors]);

  const handlePhotoSelect = (file: File | null) => {
    setPhoto(file);
  };

  const handleVideoSelect = (file: File | null) => {
    setVideo(file);
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const method = action === "Create" ? "POST" : "PUT";
        const id = action === "Edit" ? exercise!.id : null;

        const body = new FormData();
        body.append("name", name);
        body.append("category_id", category!.value);
        body.append("sets", sets.toString());
        body.append("reps", reps.toString());
        body.append("hold", hold.toString());
        body.append("description", description);
        body.append("how_to", howTo);
        if (photo) body.append("photo", photo, photo.name);
        if (video) {
          const blob = new Blob([video], { type: getFileContentType(video) });
          body.append("video", blob, video.name);
        }

        await saveExercise({ method, id, body });
        await revalidatePage("/exercises");
        setIsProcessing(false);
        showSnackBar({
          message: `Exercise successfully ${
            action === "Create" ? "created" : "updated"
          }.`,
          success: true,
        });
        setModalOpen(false);
        clearData();
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setModalOpen(false);
      }
    }
  };

  const onSave = () => {
    if (isValid()) {
      setModalOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!isProcessing && action === "Edit") {
      try {
        setIsProcessing(true);
        await deleteExercise(exercise!.id);
        await revalidatePage("/exercises");
        setIsProcessing(false);
        showSnackBar({
          message: `Exercise successfully deleted.`,
          success: true,
        });
        setModalOpen(false);
        router.push("/exercises");
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsProcessing(false);
        setDeleteModalOpen(false);
      }
    }
  };

  const hasError = (fieldName: string) => {
    return errors.some((error) => error.fieldName === fieldName);
  };

  const clearData = () => {
    setName("");
    setCategory(null);
    setSets(1);
    setReps(1);
    setHold(1);
    setDescription("");
    setHowTo("");
    setPhoto(null);
    setVideo(null);
  };

  const Label = ({
    label,
    required,
  }: {
    label: string;
    required?: boolean;
  }) => {
    return (
      <p className="font-medium mb-2">
        {label} {required && <ReqIndicator />}
      </p>
    );
  };

  const handleAddCat = (name: string) => {
    setCategoryName(name);
    setAddCategoryModalOpen(false);
    setCategoryConfirmModalOpen(true);
  };

  const handleAddCatConfirm = async () => {
    if (!isCategoryProcessing) {
      try {
        setIsCategoryProcessing(true);
        if (isDeleteCat) {
          await deleteExerciseCategory(catToEditDelete.value);
          showSnackBar({
            message: "Category successfully deleted.",
            success: true,
          });
        } else {
          await createExerciseCategory({ name: categoryName });
          showSnackBar({
            message: "Category successfully added.",
            success: true,
          });
        }
        setIsCategoryProcessing(false);
        setCategoryConfirmModalOpen(false);
        setIsDeleteCat(false);
        await getCategories();
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsCategoryProcessing(false);
        setCategoryConfirmModalOpen(false);
      }
    }
  };

  const getCategories = async () => {
    try {
      const list = await getExerciseCategories();
      const transformList = list.map((el) => ({
        label: el.value,
        value: el.id.toString(),
      }));
      setCategoryList(transformList);
    } catch (error) {
      const apiError = error as ErrorModel;
      const errorMessage =
        apiError.msg || "Failed to fetch exercise categories";
      throw new Error(errorMessage);
    }
  };

  const handleEditCatClick = (category: CategoryOptionsModel) => {
    setCatToEditDelete(category);
    setCategoriesModalOpen(false);
    setRenameCatModalOpen(true);
  };

  const handleDeleteCatClick = (category: CategoryOptionsModel) => {
    setIsDeleteCat(true);
    setCatToEditDelete(category);
    setCategoriesModalOpen(false);
    setCategoryConfirmModalOpen(true);
  };

  const handleRenameClick = async (name: string) => {
    if (!isCategoryProcessing) {
      try {
        setIsCategoryProcessing(true);
        await updateExerciseCategory({ id: catToEditDelete.value, name: name });
        setIsCategoryProcessing(false);
        showSnackBar({
          message: "Category successfully renamed.",
          success: true,
        });
        setRenameCatModalOpen(false);
        await getCategories();
      } catch (error) {
        const apiError = error as ErrorModel;

        if (apiError && apiError.msg) {
          showSnackBar({ message: apiError.msg, success: false });
        }
        setIsCategoryProcessing(false);
        setRenameCatModalOpen(false);
      }
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <>
      <div className="flex items-center mb-5 sm:mb-7">
        <div>
          <h1 className="text-2xl font-semibold">{action} Exercise</h1>
          <p className="text-sm text-neutral-600">
            {action === "Create"
              ? CREATE_EXERCISE_DESCRIPTION
              : UPDATE_DESCRIPTION}
          </p>
        </div>
        <div className="hidden sm:flex ml-auto space-x-3">
          <Link href="/exercises">
            <Button label="Cancel" secondary />
          </Link>
          <Button label="Save" onClick={onSave} />
        </div>
      </div>
      <hr />
      <div className="flex flex-col sm:flex-row mt-3 sm:mt-8">
        <div className="w-full sm:w-[636px] sm:p-5 space-y-4 sm:mr-6 mb-4 sm:mb-0 z-10 rounded-lg sm:bg-white sm:drop-shadow-center">
          <div>
            <Label label="Exercise Name" required />
            <Input
              type="text"
              placeholder="Enter exercise name"
              value={name}
              invalid={hasError("name")}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <div className="flex justify-between">
              <Label label="Category" required />
              <span
                className="text-primary-500 cursor-pointer"
                onClick={() => setAddCategoryModalOpen(true)}
              >
                + Add a new category
              </span>
            </div>
            <SelectCmp
              options={categoryList}
              value={category}
              invalid={hasError("category")}
              onChange={(e) => setCategory(e)}
              placeholder="Choose category"
            />
            <span
              className="text-sm text-neutral-600 cursor-pointer underline"
              onClick={() => setCategoriesModalOpen(true)}
            >
              View All Categories
            </span>
          </div>
          <div className="flex space-x-3">
            <div>
              <Label label="No. of Sets" />
              <Input
                type="number"
                placeholder="0"
                value={sets}
                min={1}
                onChange={(e) => setSets(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label label="No. of Reps" />
              <Input
                type="number"
                placeholder="0"
                value={reps}
                min={1}
                onChange={(e) => setReps(parseInt(e.target.value))}
              />
            </div>
            <div>
              <Label label="No. of Hold" />
              <Input
                type="number"
                placeholder="0"
                value={hold}
                min={1}
                onChange={(e) => setHold(parseInt(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label label="Description" />
            <Textarea
              placeholder="Enter the exercise's description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-[100px]"
            />
          </div>
          <UploadCmp
            key="upload1"
            label="Upload a Photo"
            onFileSelect={handlePhotoSelect}
            clearImagePreview={photo === null}
            type="image"
            recommendedText="405 x 225 pixels"
            isEdit={action === "Edit"}
          />
        </div>
        <div>
          <div className="sm:w-[446px] sm:h-fit z-10 rounded-lg sm:bg-white sm:p-5 sm:drop-shadow-center">
            <div className="mb-2">
              <Label label="How to" />
              <Textarea
                placeholder="Enter the video's description"
                rows={5}
                value={howTo}
                onChange={(e) => setHowTo(e.target.value)}
              />
            </div>
            <UploadCmp
              key="upload2"
              label="Upload a Video"
              onFileSelect={handleVideoSelect}
              clearImagePreview={video === null}
              type="video"
              isEdit={action === "Edit"}
            />
          </div>
          {action === "Edit" && (
            <Button
              label="Delete"
              outlined
              className="mt-5 ml-auto hidden sm:block"
              onClick={() => setDeleteModalOpen(true)}
            />
          )}
        </div>
        <div className="sm:hidden order-last flex flex-col w-full mt-6 space-y-3">
          <Link href="/exercises">
            <Button label="Cancel" secondary className="w-full" />
          </Link>
          <Button label="Save" onClick={onSave} />
        </div>
        <CreateCategoryModal
          isOpen={addCategoryModalOpen}
          onClose={handleCloseModal}
          onAddClick={handleAddCat}
        />
        <CategoryListModal
          isOpen={categoriesModalOpen}
          onClose={handleCloseModal}
          categories={categoryList}
          onEditClick={handleEditCatClick}
          onDeleteClick={handleDeleteCatClick}
        />
        <ModalRename
          isOpen={renameCatModalOpen}
          onClose={handleCloseModal}
          name={catToEditDelete.label}
          onSaveClick={handleRenameClick}
          isProcessing={isCategoryProcessing}
          label="Category"
        />
        <ConfirmModal
          title={`Are you sure you want to ${
            action === "Create" ? "create this exercise?" : "save this changes?"
          } `}
          subTitle={CONFIRM_SAVE_DESCRIPTION}
          isOpen={modalOpen}
          confirmBtnLabel="Save"
          isProcessing={isProcessing}
          onConfirm={handleConfirm}
          onClose={handleCloseModal}
        />
        {action === "Edit" && (
          <ConfirmModal
            title="Are you sure you want to delete this exercise?"
            subTitle={CONFIRM_DELETE_DESCRIPTION}
            isOpen={deleteModalOpen}
            confirmBtnLabel="Delete"
            isProcessing={isProcessing}
            onConfirm={handleDeleteConfirm}
            onClose={handleCloseModal}
          />
        )}
        <ConfirmModal
          title={`Are you sure you want to ${
            isDeleteCat ? "delete this" : "create this new"
          } category?`}
          subTitle={CONFIRM_DELETE_DESCRIPTION}
          isOpen={categoryConfirmModalOpen}
          confirmBtnLabel="Confirm"
          isProcessing={isCategoryProcessing}
          onConfirm={handleAddCatConfirm}
          onClose={handleCloseModal}
        />
      </div>
    </>
  );
}
