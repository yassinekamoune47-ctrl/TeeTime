import { useTranslation } from 'react-i18next';
import { Flag, Users } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog.tsx';
import { Drawer, DrawerContent } from '@/components/ui/drawer.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useMediaQuery } from '@/hooks/useMediaQuery.ts';
import { useNavigate } from 'react-router-dom';
import type { Course, GreenFeeRate } from '@/features/courses/types.ts';
import { CourseImageCarousel } from './CourseImageCarousel.tsx';

interface CourseDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReserve?: (course: Course) => void; // if provided, overrides default navigate
}

export default function CourseDialog({ course, open, onOpenChange, onReserve }: CourseDialogProps) {
  const { t, i18n } = useTranslation('clubs');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();

  if (!course) return null;

  const images = course.imagesUrls ?? [];

  const handleReserve = () => {
    if (onReserve) {
      onReserve(course);
      return;
    }
    onOpenChange(false);
    navigate(`/sessions/${course.id}`);
  };

  const rates = course.greenFees ?? [];
  const extras = course.extraFees ?? [];
  const isFr = i18n.language.startsWith('fr');
  const rateLabel = (rate: GreenFeeRate) => (isFr ? rate.label : (rate.labelEn ?? rate.label));

  const details = (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
            <Flag size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">{t('course.courseNumber')}</span>
            <span className="text-sm font-semibold text-foreground">{course.name}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
            <Users size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">{t('course.holes')}</span>
            <span className="text-sm font-semibold text-foreground">{course.holeCount}</span>
          </div>
          <div className="col-span-2 flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-xs text-muted-foreground">{t('dialog.perPlayer')}</span>
            {course.greenFee !== null ? (
              <span className="text-xl font-serif font-bold text-primary">
                {course.greenFee} {t('course.currency')}
              </span>
            ) : (
              <span className="text-sm font-semibold text-muted-foreground">{t('course.priceOnRequest')}</span>
            )}
          </div>
        </div>

        {rates.length > 0 && (
          <div className="rounded-lg border border-border p-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('course.greenFees')}</span>
            <ul className="mt-2 flex flex-col divide-y divide-border">
              {rates.map((rate) => (
                <li key={rate.label} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="text-sm text-foreground">{rateLabel(rate)}</span>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {rate.price} {t('course.currency')}
                    {rate.weekendPrice != null && rate.weekendPrice !== rate.price && (
                      <span className="ml-1 font-normal text-muted-foreground">
                        · {rate.weekendPrice} {t('course.weekend')}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {extras.length > 0 && (
          <div className="rounded-lg border border-border p-3">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{t('course.extraFees')}</span>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              {extras.map((extra) => (
                <li key={extra.label} className="flex w-full items-center justify-between gap-2 text-sm sm:w-[calc(50%-0.5rem)]">
                  <span className="text-muted-foreground">{isFr ? extra.label : (extra.labelEn ?? extra.label)}</span>
                  <span className="shrink-0 font-medium text-foreground">
                    {extra.price !== null
                      ? `${extra.price}${extra.priceMax != null ? `–${extra.priceMax}` : ''} ${t('course.currency')}`
                      : t('course.priceOnRequest')}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">{t('course.extraFeesHint')}</p>
          </div>
        )}
      </div>
  );

  // ─── Desktop: centered Dialog (UNCHANGED) ───
  if (isDesktop) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-h-[80vh] overflow-hidden p-0 sm:max-w-4xl bg-white">
            <div className="flex flex-col md:flex-row h-full">
                {images.length > 0
                    ? (<div className="relative h-56 w-full md:h-auto md:w-5/10 md:min-h-125">
                          <CourseImageCarousel images={images} alt={course.name} />
                        </div>
                    )
                    : <div className="relative h-56 md:h-auto md:min-h-125"></div>
                }
              <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:max-h-[90vh]">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-secondary sm:text-3xl">{course.name}</h2>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
                <div>{details}</div>
                <div className="mb-2">
                  <Button
                      size="lg"
                      className="w-full"
                      onClick={handleReserve}
                  >
                    {t('dialog.reserve')}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
    );
  }

  // ─── Mobile: bottom sheet Drawer (drag down to close) ───
  return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] bg-white">
          <div className="flex flex-col overflow-y-auto">
            {images.length > 0
                ? (<div className="relative h-44 w-full shrink-0">
                      <CourseImageCarousel images={images} alt={course.name} />
                    </div>
                )
                : <div className=""></div>
            }
            <div className="flex flex-1 flex-col gap-5 p-5">
              <div>
                <h2 className="font-serif text-xl font-bold text-secondary">{course.name}</h2>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </div>
              <div>{details}</div>
              <div className="mt-auto pt-2">
                <Button
                    size="lg"
                    className="w-full"
                    onClick={handleReserve}
                >
                  {t('dialog.reserve')}
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
  );
}