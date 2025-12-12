import { useState, useEffect } from 'react';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoinDisplay } from '@/components/CoinDisplay';
import { shopAPI, authAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export default function StudentShop() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const { user, updateUser } = useAuthStore();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const data = await shopAPI.getItems();
        setItems(data);
      } catch (error) {
        toast.error('Не удалось загрузить товары');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const handleBuy = async (item: ShopItem) => {
    if ((user?.wallet || 0) < item.price) {
      toast.error('Недостаточно EduCoins');
      return;
    }

    setBuyingId(item.id);
    try {
      await shopAPI.buyItem(item.id);
      
      // Update user wallet
      const userData = await authAPI.getMe();
      updateUser(userData);
      
      // Update item quantity
      setItems(prev => 
        prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: Math.max(0, i.quantity - 1) }
            : i
        )
      );
      
      toast.success(`Вы купили "${item.name}"!`);
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Ошибка покупки';
      toast.error(message);
    } finally {
      setBuyingId(null);
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
            <ShoppingBag className="text-primary" size={24} />
            Магазин
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Потратьте свои EduCoins на награды
          </p>
        </div>
        <CoinDisplay amount={user?.wallet || 0} size="sm" />
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Магазин пуст</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="border-0 shadow-md overflow-hidden card-interactive"
            >
              {/* Image */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                {item.image_url ? (
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <ShoppingBag className="text-muted-foreground" size={48} />
                  </div>
                )}
                {item.quantity === 0 && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <span className="text-muted-foreground font-medium">
                      Нет в наличии
                    </span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-3 space-y-2">
                <h3 className="font-medium text-sm line-clamp-1">{item.name}</h3>
                
                <div className="flex items-center justify-between">
                  <CoinDisplay amount={item.price} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    Осталось: {item.quantity}
                  </span>
                </div>
                
                <Button
                  size="sm"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={item.quantity === 0 || buyingId === item.id}
                  onClick={() => handleBuy(item)}
                >
                  {buyingId === item.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    'Купить'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
