import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

type TaskFormValues = {
  title: string;
  description?: string;
  dueDate?: string; // ISO string
  priority?: number; // 1..3
};

export function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Сохранить',
}: {
  initialValues?: TaskFormValues;
  onSubmit: (values: TaskFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [title, setTitle] = useState(initialValues?.title ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [priority, setPriority] = useState<number>(initialValues?.priority ?? 2);
  const [dueLocal, setDueLocal] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialValues?.dueDate) {
      // Convert ISO to local datetime-local value (YYYY-MM-DDTHH:mm)
      const d = new Date(initialValues.dueDate);
      const pad = (n: number) => String(n).padStart(2, '0');
      const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setDueLocal(local);
    }
  }, [initialValues?.dueDate]);

  const toIsoOrNull = (local: string): string | undefined => {
    if (!local) return undefined;
    // Interpret as local time and convert to ISO
    const iso = new Date(local).toISOString();
    return iso;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description?.trim() ? description.trim() : undefined,
        priority,
        dueDate: toIsoOrNull(dueLocal),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-light text-foreground">Название</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Что нужно сделать?" />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-light text-foreground">Описание</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Короткая заметка" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-sm font-light text-foreground">Срок</Label>
          <Input type="datetime-local" value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-light text-foreground">Приоритет</Label>
          <Select value={String(priority)} onValueChange={(v) => setPriority(parseInt(v))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Низкий</SelectItem>
              <SelectItem value="2">Средний</SelectItem>
              <SelectItem value="3">Высокий</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90 text-white" disabled={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}


