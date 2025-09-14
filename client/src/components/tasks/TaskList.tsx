import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Pencil, Trash2 } from 'lucide-react';

export function TaskList({
  items,
  onToggle,
  onEdit,
  onDelete,
}: {
  items: Array<{ id: string; title: string; description: string | null; completed: boolean }>;
  onToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (!items || items.length === 0) {
    return <div className="text-sm text-muted-foreground">Пока нет задач</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-3 p-3 card-element cursor-pointer select-none rounded-lg transition-colors hover:bg-accent/10 active:bg-accent/20 active:scale-[.99]"
          onClick={() => onToggle(t.id)}
          role="button"
          aria-pressed={t.completed}
          tabIndex={0}
        >
          <Checkbox
            checked={t.completed}
            onCheckedChange={() => onToggle(t.id)}
            onClick={(e) => e.stopPropagation()}
            className="w-5 h-5 rounded-full border-2 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
          />
          <div className="flex-1 min-w-0">
            <div className={`text-sm text-foreground font-medium transition-opacity ${t.completed ? 'line-through opacity-60' : ''}`}>{t.title}</div>
            {t.description && <div className="text-xs text-muted-foreground whitespace-pre-wrap break-words">{t.description}</div>}
          </div>
          <div className="flex gap-2 ml-2">
            <Button aria-label="Редактировать задачу" variant="outline" className="w-8 h-8 p-0 rounded-full"
              onClick={(e) => { e.stopPropagation(); onEdit(t.id); }}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button aria-label="Удалить задачу" variant="outline" className="w-8 h-8 p-0 rounded-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      {/* Skeleton on heavy transitions */}
      {!items?.length && (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse h-12 rounded-lg bg-secondary/40" />
          ))}
        </div>
      )}
    </div>
  );
}


