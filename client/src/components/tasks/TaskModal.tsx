import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TaskForm, TaskFormValues } from '@/components/tasks/TaskForm';

export function TaskModal({
  open,
  title,
  initialValues,
  submitLabel = 'Сохранить',
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  initialValues?: TaskFormValues;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-light text-foreground">{title}</DialogTitle>
        </DialogHeader>
        <TaskForm
          initialValues={initialValues}
          submitLabel={submitLabel}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
}


