import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ClubBookingCard from '../components/ClubBookingCard';
import SlotPickerDialog from '../components/SlotPickerDialog';
import { useSearchTimeSlots } from '../hooks/useSearchTimeSlots';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Calendar, MapPin, ChevronDown } from 'lucide-react';
import { tomorrowIso } from '../dateUtils';
import type { CourseAvailability, SlotAvailability } from '../types';

export default function ReservationPage() {
  const { t } = useTranslation('reservations');
  const navigate = useNavigate();
  const { isPending: isAuthPending } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [clubName, setClubName] = useState('');
  const [city, setCity] = useState('');
  const [date, setDate] = useState<string>(tomorrowIso());

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSearchTimeSlots({ clubName, city, address: '', date });

  const clubs = data?.pages.flatMap((page) => page.clubs) ?? [];
  const bookingWindow = data?.pages[0]?.bookingWindow;

  // The backend publishes a rolling window; the picker can never leave it.
  const handleDateChange = (value: string) => {
    if (!value) return;
    if (bookingWindow && value < bookingWindow.start) return setDate(bookingWindow.start);
    if (bookingWindow && value > bookingWindow.end) return setDate(bookingWindow.end);
    setDate(value);
  };

  // Slot confirm state
  const [selectedCourse, setSelectedCourse] = useState<CourseAvailability | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotAvailability | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(date);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);

  const handleSlotSelect = (course: CourseAvailability, slot: SlotAvailability) => {
    if (!isAuthenticated) {
      if (isAuthPending) {
        toast.info('Checking authentication status...');
        return;
      }
      toast.error('Please log in to book a slot', {
        description: 'You need to be signed in to make a reservation.',
      });
      navigate('/login');
      return;
    }
    setSelectedCourse(course);
    setSelectedSlot(slot);
    setSelectedDate(slot.startTime.slice(0, 10));
    setSlotDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      <main className="pt-20">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
          <div className="mb-6 max-w-2xl">
            <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">
              {t('page.eyebrow')}
            </p>
            <h1 className="mt-2 font-serif text-3xl font-bold text-secondary sm:text-4xl">
              {t('page.title')}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
              {t('page.subtitle')}
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-border bg-surface p-3 shadow-sm sm:p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder={t('search.clubName')}
                className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative md:w-56">
              <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t('search.city')}
                className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative md:w-48">
              <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                type="date"
                value={date}
                min={bookingWindow?.start ?? tomorrowIso()}
                max={bookingWindow?.end}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-10 border-primary"
              />
            </div>
            </div>
            {bookingWindow && (
              <p className="mt-2 text-xs text-muted-foreground">
                {t('page.windowHint', {
                  days: bookingWindow.days,
                  start: bookingWindow.start,
                  end: bookingWindow.end,
                })}
              </p>
            )}
          </div>

          {isLoading ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t('page.loading')}</p>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-red-500">{t('page.error')}</p>
          ) : clubs.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t('page.empty')}</p>
          ) : (
            <div className="flex flex-col gap-5">
              {clubs.map((club) => (
                <ClubBookingCard
                  key={club.id}
                  club={club}
                  date={date}
                  onSlotSelect={handleSlotSelect}
                />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="pt-6 text-center">
              <Button
                variant="outline"
                className="gap-2 border-secondary text-secondary hover:bg-secondary/10"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                <ChevronDown size={16} />
                {isFetchingNextPage ? t('page.loadingMore') : t('page.loadMore')}
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Slot confirm dialog */}
      <SlotPickerDialog
        open={slotDialogOpen}
        onOpenChange={setSlotDialogOpen}
        course={selectedCourse}
        slot={selectedSlot}
        date={selectedDate}
      />
    </div>
  );
}
