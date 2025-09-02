import { useState, useRef, useEffect } from 'react';
import { Image, ImageOff } from 'lucide-react';
import type { ImageWithFallbackProps } from '../../lib/types';

/**
 * Image component with fallback support and lazy loading
 * Handles missing images gracefully with placeholder or fallback image
 */
export function ImageWithFallback({
  src,
  alt,
  fallbackSrc,
  width,
  height,
  className,
  loading = 'lazy',
  onLoad,
  onError
}: ImageWithFallbackProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string | null>(src);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isInView, setIsInView] = useState(false);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(imgRef.current);

      return () => observer.disconnect();
    } else {
      setIsInView(true);
    }
  }, [loading]);

  // Reset state when src changes
  useEffect(() => {
    setImageState('loading');
    setCurrentSrc(src);
  }, [src]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    if (currentSrc === src && fallbackSrc) {
      // Try fallback image
      setCurrentSrc(fallbackSrc);
      setImageState('loading');
    } else {
      // No fallback or fallback also failed
      setImageState('error');
      onError?.();
    }
  };

  const shouldShowImage = isInView && currentSrc;
  const containerStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden bg-muted ${className || ''}`}
      style={containerStyle}
    >
      {shouldShowImage ? (
        <>
          <img
            src={currentSrc}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full object-cover transition-opacity duration-300
              ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'}
            `}
            loading={loading}
          />
          
          {/* Loading placeholder */}
          {imageState === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="animate-pulse">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
          )}
        </>
      ) : (
        // Lazy loading placeholder
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="animate-pulse">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}

/**
 * Movie poster component with TMDB-specific image handling
 */
export function MoviePoster({
  posterPath,
  title,
  size = 'w342',
  className,
  ...props
}: {
  posterPath: string | null;
  title: string;
  size?: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original';
  className?: string;
} & Omit<ImageWithFallbackProps, 'src' | 'alt'>) {
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const src = getImageUrl(posterPath);
  const fallbackSrc = '/placeholder-movie-poster.jpg'; // You can add a default poster image

  return (
    <ImageWithFallback
      src={src}
      alt={`${title} poster`}
      fallbackSrc={fallbackSrc}
      className={`rounded-md shadow-sm ${className || ''}`}
      {...props}
    />
  );
}

/**
 * Movie backdrop component for hero sections
 */
export function MovieBackdrop({
  backdropPath,
  title,
  size = 'w1280',
  className,
  ...props
}: {
  backdropPath: string | null;
  title: string;
  size?: 'w300' | 'w780' | 'w1280' | 'original';
  className?: string;
} & Omit<ImageWithFallbackProps, 'src' | 'alt'>) {
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const src = getImageUrl(backdropPath);

  return (
    <ImageWithFallback
      src={src}
      alt={`${title} backdrop`}
      className={`rounded-lg ${className || ''}`}
      {...props}
    />
  );
}

/**
 * Profile image component for cast and crew
 */
export function ProfileImage({
  profilePath,
  name,
  size = 'w185',
  className,
  ...props
}: {
  profilePath: string | null;
  name: string;
  size?: 'w45' | 'w185' | 'h632' | 'original';
  className?: string;
} & Omit<ImageWithFallbackProps, 'src' | 'alt'>) {
  const getImageUrl = (path: string | null) => {
    if (!path) return null;
    return `https://image.tmdb.org/t/p/${size}${path}`;
  };

  const src = getImageUrl(profilePath);

  return (
    <ImageWithFallback
      src={src}
      alt={`${name} profile`}
      className={`rounded-full ${className || ''}`}
      {...props}
    />
  );
}

/**
 * Optimized image component with responsive sizes
 */
export function ResponsiveImage({
  src,
  alt,
  sizes: _sizes,
  className,
  ...props
}: {
  src: string | null;
  alt: string;
  sizes?: string;
  className?: string;
} & Omit<ImageWithFallbackProps, 'src' | 'alt'>) {
  return (
    <ImageWithFallback
      src={src}
      alt={alt}
      className={className}
      {...props}
    />
  );
}

/**
 * Image preloader utility component
 */
export function ImagePreloader({ 
  urls, 
  onComplete 
}: { 
  urls: string[]; 
  onComplete?: () => void; 
}) {
  useEffect(() => {
    if (urls.length === 0) {
      onComplete?.();
      return;
    }

    let completed = 0;

    urls.forEach((url) => {
      const img = new window.Image();
      img.onload = img.onerror = () => {
        completed++;
        if (completed === urls.length) {
          onComplete?.();
        }
      };
      img.src = url;
    });
  }, [urls, onComplete]);

  return null; // This component doesn't render anything
}

export default ImageWithFallback;