import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, Film, Grid, List } from 'lucide-react';
import { UserButton } from '../auth/user-button';
import { useUIStore } from '../../lib/stores/ui-store';
import { useMovieStore } from '../../lib/stores/movie-store';

/**
 * Header component with navigation, search, and user menu
 * Responsive design with mobile navigation support
 */
export function Header() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const {
    viewMode,
    searchQuery: _searchQuery,
    setSearchQuery,
    setViewMode,
  } = useUIStore();
  const { searchMovies, clearSearch } = useMovieStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      await searchMovies(searchInput.trim());
      navigate('/');
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    clearSearch();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b !bg-[#613599] backdrop-blur supports-[backdrop-filter]:bg-[#613599]">
      <div className="container bg-[#613599] mx-auto px-4 max-w-7xl">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
              onClick={closeMobileMenu}
            >
              <Film className="h-6 w-6" />
              <span className="hidden text-white sm:inline">MovieApp</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium !text-white hover:text-foreground transition-colors"
            >
              Movies
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-md">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Authentication */}
            <UserButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="px-4 py-4 space-y-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-muted border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <Link
                  to="/"
                  className="block px-3 py-2 text-sm font-medium text-white hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={closeMobileMenu}
                >
                  Movies
                </Link>
              </nav>

              {/* Mobile View Mode Toggle */}
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-muted-foreground">
                  View Mode
                </span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                    title="Grid view"
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'} transition-colors`}
                    title="List view"
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Mobile Authentication */}
              <div className="px-3 py-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Account
                  </span>
                  <UserButton />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
