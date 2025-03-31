"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import {
  CONFIRM_DELETE_DESCRIPTION,
  CONFIRM_SAVE_DESCRIPTION,
  CREATE_EDUCATION_DESCRIPTION,
  UPDATE_DESCRIPTION,
} from "@/app/lib/constants";
import { revalidatePage } from "@/app/lib/revalidate";
import { convertDraftjsToHtml, getFileContentType } from "@/app/lib/utils";
import { OptionsModel } from "@/app/models/common_model";
import { EducationModel } from "@/app/models/education_model";
import { ErrorModel } from "@/app/models/error_model";
import { ValidationErrorModel } from "@/app/models/validation_error_model";
import {
  deleteEducation,
  saveEducation,
} from "@/app/services/client_side/educations";
import { ContentState, EditorState } from "draft-js";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "../elements/Card";
import Input from "../elements/Input";
import ReqIndicator from "../elements/ReqIndicator";
import UploadCmp from "../elements/UploadCmp";
import { validateForm } from "./validation";
import TipTapEditor from "../elements/TipTapEditor";

const RichTextEditor = dynamic(
  () => import("@/app/components/elements/RichTextEditor"),
  { ssr: false }
);

const MobilePreview = dynamic(() => import("./MobilePreview"), { ssr: false });
const SmMobilePreview = dynamic(() => import("./SmMobilePreview"), {
  ssr: false,
});

const ConfirmModal = dynamic(
  () => import("@/app/components/elements/ConfirmModal"),
  { ssr: false }
);

const PfPlanDropdownList = dynamic(
  () => import("@/app/components/education/pfplan-dropdown-list"),
  { ssr: false }
);

interface Props {
  action: "Create" | "Edit";
  education?: EducationModel;
}

export default function EducationForm({ action = "Create", education }: Props) {
  const { showSnackBar } = useSnackBar();
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaUpload, setMediaUpload] = useState<File | null>(null);
  const [statusId, setStatusId] = useState<"4" | "5">("4");
  const [pfplanRef, setPfplanRef] = useState<OptionsModel | null>(null);
  const [pfplanOptions, setPfplanOptions] = useState<OptionsModel[]>([]);

  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [descCount, setDescCount] = useState<number>(0);
  const [editInfo, setEditInfo] = useState<boolean>(
    action === "Create" ? true : false
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (action === "Edit" && education) {
      setTitle(education.title);
      setDescription(education.description);
      setMediaUrl(education.media_url ?? "");
      setDescCount(education.description.length);
      setContent(education.content);
      if (education.reference_pf_plan_id) {
        const foundItem = pfplanOptions.find(
          (el) => el.value === education.reference_pf_plan_id!.toString()
        );
        setPfplanRef(foundItem ?? null);
      }
      
    }
  }, [education, pfplanOptions]);

  const handlePhotoSelect = (file: File | null) => {
    setPhoto(file);
  };

  const handleMediaSelect = (file: File | null) => {
    setMediaUpload(file);
  };

  const handleChangeDescription = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value;
    if (value.length <= 60) {
      setDescription(value);
      setDescCount(value.length);
    }
  };

  const isValid = () => {
    const validationErrors = validateForm({
      title,
      description,
      content,
      photo: photo ?? education?.photo,
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

  const handleCloseModal = () => {
    if (!isProcessing) {
      setModalOpen(false);
      setDeleteModalOpen(false);
    }
  };

  const onPublish = () => {
    if (isValid()) {
      setStatusId("5");
      setModalOpen(true);
    }
  };

  const onDraft = () => {
    if (isValid()) {
      setStatusId("4");
      setModalOpen(true);
    }
  };

  const handleConfirm = async () => {
    if (!isProcessing) {
      try {
        setIsProcessing(true);
        const method = action === "Create" ? "POST" : "PUT";
        const id = action === "Edit" ? education!.id : null;
        const body = new FormData();

        body.append("title", title);
        body.append("description", description);
        body.append("content", content);
        body.append("status_id", statusId);
        if (photo) body.append("photo", photo, photo.name);
        body.append("media_url", mediaUrl);
        if (mediaUpload) {
          const ext = mediaUpload.name.split(".").pop()!.toLowerCase();
          if (["mp4", "avi", "mov", "wmv", "mkv"].includes(ext)) {
            const blob = new Blob([mediaUpload], {
              type: getFileContentType(mediaUpload),
            });
            body.append("media_upload", blob, mediaUpload.name);
          } else {
            body.append("media_upload", mediaUpload, mediaUpload.name);
          }
        }
        if (pfplanRef) {
          body.append("reference_pf_plan_id", pfplanRef.value);
        }

        await saveEducation({ method, id, body });
        await revalidatePage("/education");
        setIsProcessing(false);
        showSnackBar({
          message: `Education successfully ${
            action === "Create" ? "created" : "updated"
          }.`,
          success: true,
        });
        setModalOpen(false);
        clearData();
        // setIsSaved(true);
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

  const handleDeleteConfirm = async () => {
    if (!isProcessing && action === "Edit") {
      try {
        setIsProcessing(true);
        await deleteEducation(education!.id);
        await revalidatePage("/education");
        setIsProcessing(false);
        showSnackBar({
          message: `Education successfully deleted.`,
          success: true,
        });
        setModalOpen(false);
        router.push("/education");
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

  const clearData = () => {
    setTitle("");
    setDescription("");
    setPhoto(null);
    setContent("");
    setMediaUrl("");
    setMediaUpload(null);
    setPfplanRef(null);
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

  const hasError = (fieldName: string) => {
    return errors.some((error) => error.fieldName === fieldName);
  };

  const handleEditorChange = (content: string) => {
    setContent(content);
  };

  const handleGetPfPlanOptions = (data: OptionsModel[]) => {
    setPfplanOptions(data);
  };

  return (
    <>
      <div className={isPreviewOpen ? "hidden" : ""}>
        <div className="flex items-center mb-4 sm:mb-7">
          <div>
            <h1 className="text-2xl font-semibold">{action} Education</h1>
            <p className="text-sm text-neutral-600">
              {action === "Create"
                ? CREATE_EDUCATION_DESCRIPTION
                : UPDATE_DESCRIPTION}
            </p>
          </div>
          <div className="hidden sm:flex ml-auto space-x-3">
            <Link href="/education">
              <Button label="Cancel" secondary />
            </Link>
            <Button label="Save as Draft" outlined onClick={onDraft} />
            <Button label="Save & Publish" onClick={onPublish} />
          </div>
        </div>
        <hr />
        <div className="flex mt-5">
          <div className="space-y-4 w-full sm:w-auto">
            <Card className="sm:w-[592px] h-fit">
              <UploadCmp
                key="upload1"
                label="Thumbnail"
                onFileSelect={handlePhotoSelect}
                clearImagePreview={photo === null}
                type="image"
                recommendedText="405 x 225 pixels"
                isEdit={action === "Edit"}
              />
            </Card>
            <Card className="sm:w-[592px] sm:mr-5 space-y-3">
              <div>
                <Label label="Education Title" required />
                <Input
                  type="text"
                  placeholder="Enter education title"
                  value={title}
                  invalid={hasError("title")}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label label="Description" required />
                  <span className="text-neutral-600 text-sm">
                    {descCount}/60
                  </span>
                </div>
                <Input
                  type="text"
                  placeholder="Enter description"
                  value={description}
                  invalid={hasError("description")}
                  onChange={handleChangeDescription}
                />
              </div>
              <div>
                <div className="flex justify-between items-center">
                  <Label label="Reference PF plan" />
                </div>
                <PfPlanDropdownList
                  value={pfplanRef}
                  setValue={setPfplanRef}
                  getOptions={handleGetPfPlanOptions}
                />
              </div>
              <div>
                <Label label="Content" />
                <TipTapEditor
                  placeholder="Enter the education's content here"
                  content={content ?? undefined}
                  onChange={handleEditorChange}
                />
              </div>
            </Card>
            <Card className="sm:w-[592px] space-y-3">
              <Label label="Upload Video/Image or URL" />
              <hr />
              <div>
                <Label label="Video/Image URL" />
                <Input
                  type="text"
                  placeholder="www.yourvideolink.com"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                />
              </div>
              <p className="text-sm font-medium mb-2 text-center">OR</p>
              <UploadCmp
                key="upload2"
                label="Upload a video/image"
                onFileSelect={handleMediaSelect}
                clearImagePreview={mediaUpload === null}
                type="image/video"
                isEdit={action === "Edit"}
              />
            </Card>
            <div className="sm:hidden order-last flex flex-col w-full mt-6 space-y-3">
              <div className="flex w-full space-x-3">
                <Link href="/education" className="flex-1">
                  <Button label="Cancel" secondary className="w-full" />
                </Link>
                <div className="flex-1">
                  <Button
                    label="Save as Draft"
                    secondary
                    onClick={onDraft}
                    className="w-full"
                  />
                </div>
              </div>
              <Button label="Preview" onClick={() => setIsPreviewOpen(true)} />
              <Button label="Save & Publish" onClick={onPublish} />
            </div>
          </div>
          <div className="hidden sm:block">
            <MobilePreview
              banner={photo || education?.photo}
              title={title}
              description={description}
              media={mediaUpload || mediaUrl || education?.media_upload}
              content={content}
            />
          </div>
        </div>
      </div>
      <div className={!isPreviewOpen ? "hidden" : ""}>
        <SmMobilePreview
          banner={photo || education?.photo}
          title={title}
          description={description}
          media={mediaUpload || mediaUrl || education?.media_upload}
          content={content}
          closePreview={() => setIsPreviewOpen(false)}
        />
      </div>
      <ConfirmModal
        title={`Are you sure you want to ${
          action === "Create" ? "create this education?" : "save this changes?"
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
          title="Are you sure you want to delete this education?"
          subTitle={CONFIRM_DELETE_DESCRIPTION}
          isOpen={deleteModalOpen}
          confirmBtnLabel="Delete"
          isProcessing={isProcessing}
          onConfirm={handleDeleteConfirm}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
