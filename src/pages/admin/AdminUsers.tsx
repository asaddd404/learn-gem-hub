import { useState, useEffect } from 'react';
import { Users, Loader2, Plus, Filter } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { usersAPI } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  full_name: string;
  role: string;
  wallet: number;
  rating: number;
}

const roleLabels: Record<string, string> = {
  student: 'Ученик',
  teacher: 'Учитель',
  manager: 'Менеджер',
  admin: 'Админ',
};

const roleColors: Record<string, string> = {
  student: 'bg-role-student/15 text-role-student',
  teacher: 'bg-role-teacher/15 text-role-teacher',
  manager: 'bg-role-manager/15 text-role-manager',
  admin: 'bg-role-admin/15 text-role-admin',
};

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const params = filter !== 'all' ? { role: filter } : undefined;
        const data = await usersAPI.getAll(params);
        setUsers(data);
      } catch (error) {
        toast.error('Не удалось загрузить пользователей');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [filter]);

  const resetForm = () => {
    setFullName('');
    setUsername('');
    setPassword('');
    setRole('teacher');
  };

  const handleCreate = async () => {
    if (!fullName || !username || !password) {
      toast.error('Заполните все поля');
      return;
    }

    setSaving(true);
    try {
      const newUser = await usersAPI.create({
        full_name: fullName,
        username,
        password,
        role,
      });
      setUsers(prev => [...prev, newUser]);
      toast.success('Пользователь создан');
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Ошибка создания';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Users className="text-primary" size={28} />
            Пользователи
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление аккаунтами
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <Filter size={16} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Все роли</SelectItem>
              <SelectItem value="student">Ученики</SelectItem>
              <SelectItem value="teacher">Учителя</SelectItem>
              <SelectItem value="manager">Менеджеры</SelectItem>
              <SelectItem value="admin">Админы</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus size={18} className="mr-2" />
                Создать пользователя
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-display">
                  Новый пользователь
                </DialogTitle>
                <DialogDescription>
                  Создание учителя или менеджера
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">ФИО</Label>
                  <Input
                    id="fullName"
                    placeholder="Иванов Иван Иванович"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username">Логин</Label>
                  <Input
                    id="username"
                    placeholder="ivan_ivanov"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Минимум 6 символов"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Роль</Label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="teacher">Учитель</SelectItem>
                      <SelectItem value="manager">Менеджер</SelectItem>
                      <SelectItem value="admin">Админ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  className="w-full bg-gradient-primary hover:opacity-90"
                  onClick={handleCreate}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <Users className="mr-2" size={18} />
                  )}
                  Создать
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">Пользователи не найдены</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ФИО</TableHead>
                  <TableHead>Логин</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Баланс</TableHead>
                  <TableHead>Рейтинг</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.username}</TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.wallet}</TableCell>
                    <TableCell>{user.rating}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
