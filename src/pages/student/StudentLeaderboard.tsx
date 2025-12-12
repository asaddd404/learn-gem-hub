import { useState, useEffect } from 'react';
import { Trophy, Loader2, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RatingDisplay } from '@/components/RatingDisplay';
import { usersAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: number;
  full_name: string;
  rating: number;
  rank: number;
}

export default function StudentLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await usersAPI.getLeaderboard();
        setLeaderboard(data.slice(0, 10));
      } catch (error) {
        toast.error('Не удалось загрузить рейтинг');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
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
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Trophy className="text-accent" size={24} />
          Топ-10 учеников
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Лидеры по рейтингу
        </p>
      </div>

      {/* Leaderboard */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {leaderboard.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Рейтинг пуст</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {leaderboard.map((entry, index) => {
                const isMe = entry.id === user?.id;
                const rank = index + 1;
                
                return (
                  <div 
                    key={entry.id}
                    className={cn(
                      'flex items-center gap-4 p-4 transition-colors',
                      isMe && 'bg-primary/5'
                    )}
                  >
                    {/* Rank */}
                    <div className="w-10 flex justify-center">
                      {rank <= 3 ? (
                        <Medal 
                          size={24} 
                          className={getMedalColor(rank)}
                          fill="currentColor"
                        />
                      ) : (
                        <span className="text-lg font-display font-bold text-muted-foreground">
                          {rank}
                        </span>
                      )}
                    </div>
                    
                    {/* Avatar & Name */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div 
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                            isMe 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {entry.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className={cn(
                            'font-medium truncate',
                            isMe && 'text-primary'
                          )}>
                            {entry.full_name}
                            {isMe && ' (Вы)'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Rating */}
                    <RatingDisplay rating={entry.rating} size="sm" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
