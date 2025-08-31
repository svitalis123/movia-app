import { Header } from './header';
import { useTheme } from '../../lib/stores/ui-store';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Main application layout component
 * Provides the overall structure with header and main content area
 * Applies theme classes and responsive design
 */
export function AppLayout({ children, className }: AppLayoutProps) {
  const theme = useTheme();

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme === 'dark' ? 'dark' : ''} ${className || ''}`}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;