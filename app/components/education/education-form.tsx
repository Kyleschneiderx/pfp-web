"use client";

import Button from "@/app/components/elements/Button";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import { revalidatePage } from "@/app/lib/revalidate";
import { convertDraftjsToHtml, getFileContentType } from "@/app/lib/utils";
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
import MobilePreview from "./MobilePreview";
import { validateForm } from "./validation";

const RichTextEditor = dynamic(
  () => import("@/app/components/elements/RichTextEditor"),
  { ssr: false }
);

const ConfirmModal = dynamic(
  () => import("@/app/components/elements/ConfirmModal"),
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
  const [content, setContent] = useState(EditorState.createEmpty());
  const [photo, setPhoto] = useState<File | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [mediaUpload, setMediaUpload] = useState<File | null>(null);
  const [statusId, setStatusId] = useState<"4" | "5">("4");

  const [errors, setErrors] = useState<ValidationErrorModel[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [descCount, setDescCount] = useState<number>(0);
  const [editInfo, setEditInfo] = useState<boolean>(
    action === "Create" ? true : false
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (action === "Edit" && education) {
      setTitle(education.title);
      setDescription(education.description);
      setMediaUrl(education.media_url ?? "");
      setDescCount(education.description.length);
      if (typeof window !== "undefined") {
        const htmlToDraft = require("html-to-draftjs").default;
        const blocksFromHtml = htmlToDraft(education.content);
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(
          contentBlocks,
          entityMap
        );
        setContent(EditorState.createWithContent(contentState));
      }
    }
  }, [education]);

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

        const htmlContent = convertDraftjsToHtml(content);

        body.append("title", title);
        body.append("description", description);
        body.append("content", htmlContent);
        body.append("status_id", statusId);
        if (photo) body.append("photo", photo, photo.name);
        if (mediaUrl) body.append("media_url", mediaUrl);
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
        setIsSaved(true);
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
    setMediaUrl("");
    setMediaUpload(null);
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

  const handleEditorChange = (content: EditorState) => {
    setContent(content);
    setIsSaved(false);
  };

  return (
    <>
      <div className="flex items-center mb-7">
        <div>
          <h1 className="text-2xl font-semibold">{action} Education</h1>
          <p className="text-sm text-neutral-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit ante ipsum
            primis in faucibus.
          </p>
        </div>
        <div className="flex ml-auto space-x-3">
          <Link href="/education">
            <Button label="Cancel" secondary />
          </Link>
          <Button label="Save as Draft" outlined onClick={onDraft} />
          <Button label="Save & Publish" onClick={onPublish} />
        </div>
      </div>
      <hr />
      <div className="flex mt-4">
        <div className="space-y-4">
          <Card className="w-[592px] h-fit p-[22px]">
            <UploadCmp
              key="upload1"
              label="Thumbnail"
              onFileSelect={handlePhotoSelect}
              clearImagePreview={photo === null}
              type="image"
              recommendedText="405 x 225 pixels"
            />
          </Card>
          <Card className="w-[592px] p-[22px] mr-5 space-y-3">
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
                <span className="text-neutral-600 text-sm">{descCount}/60</span>
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
              <Label label="Content" />
              <RichTextEditor
                placeholder="Enter the education's content here"
                content={education?.content ?? null}
                onChange={handleEditorChange}
                isSaved={isSaved}
                isEdit={action === "Edit"}
              />
            </div>
          </Card>
          <Card className="w-[592px] p-[22px] space-y-3">
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
              clearImagePreview={photo === null}
              type="image/video"
            />
          </Card>
        </div>
        <MobilePreview
          banner={photo || education?.photo}
          title={title}
          description={description}
          media={mediaUpload || mediaUrl || education?.media_upload}
          content={content}
        />
      </div>
      <ConfirmModal
        title={`Are you sure you want to ${
          action === "Create" ? "create this education?" : "save this changes?"
        } `}
        subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
        isOpen={modalOpen}
        confirmBtnLabel="Save"
        isProcessing={isProcessing}
        onConfirm={handleConfirm}
        onClose={handleCloseModal}
      />
      {action === "Edit" && (
        <ConfirmModal
          title="Are you sure you want to delete this education?"
          subTitle="Lorem Ipsum is simply dummy text of the printing and typesetting industry Lorem Ipsum been."
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
