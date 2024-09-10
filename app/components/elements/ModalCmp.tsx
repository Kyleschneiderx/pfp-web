
import Modal from 'react-modal';

Modal.setAppElement("#main"); // Important for accessibility, especially with Next.js

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contentLabel: string;
  children: React.ReactNode;
}

const ModalCmp: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  contentLabel, 
  children 
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={contentLabel}
      className="relative mx-auto bg-white p-6 rounded-2xl shadow-lg z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40"
    >
      {children}
    </Modal>
  );
};

export default ModalCmp;
