import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { checkLoginAvailability } from '@/lib/api';

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
    if (!login || !password) {
      setLocalError('Введите логин и пароль');
      return;
    }
    // Проверка уникальности логина
    try {
      const res = await checkLoginAvailability(login.trim());
      if (!res?.data?.available) {
        setLocalError('Логин уже занят');
        return;
      }
    } catch {
      // тихо продолжаем — проверка продублируется на сервере после миграции
    }
    // Совместимость с текущим API: используем login как name;
    // если email не указан, генерируем временный placeholder (уникальный),
    // чтобы пройти текущие серверные ограничения до миграции БД (Этап 2).
    const safeEmail = email && email.trim().length > 0
      ? email.trim()
      : `${login.trim()}-${Date.now()}@noemail.local`;

    await register({ login: login.trim(), name: login.trim(), email: safeEmail, password });
    navigate('/auth');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login">Логин</Label>
        <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
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
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {(localError || error) && <p className="text-sm text-red-500">{localError || error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>Зарегистрироваться</Button>
      <Button type="button" variant="ghost" className="w-full" onClick={onSwitch}>У меня уже есть аккаунт</Button>
    </form>
  );
}




