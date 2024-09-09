"use client";

import Card from "@/app/components/elements/Card";
import clsx from "clsx";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";

interface Props {
  className?: string;
}

export default function UploadCmp({ className }: Props) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = (acceptedFiles: File[]) => {
    // Get the name of the first file
    if (acceptedFiles.length > 0) {
      setFileName(acceptedFiles[0].name);
    }
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept: {
        "image/jpeg": [".jpeg", ".jpg"],
        "image/png": [".png"],
      },
      maxSize: 26214400, //25 mb
      multiple: false,
    });

  return (
    <Card className={clsx("w-[446px] h-[292px] p-[22px]", className)}>
      <p className="font-medium mb-2">Upload a Photo</p>
      <div
        {...getRootProps()}
        className={clsx(
          "flex flex-col items-center justify-center border-2 border-dashed rounded-md h-[215px] bg-neutral-100 cursor-pointer",
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
          <p className="text-sm">(Max file size: 25MB)</p>
          {fileName && (
            <p className="text-sm text-primary-500 mt-2">
              Uploaded: {fileName}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
