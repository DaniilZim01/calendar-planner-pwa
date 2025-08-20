import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { isIOS, useFitToContainer } from '@/lib/useFitToContainer';
import { isDebugLayoutEnabled, measureElement } from '@/lib/debugLayout';

export type TaskFormValues = {
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
  const [dueLocal, setDueLocal] = useState<string>(() => {
    // default: today 23:59 local
    if (initialValues?.dueDate) return '';
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0, 0);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });
  const [submitting, setSubmitting] = useState(false);
  const debug = isDebugLayoutEnabled();
  const ios = isIOS();
  const dueWrapRef = useRef<HTMLDivElement | null>(null);
  const prioWrapRef = useRef<HTMLDivElement | null>(null);
  const dueInputRef = useRef<HTMLInputElement | null>(null);
  const [mDue, setMDue] = useState<{ w: number; h: number } | null>(null);
  const [mPrio, setMPrio] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!debug) return;
    const update = () => {
      setMDue(measureElement(dueWrapRef.current));
      setMPrio(measureElement(prioWrapRef.current));
    };
    const rAF = requestAnimationFrame(update);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      cancelAnimationFrame(rAF);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [debug, dueLocal, priority]);

  // Fit native datetime-local into wrapper on iOS
  useFitToContainer(dueWrapRef, dueInputRef, { enabled: isIOS(), padding: 2 });

  useEffect(() => {
    if (initialValues?.dueDate) {
      // Convert ISO to local datetime-local value (YYYY-MM-DDTHH:mm)
      const d = new Date(initialValues.dueDate);
      const pad = (n: number) => String(n).padStart(2, '0');
      const local = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      setDueLocal(local);
    } else if (!dueLocal) {
      // if no initial value and field empty → set default EOD today
      const now = new Date();
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0, 0);
      const pad = (n: number) => String(n).padStart(2, '0');
      setDueLocal(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`);
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
      // If user left due empty, apply default 23:59 today
      let effectiveLocal = dueLocal;
      if (!effectiveLocal) {
        const now = new Date();
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0, 0);
        const pad = (n: number) => String(n).padStart(2, '0');
        effectiveLocal = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
      }
      await onSubmit({
        title: title.trim(),
        description: description?.trim() ? description.trim() : undefined,
        priority,
        dueDate: toIsoOrNull(effectiveLocal),
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

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-4">
        <div ref={dueWrapRef} className={`space-y-2 min-w-0 max-w-full ${ios ? 'overflow-hidden rounded-md' : 'overflow-visible'} ${debug ? 'relative outline outline-1 outline-blue-400' : ''}`}>
          <Label className="text-sm font-light text-foreground">Срок</Label>
          <Input
            type="datetime-local"
            value={dueLocal}
            onChange={(e) => setDueLocal(e.target.value)}
            className="w-full min-w-0"
            ref={dueInputRef}
            style={{ fontSize: 16 }}
          />
          {debug && mDue ? (
            <span className="absolute right-1 top-1 z-10 text-[10px] bg-black/60 text-white px-1">{`W${mDue.w}×H${mDue.h}`}</span>
          ) : null}
        </div>
        <div ref={prioWrapRef} className={`space-y-2 min-w-0 max-w-full overflow-visible col-span-2 sm:col-span-1 ${debug ? 'relative outline outline-1 outline-red-400' : ''}`}>
          <Label className="text-sm font-light text-foreground">Приоритет</Label>
          <Select value={String(priority)} onValueChange={(v) => setPriority(parseInt(v))}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Низкий</SelectItem>
              <SelectItem value="2">Средний</SelectItem>
              <SelectItem value="3">Высокий</SelectItem>
            </SelectContent>
          </Select>
          {debug && mPrio ? (
            <span className="absolute right-1 top-1 z-10 text-[10px] bg-black/60 text-white px-1">{`W${mPrio.w}×H${mPrio.h}`}</span>
          ) : null}
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


