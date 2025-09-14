import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { checkLoginAvailability } from '@/lib/api';
const IDENTITY_MODE = (import.meta as any).env?.VITE_AUTH_IDENTITY_MODE === 'email' ? 'email' : 'login';

export function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register, isLoading, error } = useAuth();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState(''); // опционально
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if ((IDENTITY_MODE === 'login' && !login) || !password) {
      setLocalError(IDENTITY_MODE === 'login' ? 'Логин и пароль обязательны' : 'Email и пароль обязательны');
      return;
    }
    // Проверка уникальности логина
    if (IDENTITY_MODE === 'login' && login.trim()) {
      try {
        const res = await checkLoginAvailability(login.trim());
        if (!res?.data?.available) {
          setLocalError('Логин уже занят');
          return;
        }
      } catch {}
    }
    // Совместимость с текущим API: используем login как name;
    // если email не указан, генерируем временный placeholder (уникальный),
    // чтобы пройти текущие серверные ограничения до миграции БД (Этап 2).
    const safeEmail = email && email.trim().length > 0
      ? email.trim()
      : (IDENTITY_MODE === 'login' ? `${login.trim()}-${Date.now()}@noemail.local` : undefined);

    await register({ login: (IDENTITY_MODE === 'login' ? login.trim() : (email?.trim() || '')), name: login.trim() || (email?.trim() || ''), email: safeEmail, password });
    navigate('/auth');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="login">Логин</Label>
          <span className="text-xs text-muted-foreground">обязательно</span>
        </div>
        <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Придумайте логин" />
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="email">Email</Label>
          <span className="text-xs text-muted-foreground">необязательно</span>
        </div>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@пример.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Пароль</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Минимум 8 символов" />
      </div>
      {(localError || error) && <p className="text-sm text-red-500">{localError || error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>Зарегистрироваться</Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onSwitch}>У меня уже есть аккаунт</Button>
    </form>
  );
}




