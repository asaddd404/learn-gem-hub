import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CoinDisplay } from '@/components/CoinDisplay';
import { RatingDisplay } from '@/components/RatingDisplay';
import { useAuthStore } from '@/store/authStore';
import { transactionsAPI, authAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Transaction {
  id: number;
  amount: number;
  comment: string;
  created_at: string;
  teacher_name?: string;
  type: 'income' | 'expense';
}

export default function StudentDashboard() {
  const { user, updateUser } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, txData] = await Promise.all([
          authAPI.getMe(),
          transactionsAPI.getMyTransactions(),
        ]);
        updateUser(userData);
        setTransactions(txData.slice(0, 5));
      } catch (error) {
        toast.error('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [updateUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="space-y-1">
        <h1 className="text-2xl font-display font-bold">
          Привет, {user?.full_name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Вот ваш баланс и последние операции
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="card-interactive border-0 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-coin opacity-5" />
          <CardContent className="pt-6 pb-5 relative">
            <CoinDisplay 
              amount={user?.wallet || 0} 
              size="lg" 
              showLabel 
            />
          </CardContent>
        </Card>

        <Card className="card-interactive border-0 shadow-md overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-rating-purple/5 to-transparent" />
          <CardContent className="pt-6 pb-5 relative">
            <RatingDisplay 
              rating={user?.rating || 0} 
              size="lg" 
              showLabel 
            />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display">Последние операции</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              Пока нет операций
            </p>
          ) : (
            transactions.map((tx) => (
              <div 
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`p-2 rounded-full ${
                      tx.type === 'income' 
                        ? 'bg-success/15 text-success' 
                        : 'bg-destructive/15 text-destructive'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft size={16} />
                    ) : (
                      <ArrowUpRight size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.comment || 'Транзакция'}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.teacher_name || new Date(tx.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <span 
                  className={`font-display font-bold ${
                    tx.type === 'income' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}{tx.amount}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
