import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Coins, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CoinDisplay } from '@/components/CoinDisplay';
import { groupsAPI, transactionsAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Student {
  id: number;
  full_name: string;
  wallet: number;
}

export default function TeacherGroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [awarding, setAwarding] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await groupsAPI.getStudents(parseInt(groupId!));
        setStudents(data);
      } catch (error) {
        toast.error('Не удалось загрузить учеников');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [groupId]);

  const handleAward = async () => {
    if (!selectedStudent || !amount) return;

    const amountNum = parseInt(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Введите корректную сумму');
      return;
    }

    setAwarding(true);
    try {
      await transactionsAPI.awardCoins({
        student_id: selectedStudent.id,
        amount: amountNum,
        comment: comment || 'Награда от учителя',
      });

      // Update student wallet in list
      setStudents(prev =>
        prev.map(s =>
          s.id === selectedStudent.id
            ? { ...s, wallet: s.wallet + amountNum }
            : s
        )
      );

      toast.success(`${amountNum} EduCoins начислено ${selectedStudent.full_name}`);
      setSelectedStudent(null);
      setAmount('');
      setComment('');
    } catch (error: any) {
      // Show backend error message (important for limit errors)
      const message = error.response?.data?.detail || 'Ошибка начисления';
      toast.error(message);
    } finally {
      setAwarding(false);
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
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/teacher/groups')}
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-display font-bold">Ученики группы</h1>
          <p className="text-muted-foreground text-sm">
            Нажмите на монетку для начисления
          </p>
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <User className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">В группе нет учеников</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {students.map((student) => (
            <Card key={student.id} className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{student.full_name}</h3>
                      <CoinDisplay amount={student.wallet} size="sm" />
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-12 w-12 rounded-full bg-gradient-coin shadow-coin text-accent-foreground hover:opacity-90"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <Coins size={24} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Award Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Начислить EduCoins</DialogTitle>
            <DialogDescription>
              Ученик: {selectedStudent?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Введите сумму"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий</Label>
              <Textarea
                id="comment"
                placeholder="За что начисляете? (например: За домашку)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button
              className="w-full bg-gradient-coin text-accent-foreground hover:opacity-90"
              onClick={handleAward}
              disabled={awarding || !amount}
            >
              {awarding ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                <Coins className="mr-2" size={18} />
              )}
              Отправить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
