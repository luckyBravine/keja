'use client';

import React from 'react';

export interface UnsavedChangesPromptProps {
  open: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  onCancel: () => void;
  saving?: boolean;
  title?: string;
  message?: string;
}

export default function UnsavedChangesPrompt({
  open,
  onSave,
  onDiscard,
  onCancel,
  saving = false,
  title = 'Unsaved changes',
  message = 'You have unsaved changes. Save before leaving?',
}: UnsavedChangesPromptProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row-reverse gap-3 sm:gap-2">
          <button
            type="button"
            onClick={() => onSave()}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onDiscard}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Don&apos;t save
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 sm:mr-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
