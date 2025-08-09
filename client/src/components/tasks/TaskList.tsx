import { Button } from '@/components/ui/button';

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
        <div key={t.id} className="flex items-center gap-3 p-3 card-element">
          <input type="checkbox" className="w-5 h-5" checked={t.completed} onChange={() => onToggle(t.id)} />
          <div className="flex-1">
            <div className={`text-foreground ${t.completed ? 'line-through opacity-60' : ''}`}>{t.title}</div>
            {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(t.id)}>Изм.</Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(t.id)}>Удал.</Button>
          </div>
        </div>
      ))}
    </div>
  );
}


