import { X } from "lucide-react";
import Modal from "react-modal";

Modal.setAppElement("#modal"); // Important for accessibility, especially with Next.js

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  handleClose?: () => void;
  showCloseBtn?: boolean;
  title?: string;
  children: React.ReactNode;
}

const ModalCmp: React.FC<Props> = ({
  isOpen,
  onClose,
  title,
  handleClose,
  showCloseBtn = false,
  children,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="relative mx-auto bg-white p-6 rounded-2xl shadow-lg z-50 focus:outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
    >
      {showCloseBtn && (
        <div className="flex justify-between mb-4">
          <p className="text-lg font-semibold">{title}</p>
          <X
            className="cursor-pointer"
            size={20}
            onClick={handleClose}
          />
        </div>
      )}
      {children}
    </Modal>
  );
};

export default ModalCmp;
