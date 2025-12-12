import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/lib/api';
import { useAuthStore, UserRole } from '@/store/authStore';
import { toast } from 'sonner';

interface LoginForm {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const roleRedirects: Record<UserRole, string> = {
    student: '/student/dashboard',
    teacher: '/teacher/groups',
    manager: '/manager/orders',
    admin: '/admin/users',
  };

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data.username, data.password);
      const { access_token, user } = response;
      
      setAuth(access_token, user);
      toast.success(`Добро пожаловать, ${user.full_name}!`);
      navigate(roleRedirects[user.role as UserRole] || '/');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Ошибка авторизации';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-4xl font-bold text-gradient-hero">
            EduCoins
          </h1>
          <p className="text-muted-foreground">
            Образовательная платформа с геймификацией
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-display">Вход</CardTitle>
            <CardDescription>
              Введите ваши данные для входа в систему
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  placeholder="Введите логин"
                  {...register('username', { required: 'Логин обязателен' })}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    {...register('password', { required: 'Пароль обязателен' })}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <LogIn className="mr-2" size={18} />
                )}
                Войти
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Нет аккаунта? </span>
              <Link 
                to="/register" 
                className="text-primary hover:underline font-medium"
              >
                Зарегистрироваться
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
