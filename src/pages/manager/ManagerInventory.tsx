import { useState, useEffect } from 'react';
import { LayoutGrid, Loader2, Plus, Edit, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CoinDisplay } from '@/components/CoinDisplay';
import { shopAPI } from '@/lib/api';
import { toast } from 'sonner';

interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  image_url?: string;
}

export default function ManagerInventory() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

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

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setQuantity('');
    setEditingItem(null);
  };

  const openEditDialog = (item: ShopItem) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setQuantity(item.quantity.toString());
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name || !price || !quantity) {
      toast.error('Заполните все обязательные поля');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name,
        description,
        price: parseInt(price),
        quantity: parseInt(quantity),
      };

      if (editingItem) {
        await shopAPI.updateItem(editingItem.id, data);
        setItems(prev =>
          prev.map(i => (i.id === editingItem.id ? { ...i, ...data } : i))
        );
        toast.success('Товар обновлен');
      } else {
        const newItem = await shopAPI.createItem(data);
        setItems(prev => [...prev, newItem]);
        toast.success('Товар добавлен');
      }

      setDialogOpen(false);
      resetForm();
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <LayoutGrid className="text-primary" size={28} />
            Склад
          </h1>
          <p className="text-muted-foreground mt-1">
            Управление товарами магазина
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus size={18} className="mr-2" />
              Добавить товар
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingItem ? 'Редактировать товар' : 'Новый товар'}
              </DialogTitle>
              <DialogDescription>
                Заполните информацию о товаре
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  placeholder="Название товара"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Описание товара"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Цена (EduCoins) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="100"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Количество *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="10"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              
              <Button
                className="w-full bg-gradient-primary hover:opacity-90"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="animate-spin mr-2" size={18} />
                ) : (
                  <Package className="mr-2" size={18} />
                )}
                {editingItem ? 'Сохранить изменения' : 'Добавить товар'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Table */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="text-muted-foreground">Товары не добавлены</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Остаток</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <CoinDisplay amount={item.price} size="sm" />
                    </TableCell>
                    <TableCell>
                      <span className={item.quantity === 0 ? 'text-destructive' : ''}>
                        {item.quantity} шт.
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(item)}
                      >
                        <Edit size={16} />
                      </Button>
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
