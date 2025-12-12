import { useState, useEffect } from 'react';
import { LayoutGrid, Loader2, Plus, Users } from 'lucide-react';
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
import { groupsAPI, usersAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Group {
  id: number;
  name: string;
  teacher_name?: string;
  student_count?: number;
}

interface Teacher {
  id: number;
  full_name: string;
}

export default function AdminGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsData, teachersData] = await Promise.all([
          groupsAPI.getAll(),
          usersAPI.getTeachers(),
        ]);
        setGroups(groupsData);
        setTeachers(teachersData);
      } catch (error) {
        toast.error('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const resetForm = () => {
    setName('');
    setSelectedTeacher('');
  };

  const handleCreate = async () => {
    if (!name || !selectedTeacher) {
      toast.error('Заполните все поля');
      return;
    }

    setSaving(true);
    try {
      const newGroup = await groupsAPI.create({
        name,
        teacher_id: parseInt(selectedTeacher),
      });
      
      const teacher = teachers.find(t => t.id === parseInt(selectedTeacher));
      setGroups(prev => [...prev, { 
        ...newGroup, 
        teacher_name: teacher?.full_name,
        student_count: 0
      }]);
      
      toast.success('Группа создана');
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <LayoutGrid className="text-primary" size={28} />
            Группы
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление расписанием групп
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus size={18} className="mr-2" />
              Создать группу
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                Новая группа
              </DialogTitle>
              <DialogDescription>
                Создайте группу и назначьте учителя
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Название группы</Label>
                <Input
                  id="groupName"
                  placeholder="Например: English 10:00 ПН/СР"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Учитель</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите учителя" />
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
              
              <Button
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={handleCreate}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <LayoutGrid className="mr-2" size={18} />
                )}
                Создать группу
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Groups Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {groups.length === 0 ? (
            <div className="py-12 text-center">
              <LayoutGrid className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">Группы не созданы</p>
              <p className="text-sm text-muted-foreground mt-1">
                Создайте группы, чтобы ученики могли регистрироваться
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Учитель</TableHead>
                  <TableHead>Учеников</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell className="font-medium">{group.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.teacher_name || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users size={14} />
                        {group.student_count ?? 0}
                      </div>
                    </TableCell>
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
