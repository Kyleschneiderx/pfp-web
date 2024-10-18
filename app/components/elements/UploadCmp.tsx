"use client";

import { useSnackBar } from "@/app/contexts/SnackBarContext";
import clsx from "clsx";
import { FileImage, Trash2, Upload } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  label: string;
  onFileSelect: (file: File | null) => void;
  clearImagePreview: boolean;
  type: "image" | "video" | "image/video";
  recommendedText?: string;
}

export default function UploadCmp({
  label,
  onFileSelect,
  clearImagePreview,
  type,
  recommendedText,
}: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const { showSnackBar } = useSnackBar();
  const limitText = type === "image" ? "5MB" : "100MB";

  const acceptedImage = {
    "image/jpeg": [".jpeg", ".jpg"],
    "image/png": [".png"],
  };

  const acceptedVideo = {
    "video/mp4": [".mp4"],
    // "video/quicktime": [".mov"],
    // "video/x-ms-wmv": [".wmv"],
    // "video/x-msvideo": [".avi"],
    // "video/x-matroska": [".mkv"],
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        const [filename, fileExtension] = [
          file.name.split(".").slice(0, -1).join(),
          file.name.split(".").pop()?.toUpperCase() || "UNKNOWN",
        ];
        setImagePreview(URL.createObjectURL(file));
        setFileName(filename);
        setFileType(fileExtension);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const onDropRejected = useCallback(
    (fileRejections: any) => {
      const error = fileRejections[0]?.errors[0];
      if (error.code === "file-invalid-type") {
        let message = "";
        switch (type) {
          case "image":
            message = "Only JPEG, JPG, and PNG files are allowed.";
            break;
          case "video":
            message = "Only MP4 files are allowed.";
            break;
          case "image/video":
            message =
              "Only JPEG, JPG, PNG, and MP4 files are allowed.";
            break;
          default:
            break;
        }
        showSnackBar({
          message: message,
          success: false,
        });
      } else if (error.code === "file-too-large") {
        showSnackBar({
          message: `File size exceeds the ${limitText} limit.`,
          success: false,
        });
      } else {
        showSnackBar({ message: "File upload failed.", success: false });
      }
      setImagePreview(null);
      setFileName(null);
      setFileType(null);
      onFileSelect(null);
    },
    [type, limitText, showSnackBar, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      onDropRejected,
      accept:
        type === "image"
          ? acceptedImage
          : type === "video"
          ? acceptedVideo
          : {
              ...acceptedImage,
              ...acceptedVideo,
            },
      maxSize: type === "image" ? 5242880 : 104857600, // Image: 5mb, Video: 100mb
      multiple: false,
    });

  const removeSelected = () => {
    setImagePreview(null);
    setFileName(null);
    setFileType(null);
    onFileSelect(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
  };

  useEffect(() => {
    if (clearImagePreview) {
      setImagePreview(null);
      setFileName(null);
      setFileType(null);
    }
  }, [clearImagePreview]);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <div>
      <p className="font-medium mb-2">{label}</p>
      {fileName && fileType && (
        <div className="flex items-center mb-4">
          <FileImage size={20} className="text-neutral-300 mr-2" />
          <div>
            <p className="text-xs text-neutral-700 font-semibold">{fileName}</p>
            <p className="text-xs text-neutral-400">{fileType} File</p>
          </div>
          <Trash2
            size={20}
            className="ml-auto text-secondary-400 cursor-pointer"
            onClick={removeSelected}
          />
        </div>
      )}
      <div
        {...getRootProps()}
        className={clsx(
          "flex flex-col items-center py-8 justify-center border-2 border-dashed rounded-md bg-neutral-100 cursor-pointer",
          {
            "border-primary-500": isDragActive,
            "border-red-500": isDragReject,
          }
        )}
      >
        <input {...getInputProps()} />
        <div className="p-2 border rounded-full w-fit h-fit bg-white">
          <Upload size={20} className="text-primary-500" />
        </div>
        <div className="text-neutral-700 text-center mt-2">
          <p>
            <span className="text-primary-500">Click to upload</span> or drag
            and drop
          </p>
          <p className="mt-2">
            {type === "image"
              ? "JPEG, JPG or PNG"
              : type === "video"
              ? "MP4 only"
              : "JPEG, JPG, PNG or MP4"}
          </p>
          <p className="text-sm">(Max file size: {limitText})</p>
          {recommendedText && (
            <p className="text-sm">Recomended Dimentions: {recommendedText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
