import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import type { Product } from '../types';

interface ProductHoverImageProps {
  product: Product;
  className?: string;
}

export default function ProductHoverImage({ product, className }: ProductHoverImageProps) {
  const { t } = useTranslation('shop');
  const [hoverSrc, setHoverSrc] = useState<string | null>(null);
  const [hovered, setHovered] = useState(false);
  const [tapped, setTapped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    const url = product.hoverImageUrl;
    if (!node || !url) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHoverSrc(url);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [product.hoverImageUrl]);

  const showHoverImage = () => {
    setHovered(true);
    if (!hoverSrc && product.hoverImageUrl) {
      setHoverSrc(product.hoverImageUrl);
    }
  };

  const hasAlternateView = Boolean(product.hoverImageUrl);
  const revealed = hovered || tapped;

  // Touch screens have no hover: the first tap shows the back view and swallows
  // the click that would otherwise follow the surrounding product link.
  const handleTap = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!hasAlternateView) return;
    event.preventDefault();
    event.stopPropagation();
    setTapped((value) => !value);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={showHoverImage}
      onMouseLeave={() => setHovered(false)}
      onFocus={showHoverImage}
      onBlur={() => {
        setHovered(false);
        setTapped(false);
      }}
      onTouchEnd={handleTap}
      className={cn('relative overflow-hidden bg-muted', className)}
    >
      <img
        src={product.imageUrl || '/section1.png'}
        alt={product.name}
        className={`h-full w-full object-cover transition-transform duration-500 ease-out ${revealed ? 'scale-105' : ''}`}
        loading="lazy"
      />
      {hoverSrc && (
        <img
          src={hoverSrc}
          alt={t('page.backViewAlt', { name: product.name })}
          aria-hidden={!revealed}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out ${
            revealed ? 'scale-105 opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {hasAlternateView && (
        <span className="pointer-events-none absolute bottom-2 right-2 hidden rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium tracking-wide text-white backdrop-blur-sm [@media(hover:none)]:block">
          {tapped ? t('page.tapForFront') : t('page.tapForBack')}
        </span>
      )}
    </div>
  );
}
