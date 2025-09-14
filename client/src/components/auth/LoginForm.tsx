import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, isLoading, error } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!identifier || !password) {
      setLocalError('Введите логин и пароль');
      return;
    }
    // передаём универсальное поле identifier для логина или email
    await login({ identifier, password } as any);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Логин или Email</Label>
        <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {(localError || error) && <p className="text-sm text-red-500">{localError || error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>Войти</Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onSwitch}>Создать аккаунт</Button>
    </form>
  );
}



