import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // primary, danger
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" closeOnOverlayClick={!isLoading}>
      <div className="flex flex-col gap-4">
        <div className="flex gap-3 items-start">
          <div className={`p-2 rounded-lg shrink-0 ${variant === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-950/20' : 'bg-primary-50 text-primary-500 dark:bg-primary-950/20'}`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-2.5 mt-2.5">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
