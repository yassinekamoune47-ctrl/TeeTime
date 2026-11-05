import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CourseImageCarousel({ images, alt }: { images: string[]; alt: string }) {
    const [index, setIndex] = useState(0);

    if (images.length === 0) {
        return null;
    }

    if (images.length === 1) {
        return <img src={images[0]} alt={alt} className="h-full w-full object-cover" />;
    }

    const goNext = () => setIndex((prev) => (prev + 1) % images.length);
    const goPrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="relative h-full w-full">
            {(images.length > 0) && (
                <img
                    src={images[index]}
                    alt={alt}
                    className="h-full w-full object-cover transition-opacity duration-300"
                />
            )}
        {/* Left button */}
        <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
        >
            <ChevronLeft size={20} />
        </button>

    {/* Right button */}
    <button
        type="button"
        onClick={goNext}
        aria-label="Next image"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm hover:bg-black/70"
    >
        <ChevronRight size={20} />
    </button>

        {/* Dots indicator */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((_, i) => (
                    <span
                        key={i}
                        className={`h-2 w-2 rounded-full transition-all ${
                            i === index ? 'w-4 bg-white' : 'bg-white/50'
                        }`}
                />
            ))}
        </div>
        </div>
    );
}