"use client";

import Card from "@/app/components/elements/Card";
import { useSnackBar } from "@/app/contexts/SnackBarContext";
import clsx from "clsx";
import { Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  className?: string;
}

export default function UploadCmp({ className }: Props) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { showSnackBar } = useSnackBar();

  const onDrop = (acceptedFiles: File[]) => {
    // Get the name of the first file
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
    }
  };

  const onDropRejected = (fileRejections: any) => {
    const error = fileRejections[0]?.errors[0];
    if (error.code === "file-invalid-type") {
      showSnackBar({
        message: "Only JPEG, JPG, and PNG files are allowed.",
        success: false,
      });
    } else if (error.code === "file-too-large") {
      showSnackBar({
        message: "File size exceeds the 5MB limit.",
        success: false,
      });
    } else {
      showSnackBar({ message: "File upload failed.", success: false });
    }
    setImagePreview(null);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      onDropRejected,
      accept: {
        "image/jpeg": [".jpeg", ".jpg"],
        "image/png": [".png"],
      },
      maxSize: 5242880, //5 mb
      multiple: false,
    });

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <Card className={clsx("w-[446px] h-fit p-[22px]", className)}>
      <p className="font-medium mb-2">Upload a Photo</p>
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
          <p className="mt-2">JPEG, JPG or PNG</p>
          <p className="text-sm">(Max file size: 5MB)</p>
          {imagePreview && (
            <div className="mt-2 flex justify-center">
              <Image src={imagePreview} alt="Preview" width={70} height={70} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
