import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authAPI, usersAPI, groupsAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Teacher {
  id: number;
  full_name: string;
}

interface Group {
  id: number;
  name: string;
}

interface RegisterForm {
  full_name: string;
  username: string;
  password: string;
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>();

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await usersAPI.getTeachers();
        setTeachers(data);
      } catch (error) {
        toast.error('Не удалось загрузить список учителей');
      } finally {
        setLoadingTeachers(false);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch groups when teacher is selected
  useEffect(() => {
    if (!selectedTeacher) {
      setGroups([]);
      setSelectedGroup('');
      return;
    }

    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const data = await groupsAPI.getAll(parseInt(selectedTeacher));
        setGroups(data);
      } catch (error) {
        toast.error('Не удалось загрузить список групп');
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, [selectedTeacher]);

  const onSubmit = async (data: RegisterForm) => {
    if (!selectedTeacher || !selectedGroup) {
      toast.error('Выберите учителя и группу');
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.register({
        ...data,
        teacher_id: parseInt(selectedTeacher),
        group_id: parseInt(selectedGroup),
      });
      
      toast.success('Аккаунт создан! Теперь войдите в систему.');
      navigate('/login');
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Ошибка регистрации';
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
            Регистрация ученика
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-display">Регистрация</CardTitle>
            <CardDescription>
              Создайте аккаунт для доступа к платформе
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">ФИО</Label>
                <Input
                  id="full_name"
                  placeholder="Иванов Иван Иванович"
                  {...register('full_name', { required: 'ФИО обязательно' })}
                  className={errors.full_name ? 'border-destructive' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Придумайте логин</Label>
                <Input
                  id="username"
                  placeholder="ivan_ivanov"
                  {...register('username', { 
                    required: 'Логин обязателен',
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Только латинские буквы, цифры и _'
                    }
                  })}
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
                    placeholder="Минимум 6 символов"
                    {...register('password', { 
                      required: 'Пароль обязателен',
                      minLength: {
                        value: 6,
                        message: 'Минимум 6 символов'
                      }
                    })}
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

              <div className="space-y-2">
                <Label>Выберите учителя</Label>
                <Select
                  value={selectedTeacher}
                  onValueChange={(value) => {
                    setSelectedTeacher(value);
                    setSelectedGroup('');
                  }}
                  disabled={loadingTeachers}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingTeachers ? 'Загрузка...' : 'Выберите учителя'} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Выберите группу</Label>
                <Select
                  value={selectedGroup}
                  onValueChange={setSelectedGroup}
                  disabled={!selectedTeacher || loadingGroups}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        !selectedTeacher 
                          ? 'Сначала выберите учителя' 
                          : loadingGroups 
                            ? 'Загрузка...' 
                            : 'Выберите группу'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                disabled={isLoading || !selectedTeacher || !selectedGroup}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <UserPlus className="mr-2" size={18} />
                )}
                Создать аккаунт
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Уже есть аккаунт? </span>
              <Link 
                to="/login" 
                className="text-primary hover:underline font-medium"
              >
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
