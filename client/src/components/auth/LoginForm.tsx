import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Введите email и пароль');
      return;
    }
    await login({ email, password });
    navigate('/');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {(localError || error) && <p className="text-sm text-red-500">{localError || error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>Войти</Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onSwitch}>Нет аккаунта? Зарегистрируйтесь</Button>
    </form>
  );
}



