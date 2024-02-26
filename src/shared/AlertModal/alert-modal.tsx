import React from 'react';
import ReactDOM from 'react-dom';
import AlertModalTemplate from './template';

export const showAlertModal = (message: string) => {
  // Create a div to attach the modal to
  const modalRoot = document.createElement('div');
  document.body.appendChild(modalRoot);

  const removeModal = () => {
    ReactDOM.unmountComponentAtNode(modalRoot);
    document.body.removeChild(modalRoot);
  };

  // Render the AlertModal component with the removeModal function passed as onClose
  ReactDOM.render(<AlertModalTemplate message={message} onClose={removeModal} />, modalRoot);
};

export default showAlertModal;