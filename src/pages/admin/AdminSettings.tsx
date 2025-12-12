import { useState, useEffect } from 'react';
import { Settings, Loader2, Save, Coins } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { transactionsAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [dailyLimit, setDailyLimit] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await transactionsAPI.getConfig();
        setDailyLimit(config.daily_limit?.toString() || '100');
      } catch (error) {
        // Use default if no config
        setDailyLimit('100');
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async () => {
    const limit = parseInt(dailyLimit);
    if (isNaN(limit) || limit <= 0) {
      toast.error('Введите корректное значение');
      return;
    }

    setSaving(true);
    try {
      await transactionsAPI.updateLimit(limit);
      toast.success('Настройки сохранены');
    } catch (error) {
      toast.error('Ошибка сохранения');
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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2">
          <Settings className="text-primary" size={28} />
          Настройки системы
        </h1>
        <p className="text-muted-foreground mt-1">
          Глобальные параметры EduCoins
        </p>
      </div>

      {/* Settings Card */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="text-accent" size={20} />
            Лимиты начислений
          </CardTitle>
          <CardDescription>
            Ограничения на начисление EduCoins учителями
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dailyLimit">
              Дневной лимит на ученика (EduCoins)
            </Label>
            <div className="flex gap-3">
              <Input
                id="dailyLimit"
                type="number"
                placeholder="100"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(e.target.value)}
                min="1"
                className="max-w-[200px]"
              />
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-primary hover:opacity-90"
              >
                {saving ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Save className="mr-2" size={18} />
                )}
                Сохранить
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Максимальное количество EduCoins, которое учитель может начислить одному ученику за день.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
