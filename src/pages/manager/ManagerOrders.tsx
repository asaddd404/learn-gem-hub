import { useState, useEffect } from 'react';
import { Package, Loader2, Check, Truck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { ordersAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Order {
  id: number;
  student_name: string;
  item_name: string;
  item_price: number;
  status: 'waiting' | 'ready' | 'completed';
  created_at: string;
}

export default function ManagerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('waiting');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await ordersAPI.getAllOrders();
        setOrders(data);
      } catch (error) {
        toast.error('Не удалось загрузить заказы');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setProcessingId(orderId);
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
        )
      );
      toast.success('Статус обновлен');
    } catch (error) {
      toast.error('Ошибка обновления статуса');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'waiting') return o.status === 'waiting';
    if (activeTab === 'ready') return o.status === 'ready';
    return o.status === 'completed';
  });

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
          <Package className="text-primary" size={28} />
          Управление заказами
        </h1>
        <p className="text-muted-foreground mt-1">
          Обработка покупок учеников
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="waiting" className="gap-2">
            Новые
            <span className="bg-warning/20 text-warning px-2 py-0.5 rounded-full text-xs">
              {orders.filter(o => o.status === 'waiting').length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="ready" className="gap-2">
            Готовы
            <span className="bg-success/20 text-success px-2 py-0.5 rounded-full text-xs">
              {orders.filter(o => o.status === 'ready').length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="completed">Архив</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {filteredOrders.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Package className="mx-auto text-muted-foreground mb-4" size={48} />
                <p className="text-muted-foreground">Нет заказов</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{order.item_name}</h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Покупатель: {order.student_name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(order.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        {order.status === 'waiting' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'ready')}
                            disabled={processingId === order.id}
                            className="bg-success hover:bg-success/90"
                          >
                            {processingId === order.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <>
                                <Check size={16} className="mr-1" />
                                Подтвердить
                              </>
                            )}
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, 'completed')}
                            disabled={processingId === order.id}
                          >
                            {processingId === order.id ? (
                              <Loader2 className="animate-spin" size={16} />
                            ) : (
                              <>
                                <Truck size={16} className="mr-1" />
                                Выдать
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
