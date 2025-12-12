import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  ShoppingCart, 
  Trophy,
  Users,
  Package,
  Settings,
  LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, UserRole } from '@/store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: Record<UserRole, NavItem[]> = {
  student: [
    { to: '/student/dashboard', label: 'Главная', icon: <Home size={20} /> },
    { to: '/student/shop', label: 'Магазин', icon: <ShoppingBag size={20} /> },
    { to: '/student/orders', label: 'Покупки', icon: <ShoppingCart size={20} /> },
    { to: '/student/leaderboard', label: 'Топ', icon: <Trophy size={20} /> },
  ],
  teacher: [
    { to: '/teacher/groups', label: 'Группы', icon: <Users size={20} /> },
  ],
  manager: [
    { to: '/manager/orders', label: 'Заказы', icon: <Package size={20} /> },
    { to: '/manager/inventory', label: 'Склад', icon: <LayoutGrid size={20} /> },
  ],
  admin: [
    { to: '/admin/users', label: 'Пользователи', icon: <Users size={20} /> },
    { to: '/admin/groups', label: 'Группы', icon: <LayoutGrid size={20} /> },
    { to: '/admin/settings', label: 'Настройки', icon: <Settings size={20} /> },
  ],
};

export function MobileNav() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[64px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

export function DesktopSidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card border-r border-border">
      <div className="p-6 border-b border-border">
        <h1 className="font-display text-xl font-bold text-gradient-hero">
          EduCoins
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{user.full_name}</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border">
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors font-medium"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
