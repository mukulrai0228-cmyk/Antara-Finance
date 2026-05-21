'use client';

import React from 'react';
import { X, Trash2 } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message?: string;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message = 'Are you sure you want to delete this ?',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[32px] border border-slate-200/60 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-slide-up relative flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100 bg-white">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Delete</h3>
          <button
            onClick={onClose}
            type="button"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Center Content */}
        <div className="flex flex-col items-center py-8">
          {/* Trash Icon Circle */}
          <div className="w-28 h-28 rounded-full bg-blue-50/80 border border-blue-100/50 flex items-center justify-center mb-6">
            <Trash2 className="w-12 h-12 text-blue-600 stroke-[2.25]" />
          </div>

          {/* Bold Title */}
          <h4 className="text-xl sm:text-2xl font-bold text-slate-900 text-center mb-2">
            {title}
          </h4>

          {/* Subtitle */}
          <p className="text-slate-500 text-center text-sm sm:text-base font-medium">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            onClick={onClose}
            type="button"
            className="flex-1 py-3.5 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50/50 font-bold rounded-full transition-all focus:outline-none cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            type="button"
            className="flex-1 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full transition-all focus:outline-none shadow-md shadow-blue-500/10 cursor-pointer text-center"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
