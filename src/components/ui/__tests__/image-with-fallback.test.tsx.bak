import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  ImageWithFallback, 
  MoviePoster, 
  MovieBackdrop, 
  ProfileImage, 
  ResponsiveImage,
  ImagePreloader 
} from '../image-with-fallback';

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation((callback) => ({
  observe: (element) => {
    // Immediately trigger intersection for testing
    setTimeout(() => {
      callback([{ isIntersecting: true }]);
    }, 0);
  },
  unobserve: () => null,
  disconnect: () => null,
}));
window.IntersectionObserver = mockIntersectionObserver;

describe('ImageWithFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIntersectionObserver.mockClear();
  });

  it('renders container with proper styling', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test image" />);
    
    const container = document.querySelector('.relative.overflow-hidden.bg-muted');
    expect(container).toBeInTheDocument();
  });

  it('renders loading state initially', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test image" />);
    
    // Should show loading placeholder
    const loadingIcon = document.querySelector('.animate-pulse');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test image" className="custom-class" />);
    
    const container = document.querySelector('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('applies width and height styles', () => {
    render(
      <ImageWithFallback 
        src="test.jpg" 
        alt="Test image" 
        width={200} 
        height={300} 
      />
    );
    
    const container = document.querySelector('.relative.overflow-hidden.bg-muted');
    expect(container).toHaveStyle({ width: '200px', height: '300px' });
  });

  it('applies string width and height', () => {
    render(
      <ImageWithFallback 
        src="test.jpg" 
        alt="Test image" 
        width="100%" 
        height="auto" 
      />
    );
    
    const container = document.querySelector('.relative.overflow-hidden.bg-muted');
    expect(container).toHaveStyle({ width: '100%', height: 'auto' });
  });

  it('handles null src', () => {
    render(<ImageWithFallback src={null} alt="Test image" />);
    
    // Should show loading placeholder when src is null
    const loadingIcon = document.querySelector('.animate-pulse');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('sets up intersection observer for lazy loading', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test image" loading="lazy" />);
    
    expect(mockIntersectionObserver).toHaveBeenCalled();
  });

  it('renders with eager loading', () => {
    render(<ImageWithFallback src="test.jpg" alt="Test image" loading="eager" />);
    
    // Should render container
    const container = document.querySelector('.relative.overflow-hidden.bg-muted');
    expect(container).toBeInTheDocument();
  });
});

describe('MoviePoster', () => {
  it('renders movie poster with TMDB URL', async () => {
    render(<MoviePoster posterPath="/test-poster.jpg" title="Test Movie" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Movie poster');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w342/test-poster.jpg');
    });
  });

  it('handles null poster path', () => {
    render(<MoviePoster posterPath={null} title="Test Movie" />);
    
    // Should render container without crashing
    const container = document.querySelector('.rounded-md.shadow-sm');
    expect(container).toBeInTheDocument();
  });

  it('uses custom size', async () => {
    render(<MoviePoster posterPath="/test.jpg" title="Test Movie" size="w500" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Movie poster');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w500/test.jpg');
    });
  });

  it('applies rounded styling', () => {
    render(<MoviePoster posterPath="/test.jpg" title="Test Movie" />);
    
    const container = document.querySelector('.rounded-md.shadow-sm');
    expect(container).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MoviePoster posterPath="/test.jpg" title="Test Movie" className="custom-poster" />);
    
    const container = document.querySelector('.custom-poster');
    expect(container).toBeInTheDocument();
  });
});

describe('MovieBackdrop', () => {
  it('renders movie backdrop with TMDB URL', async () => {
    render(<MovieBackdrop backdropPath="/test-backdrop.jpg" title="Test Movie" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Movie backdrop');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w1280/test-backdrop.jpg');
    });
  });

  it('handles null backdrop path', () => {
    render(<MovieBackdrop backdropPath={null} title="Test Movie" />);
    
    const container = document.querySelector('.rounded-lg');
    expect(container).toBeInTheDocument();
  });

  it('uses custom size', async () => {
    render(<MovieBackdrop backdropPath="/test.jpg" title="Test Movie" size="w780" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Test Movie backdrop');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w780/test.jpg');
    });
  });

  it('applies rounded styling', () => {
    render(<MovieBackdrop backdropPath="/test.jpg" title="Test Movie" />);
    
    const container = document.querySelector('.rounded-lg');
    expect(container).toBeInTheDocument();
  });
});

describe('ProfileImage', () => {
  it('renders profile image with TMDB URL', async () => {
    render(<ProfileImage profilePath="/test-profile.jpg" name="John Doe" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('John Doe profile');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w185/test-profile.jpg');
    });
  });

  it('handles null profile path', () => {
    render(<ProfileImage profilePath={null} name="John Doe" />);
    
    const container = document.querySelector('.rounded-full');
    expect(container).toBeInTheDocument();
  });

  it('uses custom size', async () => {
    render(<ProfileImage profilePath="/test.jpg" name="John Doe" size="w45" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('John Doe profile');
      expect(img).toHaveAttribute('src', 'https://image.tmdb.org/t/p/w45/test.jpg');
    });
  });

  it('applies rounded-full styling', () => {
    render(<ProfileImage profilePath="/test.jpg" name="John Doe" />);
    
    const container = document.querySelector('.rounded-full');
    expect(container).toBeInTheDocument();
  });
});

describe('ResponsiveImage', () => {
  it('renders responsive image', async () => {
    render(<ResponsiveImage src="test.jpg" alt="Responsive image" />);
    
    await waitFor(() => {
      const img = screen.getByAltText('Responsive image');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', 'test.jpg');
    });
  });

  it('handles null src', () => {
    render(<ResponsiveImage src={null} alt="Responsive image" />);
    
    const container = document.querySelector('.relative.overflow-hidden.bg-muted');
    expect(container).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ResponsiveImage src="test.jpg" alt="Responsive image" className="responsive-class" />);
    
    const container = document.querySelector('.responsive-class');
    expect(container).toBeInTheDocument();
  });
});

describe('ImagePreloader', () => {
  beforeEach(() => {
    // Mock Image constructor
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      
      constructor() {
        setTimeout(() => {
          this.onload?.();
        }, 10);
      }
    } as any;
  });

  it('calls onComplete when no URLs provided', () => {
    const onComplete = vi.fn();
    render(<ImagePreloader urls={[]} onComplete={onComplete} />);
    
    expect(onComplete).toHaveBeenCalled();
  });

  it('preloads images and calls onComplete', async () => {
    const onComplete = vi.fn();
    const urls = ['image1.jpg', 'image2.jpg'];
    
    render(<ImagePreloader urls={urls} onComplete={onComplete} />);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('handles image load errors gracefully', async () => {
    // Mock Image to simulate error
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = '';
      
      constructor() {
        setTimeout(() => {
          this.onerror?.();
        }, 10);
      }
    } as any;

    const onComplete = vi.fn();
    const urls = ['invalid1.jpg', 'invalid2.jpg'];
    
    render(<ImagePreloader urls={urls} onComplete={onComplete} />);
    
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it('does not render any visible content', () => {
    const { container } = render(<ImagePreloader urls={['test.jpg']} />);
    
    expect(container.firstChild).toBeNull();
  });
});