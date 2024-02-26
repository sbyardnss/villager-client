import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import AlertModalTemplate from './template';

// Store the root and modalRoot in a way that persists across calls
let root: Root | null = null;
let modalRoot: HTMLDivElement | null = null;

export const showAlertModal = (message: string) => {
  // Cleanup if a root or modalRoot already exists
  if (root) {
    root.unmount();
    document.body.removeChild(modalRoot as HTMLDivElement);
  }

  // Create a new div to attach the modal to
  modalRoot = document.createElement('div');
  document.body.appendChild(modalRoot);

  // Create a new root and render the AlertModal component
  root = createRoot(modalRoot);
  root.render(<AlertModalTemplate message={message} onClose={() => removeModal()} />);
};

function removeModal() {
  // Cleanup the root and modalRoot
  if (root) {
    root.unmount();
    document.body.removeChild(modalRoot as HTMLDivElement);
    root = null;
    modalRoot = null;
  }
}