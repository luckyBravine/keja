'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseUnsavedChangesOptions {
  /** Called when user chooses "Save" in the prompt. Return a Promise if save is async. */
  onSave?: () => void | Promise<void>;
}

/**
 * Safety net for forms: warns when leaving with unsaved changes.
 * - Adds browser beforeunload (tab close / refresh).
 * - Provides confirmLeave() to show a Save / Don't save / Cancel dialog before closing the form.
 */
export function useUnsavedChanges(
  isDirty: boolean,
  options: UseUnsavedChangesOptions = {}
): {
  confirmLeave: (saveOption?: { onSave?: () => void | Promise<void> }) => Promise<boolean>;
  showPrompt: boolean;
  promptHandlers: {
    onSave: () => Promise<void>;
    onDiscard: () => void;
    onCancel: () => void;
    saving: boolean;
  };
} {
  const [showPrompt, setShowPrompt] = useState(false);
  const [saving, setSaving] = useState(false);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const { onSave: defaultOnSave } = options;

  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const confirmLeave = useCallback(
    (saveOption?: { onSave?: () => void | Promise<void> }): Promise<boolean> => {
      if (!isDirty) return Promise.resolve(true);
      setShowPrompt(true);
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    },
    [isDirty]
  );

  const handleSave = useCallback(async () => {
    const saveFn = defaultOnSave;
    if (!saveFn) {
      resolveRef.current?.(true);
      setShowPrompt(false);
      resolveRef.current = null;
      return;
    }
    setSaving(true);
    try {
      await saveFn();
      resolveRef.current?.(true);
      setShowPrompt(false);
      resolveRef.current = null;
    } catch {
      // Keep prompt open on save error so user can fix or choose Don't save
    } finally {
      setSaving(false);
    }
  }, [defaultOnSave]);

  const handleDiscard = useCallback(() => {
    resolveRef.current?.(true);
    setShowPrompt(false);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    setShowPrompt(false);
    resolveRef.current = null;
  }, []);

  return {
    confirmLeave,
    showPrompt,
    promptHandlers: {
      onSave: handleSave,
      onDiscard: handleDiscard,
      onCancel: handleCancel,
      saving,
    },
  };
}
