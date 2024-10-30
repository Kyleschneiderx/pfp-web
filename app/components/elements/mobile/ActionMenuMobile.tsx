"use client";

import { useActionMenuStore } from "@/app/store/store";
import clsx from "clsx";
import Link from "next/link";
import { useEffect } from "react";

interface Props {
  onDeleteClick?: () => void;
  onRenameClick?: () => void;
  onSendInviteClick?: () => void;
}

export default function ActionMenuMobile({
  onDeleteClick,
  onRenameClick,
  onSendInviteClick,
}: Props) {
  const { patient, exercise, editUrl, isOpen, setIsOpen } = useActionMenuStore();

  useEffect(() => {
    return () => {
      setIsOpen(false);
    }
  }, []);

  const itemClass =
    "block w-full py-2 hover:bg-primary-100 hover:text-primary-500 cursor-pointer";

  return (
    <div className="sm:hidden">
      {/* Background overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Action menu */}
      <div
        className={clsx(
          "fixed bottom-0 w-full left-1/2 -translate-x-1/2 z-20 transform transition-transform duration-300 ease-in-out",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="bg-white p-5 font-semibold rounded-t-2xl rounded-b-none">
          <p className="text-xl text-center mb-2">{patient?.user_profile?.name || exercise?.name}</p>
          <ul>
            <li>
              <Link href={editUrl} className={itemClass}>
                <span>Edit</span>
              </Link>
            </li>
            {onRenameClick && (
              <li>
                <Link href="#" className={itemClass} onClick={onRenameClick}>
                  <span>Rename</span>
                </Link>
              </li>
            )}
            {onSendInviteClick && patient?.can_invite && (
              <li>
                <Link
                  href="#"
                  className={itemClass}
                  onClick={onSendInviteClick}
                >
                  <span>Send invite</span>
                </Link>
              </li>
            )}
            <li>
              <Link href="#" className={itemClass} onClick={onDeleteClick}>
                <span className="text-error-500">Delete</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
