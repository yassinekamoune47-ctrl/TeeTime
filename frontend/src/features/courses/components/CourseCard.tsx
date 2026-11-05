import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import type {Course} from "@/features/courses/types.ts";

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}



export default function CourseCard({ course, onClick }: CourseCardProps) {
  const { t } = useTranslation('clubs');

  return (
    <Card 
        className="overflow-hidden p-0 rounded-sm md:h-full"
        onClick={onClick}
        >
      <div className="flex flex-col h-full">
        {/* Image */}
        <div className="w-full">
            {/* If no image is available, display a placeholder */}
            {(!course.imagesUrls || course.imagesUrls.length === 0)
                ? <div className="bg-muted h-52 w-full" />
                : <img
                    src={course.imagesUrls[0]}
                    alt={course.name}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-cover md:h-52"
                />}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col gap-3 p-5 md:p-6">
          <h3 className="font-serif text-xl font-bold text-secondary md:text-2xl">
            {course.name}
          </h3>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Separator orientation="vertical" className="h-3" />
            <span>{course.holeCount} {t('course.holes')}</span>
          </div>

          {course.greenFee !== null ? (
            <p className="font-semibold text-primary font-serif text-xl md:text-2xl">
              {course.greenFee} {t('course.currency')}
              <span className="text-sm font-normal text-muted-foreground"> / {t('course.perPlayer')}</span>
            </p>
          ) : (
            <p className="font-serif text-lg text-muted-foreground md:text-xl">
              {t('course.priceOnRequest')}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}