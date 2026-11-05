import { Link } from 'react-router-dom';
import type { FeatureSectionProps } from '../types/featureSectionProps.types';

export default function FeatureSection({ title, text, image, button, reverse }: FeatureSectionProps) {
  return (
    <section className={`py-10 ${reverse ? 'bg-secondary-hover md:pl-20' : 'md:pr-20'}`}>
      <div className={`mx-auto flex max-w-7xl flex-col items-stretch gap-8 px-6 md:flex-row md:items-center md:gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        {/* Text */}
        <div className="flex flex-1 flex-col gap-y-10 md:px-20">
          <h1 className="font-serif text-3xl font-bold text-primary-hover md:text-[40px]">{title}</h1>
          <p className={`mt-4 text-[16px] text-muted-foreground ${reverse ? ' text-white' : 'text-muted-foreground'} mb-5`}>{text}</p>
          <Link
            to="/login"
            className="relative block w-full text-base font-medium tracking-widest text-primary-hover transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:bg-primary-hover"
          >
            {button}
          </Link>
        </div>

        {/* Image */}
        <div className="flex-1 flex justify-center">
            <img src={image} alt={title} className="h-64 w-full max-w-md rounded-lg object-cover shadow-lg md:h-80" />
        </div>
      </div>
    </section>
  );
}