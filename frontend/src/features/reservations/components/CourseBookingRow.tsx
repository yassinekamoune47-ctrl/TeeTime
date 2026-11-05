import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CalendarDays, ChevronLeft, ChevronRight, Flame, ImageOff } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaUser } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useCourseAvailability } from '../hooks/useCourseAvailability';
import { isWeekendDate, nearestAvailableDate } from '../dateUtils';
import type { CourseAvailability, SlotAvailability } from '../types';

interface CourseRowProps {
  course: CourseAvailability;
  date: string; // YYYY-MM-DD
  clubBlocked?: boolean; // true → player already has a reservation at this club today
  onSlotSelect: (course: CourseAvailability, slot: SlotAvailability) => void;
}

const MAX_PLAYERS = 4;

export default function CourseBookingRow({ course, date, clubBlocked = false, onSlotSelect }: CourseRowProps) {
  const { t } = useTranslation('reservations');
  const [imgIndex, setImgIndex] = useState(0);
  const availableDates = course.availableDates ?? [];
  const [bookingDate, setBookingDate] = useState(() => nearestAvailableDate(availableDates, date));
  const images = course.imagesUrl ?? [];

  const usesOwnDate = bookingDate !== date;
  const { data: datedSlots, isFetching: isLoadingSlots, isError: isSlotsError } =
    useCourseAvailability(course.id, bookingDate, usesOwnDate);

  const prevImage = () => setImgIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setImgIndex((i) => (i + 1) % images.length);

  const activeSlots = usesOwnDate ? (datedSlots ?? []) : (course.timeSlots ?? []);

  const weekdayGreenFee = course.greenFeeWeekday ?? course.greenFee;
  const effectiveGreenFee = course.greenFee === null
    ? null
    : course.greenFeeWeekend != null && isWeekendDate(bookingDate)
      ? course.greenFeeWeekend
      : weekdayGreenFee;

  // Every cell is a tee time the club actually published for this date — nothing is generated here.
  const cells = activeSlots.map((slot) => ({
    slot,
    time: slot.startTime.slice(11, 16),
    booked: slot.bookedPlayers ?? 0,
    isClosed: slot.status === 'CLOSED',
  }));

  const handleDateChange = (value: string) => {
    if (value) setBookingDate(nearestAvailableDate(availableDates, value));
  };

  const handleClick = (cell: { slot: SlotAvailability; time: string; booked: number; isClosed: boolean }) => {
    if (clubBlocked || cell.isClosed || cell.booked >= MAX_PLAYERS) return;
    onSlotSelect(
      { ...course, greenFee: effectiveGreenFee, timeSlots: [] }, // avoid passing slots back (kept in page state)
      cell.slot,
    );
  };

  return (
    <article className="rounded-lg border border-border bg-background/50 p-2 sm:p-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        {/* Course info + image carousel */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-col lg:items-start lg:gap-2 lg:pt-0">
          <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-40 lg:h-60 lg:w-96">
            {images.length > 0 ? (
              <>
                <img
                  src={images[imgIndex]}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevImage}
                      aria-label="Previous image"
                      className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white transition-colors hover:bg-black/60"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={nextImage}
                      aria-label="Next image"
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white transition-colors hover:bg-black/60"
                    >
                      <ChevronRight size={16} />
                    </button>
                    <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1">
                      {images.map((_, i) => (
                        <span
                          key={i}
                          className={cn('h-1 rounded-full transition-all', i === imgIndex ? 'w-3 bg-white' : 'w-1 bg-white/50')}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageOff size={20} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-serif text-lg font-bold text-secondary sm:text-xl lg:text-2xl">{course.name}</h3>
            <p className="mt-1 text-base text-muted-foreground sm:text-base">
              {course.holeCount} {t('slot.holes')} <span className="mx-1.5 text-border">|</span>
              {effectiveGreenFee !== null ? (
                <span className="font-serif text-lg font-bold text-primary lg:text-xl">{effectiveGreenFee} MAD</span>
              ) : (
                <span className="text-sm font-medium text-muted-foreground">{t('slot.priceOnRequest')}</span>
              )}
           </p>
            <label className="mt-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <CalendarDays size={14} className="shrink-0 text-primary" />
              <span>{t('slot.reservationDate')}</span>
              <input
                type="date"
                value={bookingDate}
                min={availableDates[0]}
                max={availableDates[availableDates.length - 1]}
                onChange={(e) => handleDateChange(e.target.value)}
                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              {availableDates.length > 0 && (
                <span className="text-[11px] text-muted-foreground/80">
                  {t('slot.datesPublished', { n: availableDates.length, last: availableDates[availableDates.length - 1] })}
                </span>
              )}
              {isLoadingSlots && <span className="animate-pulse text-primary">…</span>}
            </label>
         </div>
        </div>

        {/* Slots — horizontal scroll on mobile, 3-col grid on desktop */}
        <div className="min-w-0 flex-1 lg:max-w-[70%]">
          {usesOwnDate && isSlotsError && (
            <p className="mb-2 text-xs text-red-500">{t('page.error')}</p>
          )}
          {cells.length === 0 && !isLoadingSlots && !isSlotsError && (
            <p className="mb-2 text-xs text-muted-foreground">{t('slot.noTimes')}</p>
          )}
          <div className="flex gap-2.5 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:gap-2.5 lg:overflow-x-visible lg:pb-0 lg:pr-1 lg:max-h-[288px] lg:overflow-y-auto">
            <>
            {cells.map((cell) => {
              const availableCount = Math.max(0, MAX_PLAYERS - cell.booked);
              const slotsBusy = usesOwnDate && (isLoadingSlots || isSlotsError);
              const available = availableCount > 0 && !clubBlocked && !cell.isClosed && !slotsBusy;

              return (
                <button
                  key={cell.time}
                  onClick={available ? () => handleClick(cell) : undefined}
                  disabled={!available}
                  className={cn(
                    'flex w-[150px] shrink-0 flex-col gap-2 rounded-lg border p-2 text-left transition-all lg:w-auto',
                    clubBlocked
                      ? 'border-secondary/40 bg-secondary/10 cursor-not-allowed opacity-50'
                      : cell.isClosed
                        ? 'border-border bg-muted/70 cursor-not-allowed opacity-50'
                        : available
                          ? 'border-primary bg-primary/5 hover:-translate-y-0.5 hover:bg-primary/10 hover:shadow-sm cursor-pointer'
                          : 'border-border bg-muted/50 cursor-not-allowed opacity-60',
                  )}
                >
                  {/* Time + available count */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-serif text-base font-bold',
                        clubBlocked ? 'text-secondary/60' : cell.isClosed ? 'text-muted-foreground' : available ? 'text-secondary' : 'text-muted-foreground',
                      )}
                    >
                      {cell.time}
                   </span>
                    {clubBlocked ? (
                      <span className="rounded-full bg-secondary/15 px-1.5 py-0.5 text-[10px] font-medium text-secondary/60 lg:px-2 lg:text-xs">
                        {t('slot.blocked')}
                      </span>
                    ) : cell.isClosed ? (
                      <span className="rounded-full bg-muted border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:px-2 lg:text-xs">
                        {t('slot.closed')}
                      </span>
                    ) : available && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary lg:px-2 lg:text-xs">
                        {availableCount <= 2 && <Flame size={11} />}
                        {availableCount} {t('slot.places')}
                     </span>
                    )}
                 </div>

                  {/* Avatar group — 4 spots */}
                  <div className="flex -space-x-2">
                    {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
                      const isBooked = i < cell.booked;
                      return (
                        <Avatar
                          key={i}
                          className={cn(
                            'h-6 w-6 rounded-full border-2',
                            isBooked ? 'border-primary bg-secondary' : 'border-border bg-background',
                          )}
                        >
                          <AvatarImage src="" alt="" />
                          <AvatarFallback className={isBooked ? 'bg-primary/10' : 'bg-muted'}>
                            {isBooked ? (
                              <FaUser className="size-2.5 text-primary" />
                            ) : (
                              <div className="h-full w-full" />
                            )}
                         </AvatarFallback>
                       </Avatar>
                      );
                    })}
                 </div>
               </button>
              );
            })}
            </>
         </div>
        </div>
      </div>
    </article>
  );
}

