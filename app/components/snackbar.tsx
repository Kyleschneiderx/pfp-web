"use client";

import clsx from "clsx";
import { useEffect, useRef } from "react";

interface Props {
  message: string;
  isVisible: boolean;
  success: boolean;
  onClose: () => void;
}

const SnackBar: React.FC<Props> = ({
  success,
  message,
  isVisible,
  onClose,
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", onClose);
    return () => {
      document.removeEventListener("mousedown", onClose);
    };
  }, []);

  return (
    <div
      ref={divRef}
      className={clsx(
        "w-full z-[999] sm:w-auto fixed top-5 sm:left-1/2 sm:transform sm:-translate-x-1/2 px-3",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div
        className={clsx(
          "w-full px-5 py-2 rounded-md shadow-lg transition-all",
          "whitespace-pre-line",
          success ? "bg-success-500 text-white" : "bg-error-300"
        )}
        role="alert"
      >
        {message}
      </div>
    </div>
  );
};

export default SnackBar;
