import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SlotButton from '../components/SlotButton';
import SlotPickerDialog from '../components/SlotPickerDialog';
import { golfCourseApi } from '@/api/endpoints/golf-course.api';
import { useCourseAvailability } from '../hooks/useCourseAvailability';
import { useCourseAvailableDates } from '../hooks/useCourseAvailableDates';
import { isWeekendDate, nearestAvailableDate } from '../dateUtils';
import type { CourseAvailability, Slot, SlotAvailability } from '../types';
import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterDialog, { type FilterValues } from '@/features/clubs/components/FilterDialog';

const MAX_PLAYERS = 4;

function toCardSlot(slot: SlotAvailability): Slot {
  const booked = slot.bookedPlayers ?? 0;
  return {
    time: slot.startTime.slice(11, 16),
    available: slot.status !== 'CLOSED' && booked < MAX_PLAYERS,
    totalSlots: MAX_PLAYERS,
    players: Array.from({ length: booked }, () => ({ name: '' })),
  };
}

function feeForDate(weekday: number | null, weekend: number | null, date: string): number | null {
  if (weekday === null) return null;
  return weekend !== null && isWeekendDate(date) ? weekend : weekday;
}

export default function SessionPage() {
  const { t } = useTranslation('reservations');
  const { courseId } = useParams();

  const { data: dates } = useCourseAvailableDates(courseId ?? '');
  const availableDates = useMemo(() => dates?.availableDates ?? [], [dates]);

  const [pickedDate, setPickedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Only days the club really publishes can be shown, so a picked date is
  // resolved to the closest bookable one.
  const activeDate = nearestAvailableDate(availableDates, pickedDate || availableDates[0] || '');

  const { data: slots = [], isLoading, isError } = useCourseAvailability(
    courseId ?? '',
    activeDate,
    Boolean(courseId) && availableDates.includes(activeDate),
  );

  const { data: course } = useQuery({
    queryKey: ['golf-course', courseId],
    queryFn: async () => (await golfCourseApi.getGolfCourse(courseId as string)).data.data,
    enabled: Boolean(courseId),
    retry: false,
  });

  const courseForDialog: CourseAvailability = {
    id: courseId ?? '',
    name: course?.name ?? '',
    holeCount: course?.holeCount ?? 0,
    greenFee: feeForDate(course?.greenFee ?? null, course?.greenFeeWeekend ?? null, activeDate),
    description: course?.description ?? '',
    imagesUrl: course?.imagesUrls ?? [],
    timeSlots: [],
  };

  const handleSlotClick = (slot: SlotAvailability) => {
    setSelectedSlot(slot);
    setDialogOpen(true);
  };

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    date: '',
    timeFrom: '',
    timeTo: '',
    players: '',
    holes: '',
  });

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      <main className="pt-20">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-xs font-medium tracking-widest text-muted-foreground">
                  {t('page.availableSlots')}
                </h2>
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CalendarDays size={14} className="shrink-0 text-primary" />
                  <input
                    type="date"
                    value={activeDate}
                    min={availableDates[0]}
                    max={availableDates[availableDates.length - 1]}
                    onChange={(e) => setPickedDate(e.target.value)}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </label>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-primary text-secondary"
                onClick={() => setFilterOpen(true)}
              >
                <SlidersHorizontal size={18} />
                <span className="hidden md:inline">{t('search.filter')}</span>
              </Button>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">{t('page.loading')}</p>
            ) : isError ? (
              <p className="text-sm text-red-500">{t('page.error')}</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('page.noSlots')}</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {slots.map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={toCardSlot(slot)}
                    onClick={() => handleSlotClick(slot)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <SlotPickerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={courseForDialog}
        slot={selectedSlot}
        date={activeDate}
      />

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filters}
        onChange={(values) => {
          setFilters(values);
          if (values.date) setPickedDate(values.date);
        }}
        showHoles={false}
      />
    </div>
  );
}
