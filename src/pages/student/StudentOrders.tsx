import { useState, useEffect } from 'react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { ordersAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Order {
  id: number;
  item_name: string;
  item_price: number;
  status: 'waiting' | 'ready' | 'completed';
  created_at: string;
}

export default function StudentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersAPI.getMyOrders();
        setOrders(data);
      } catch (error) {
        toast.error('Не удалось загрузить заказы');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
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
          <ShoppingCart className="text-primary" size={24} />
          Мои покупки
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          История ваших заказов
        </p>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <ShoppingCart className="mx-auto text-muted-foreground mb-4" size={48} />
            <p className="text-muted-foreground">У вас пока нет покупок</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Card key={order.id} className="border-0 shadow-md card-interactive">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium truncate">{order.item_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
