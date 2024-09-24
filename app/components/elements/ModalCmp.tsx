import { X } from "lucide-react";
import Modal from "react-modal";

Modal.setAppElement("#modal"); // Important for accessibility, especially with Next.js

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  handleClose?: () => void;
  showCloseBtn?: boolean;
  contentLabel: string;
  children: React.ReactNode;
}

const ModalCmp: React.FC<Props> = ({
  isOpen,
  onClose,
  contentLabel,
  handleClose,
  showCloseBtn = false,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={contentLabel}
      className="relative mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
    >
      {children}
      {showCloseBtn && (
        <X
          size={20}
          className="absolute top-4 right-4 text-neutral-600"
          onClick={handleClose}
        />
      )}
    </Modal>
  );
};

export default ModalCmp;
