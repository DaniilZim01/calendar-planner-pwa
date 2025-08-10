import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

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
          className="flex items-center gap-3 p-3 card-element cursor-pointer select-none rounded-lg transition-colors hover:bg-accent/10"
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
          <div className="flex-1">
            <div className={`text-foreground transition-opacity ${t.completed ? 'line-through opacity-60' : ''}`}>{t.title}</div>
            {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(t.id); }}>Изм.</Button>
            <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}>Удал.</Button>
          </div>
        </div>
      ))}
    </div>
  );
}


