import { useState, useEffect } from 'react';
import { Users, Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { groupsAPI } from '@/lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Group {
  id: number;
  name: string;
  student_count?: number;
}

export default function TeacherGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await groupsAPI.getAll();
        setGroups(data);
      } catch (error) {
        toast.error('Не удалось загрузить группы');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

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
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Users className="text-primary" size={24} />
          Мои группы
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Выберите группу для начисления EduCoins
        </p>
      </div>

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <Users className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">У вас пока нет групп</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => (
            <Link key={group.id} to={`/teacher/groups/${group.id}`}>
              <Card className="border-0 shadow-md card-interactive">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Users className="text-primary" size={24} />
                      </div>
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        {group.student_count !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            {group.student_count} учеников
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground" size={20} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
