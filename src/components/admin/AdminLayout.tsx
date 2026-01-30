import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, FolderTree, Settings, LogOut, Store, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
  { label: 'Home Page', icon: Home, path: '/admin/home-page' },
  { label: 'Products', icon: Package, path: '/admin/products' },
  { label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
  { label: 'Categories', icon: FolderTree, path: '/admin/categories' },
  { label: 'Settings', icon: Settings, path: '/admin/settings' },
];

export default function AdminLayout() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <div className="w-64 bg-sidebar p-4">
          <Skeleton className="h-8 w-32 mb-8" />
          {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full mb-2" />)}
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You don't have admin privileges.</p>
          <Link to="/"><Button>Back to Store</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="text-lg font-serif font-bold text-sidebar-primary">Admin Panel</h1>
          <p className="text-xs text-sidebar-foreground/60">Asha's Craft Studio</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                    : 'hover:bg-sidebar-accent text-sidebar-foreground'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-lg">
            <Store className="h-5 w-5" />
            <span>View Store</span>
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sidebar-foreground hover:bg-sidebar-accent rounded-lg"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-background overflow-auto">
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
