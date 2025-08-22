import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { User, Settings, Moon, Sun, LogIn } from 'lucide-react';
import { useIsAuthenticated, useUpdateProfile } from '@/lib/hooks';
import { requestPermission, subscribePush, unsubscribePush, getExistingSubscription, toDTO } from '@/lib/push';
import { savePushSubscription, removePushSubscription, api, sendTestPush } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  name: string;
  email: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  language: string;
}

export default function ProfilePage() {
  const isAuthenticated = useIsAuthenticated();
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const updateProfile = useUpdateProfile();
  const [profile, setProfile] = useLocalStorage<UserProfile>('user_profile', {
    name: '',
    email: '',
    theme: 'light',    
    notifications: true,
    language: 'ru',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  // Apply theme whenever stored profile changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    if (profile.theme === 'dark') root.classList.add('dark');
    // Apply language immediately as well
    root.setAttribute('lang', profile.language || 'ru');
  }, [profile.theme]);
  const [authedName, setAuthedName] = useState<string>(user?.name ?? '');
  const [authedPhone, setAuthedPhone] = useState<string>(user?.phone ?? '');

  const handleSave = async () => {
    if (isAuthenticated) {
      try {
        await updateProfile.mutateAsync({ name: authedName, phone: authedPhone || undefined });
      } catch {}
    }
    setProfile(tempProfile);
    // Apply theme and language immediately
    const root = document.documentElement;
    root.classList.remove('dark');
    if (tempProfile.theme === 'dark') root.classList.add('dark');
    root.setAttribute('lang', tempProfile.language || 'ru');
    setIsEditing(false);
  };

  useEffect(() => {
    (async () => {
      const sub = await getExistingSubscription();
      setPushEnabled(Boolean(sub));
    })();
  }, []);

  const handleTogglePush = async () => {
    if (!pushEnabled) {
      // fetch VAPID public key
      const { data } = await api.get<{ success: boolean; data: { publicKey: string } }>('/api/push?vapid=1');
      const pub = data?.data?.publicKey || '';
      const permission = await requestPermission();
      if (permission !== 'granted') return;
      const sub = await subscribePush(pub);
      if (sub) {
        await savePushSubscription(toDTO(sub));
        setPushEnabled(true);
      }
    } else {
      const sub = await getExistingSubscription();
      const endpoint = (sub && (sub as any).endpoint) || '';
      await unsubscribePush();
      if (endpoint) await removePushSubscription(endpoint);
      setPushEnabled(false);
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="app-container animate-fade-in">
      <div className="screen-container">
        <div className="mb-6">
          <h1 className="text-2xl font-thin text-foreground mb-2">Профиль</h1>
          <p className="text-sm text-muted-foreground font-light">
            Настройки аккаунта и приложения
          </p>
        </div>

        {/* Профиль пользователя */}
        <Card className="mb-6 bg-background border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-accent text-white text-lg font-light">
                  {profile.name ? getInitials(profile.name) : <User className="w-8 h-8" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="font-light text-foreground">
                  {user?.name || profile.name || 'Пользователь'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {user?.email || profile.email || 'Настройте свой профиль'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-accent"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isAuthenticated && !isEditing && (
            <CardContent className="pt-0 pb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/auth')}
                  className="border-accent text-accent"
                >
                  <LogIn className="w-4 h-4 mr-2" /> Войти / Регистрация
                </Button>
              </div>
            </CardContent>
          )}

          {isAuthenticated && !isEditing && (
            <CardContent className="pt-0 pb-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => logout()}
                >
                  Выйти
                </Button>
              </div>
            </CardContent>
          )}

          {isEditing && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-light text-foreground">
                  Имя
                </Label>
                <Input
                  id="name"
                  value={isAuthenticated ? authedName : tempProfile.name}
                  onChange={(e) => {
                    if (isAuthenticated) setAuthedName(e.target.value);
                    else setTempProfile({ ...tempProfile, name: e.target.value });
                  }}
                  placeholder="Введите ваше имя"
                  className="border-border focus:ring-accent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-light text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={isAuthenticated ? (user?.email ?? '') : tempProfile.email}
                  onChange={(e) => !isAuthenticated && setTempProfile({ ...tempProfile, email: e.target.value })}
                  placeholder="Введите ваш email"
                  className="border-border focus:ring-accent"
                  disabled={isAuthenticated}
                />
              </div>

              {isAuthenticated && (
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-light text-foreground">
                    Телефон
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={authedPhone}
                    onChange={(e) => setAuthedPhone(e.target.value)}
                    placeholder="Введите ваш телефон"
                    className="border-border focus:ring-accent"
                  />
                </div>
              )}

              {!isAuthenticated && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-accent hover:bg-accent/90 text-white"
                  >
                    Сохранить
                  </Button>
                </div>
              )}
              {isAuthenticated && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-accent hover:bg-accent/90 text-white"
                  >
                    Сохранить
                  </Button>
                </div>
              )}
            </CardContent>
          )}
        </Card>

        {/* Настройки приложения */}
        <Card className="mb-6 bg-background border-border">
          <CardHeader>
            <CardTitle className="font-light text-foreground">Настройки</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-light text-foreground">Push‑уведомления</Label>
              <div className="flex items-center gap-3">
                <Button variant={pushEnabled ? 'default' : 'outline'} className={pushEnabled ? 'bg-accent text-white' : ''} onClick={handleTogglePush}>
                  {pushEnabled ? 'Отключить' : 'Включить'}
                </Button>
                {pushEnabled && (
                  <Button variant="outline" onClick={() => sendTestPush({ title: 'Тест', body: 'Проверка уведомлений', url: '/' })}>
                    Отправить тест
                  </Button>
                )}
                <span className="text-xs text-muted-foreground">Работают в фоне (при поддержке браузера)</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-light text-foreground">
                Тема оформления
              </Label>
              <Select 
                value={tempProfile.theme} 
                onValueChange={(value: 'light' | 'dark' | 'auto') => 
                  setTempProfile({ ...tempProfile, theme: value })
                }
              >
                <SelectTrigger className="border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Светлая
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Темная
                    </div>
                  </SelectItem>
                  <SelectItem value="auto">Автоматически</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-light text-foreground">
                Язык интерфейса
              </Label>
              <Select 
                value={tempProfile.language} 
                onValueChange={(value: string) => 
                  setTempProfile({ ...tempProfile, language: value })
                }
              >
                <SelectTrigger className="border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {tempProfile !== profile && (
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-accent hover:bg-accent/90 text-white"
                >
                  Применить
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Информация о приложении */}
        <Card className="bg-background border-border">
          <CardHeader>
            <CardTitle className="font-light text-foreground">О приложении</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>FlowDaily — это больше, чем просто планировщик. Это твое личное пространство, где каждый день становится осознанным выбором в пользу себя.</p>
              <p>Версия 1.0.0</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}