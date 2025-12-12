import { Outlet } from 'react-router-dom';
import { MobileNav, DesktopSidebar } from '@/components/Navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut } from 'lucide-react';

export function AppLayout() {
  const { user, logout } = useAuthStore();
  const isMobileRole = user?.role === 'student' || user?.role === 'teacher';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar for Admin/Manager */}
      {!isMobileRole && <DesktopSidebar />}
      
      {/* Mobile Header for Student/Teacher */}
      {isMobileRole && (
        <header className="sticky top-0 z-40 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-lg font-bold text-gradient-hero">
            EduCoins
          </h1>
          <button
            onClick={() => logout()}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Выйти"
          >
            <LogOut size={20} />
          </button>
        </header>
      )}
      
      {/* Main Content */}
      <main 
        className={
          isMobileRole 
            ? 'pb-20 px-4 py-4' 
            : 'md:ml-64 p-6'
        }
      >
        <Outlet />
      </main>
      
      {/* Mobile Navigation */}
      {isMobileRole && <MobileNav />}
    </div>
  );
}
