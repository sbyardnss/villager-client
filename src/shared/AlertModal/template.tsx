// import { ModalContainer, ModalContent, CloseButton } from './alert-modal-styles'; // Adjust the import path as necessary
import "./alert-modal-styles.css";
interface AlertModalTemplateProps {
  message: string;
  onClose?: () => void;
}

const AlertModalTemplate: React.FC<AlertModalTemplateProps> = ({ message, onClose }) => {
  // Use the response to determine the content and styling of the modal
  return (
    <div className="alert-modal">
      <div className="alert-modal-content">
        <p className="alert-modal-message">{message}</p>
        <button className="alert-close-button" onClick={onClose}>close</button>
      </div>
    </div>
  );
};

export default AlertModalTemplate;