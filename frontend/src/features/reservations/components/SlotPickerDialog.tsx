import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useAuthStore } from '@/features/auth/store';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCreateReservation } from '../hooks/useCreateReservation';
import { toast } from 'sonner';
import type { CourseAvailability, SlotAvailability } from '../types';

interface SlotPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseAvailability | null;
  slot: SlotAvailability | null;
  date: string;
}

const MAX_PLAYERS = 4;

export default function SlotPickerDialog({ open, onOpenChange, course, slot, date }: SlotPickerDialogProps) {
  const { t, i18n } = useTranslation('reservations');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { isPending: isAuthPending } = useAuth();
  const createReservation = useCreateReservation();

  const [players, setPlayers] = useState(1);

  if (!course || !slot) return null;

  const placesLeft = MAX_PLAYERS - slot.bookedPlayers;
  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(
        i18n.language.startsWith('fr') ? 'fr-FR' : 'en-GB',
        { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
      )
    : '';

  const handleConfirm = () => {
    if (!isAuthenticated || !user) {
      toast.error('Please authenticate to make a reservation', {
        description: 'You need to be logged in as a player to book a slot.',
      });
      return;
    }
    if (user.role !== 'PLAYER') {
      toast.error('Only players can book', {
        description: `Your role is ${user.role}. Only players can make reservations.`,
      });
      return;
    }
    createReservation.mutate(
      { courseId: course.id, startTime: slot.startTime, numberOfPlayers: players, reservationDate: date },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const content = (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">{formattedDate}</h3>
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('dialog.course') || 'Course'}</span>
            <span className="text-sm font-medium text-foreground">{course.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('dialog.time') || 'Time'}</span>
            <span className="text-sm font-medium text-foreground">{slot.startTime.slice(11, 16)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('dialog.places') || 'Places left'}</span>
            <span className="text-sm font-medium text-foreground">{placesLeft}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('dialog.price') || 'Price'}</span>
            <span className="text-sm font-medium text-foreground">
              {course.greenFee !== null
                ? `${course.greenFee} MAD ${t('dialog.perPlayer') || '/ player'}`
                : (t('dialog.priceOnRequest') || 'Price on request')}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t('dialog.total') || 'Total'}</span>
            <span className="font-serif text-xl font-bold text-primary">
              {course.greenFee !== null
                ? `${players * course.greenFee} MAD`
                : (t('dialog.priceOnRequest') || 'Price on request')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPlayers((n) => Math.max(1, n - 1))}
          disabled={players <= 1}
        >
          −
        </Button>
        <span className="font-serif text-3xl font-bold text-secondary">{players}</span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPlayers((n) => Math.min(placesLeft, n + 1))}
          disabled={players >= placesLeft}
        >
          +
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        {players} {players > 1 ? 'players' : 'player'} · {placesLeft} {t('slot.places') || 'places left'}
      </p>

      <Button size="lg" className="w-full" disabled={createReservation.isPending || isAuthPending} onClick={handleConfirm}>
        {createReservation.isPending || isAuthPending ? '...' : t('dialog.confirm') || 'Confirm'}
      </Button>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md bg-surface">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">
              {course.name} — {slot.startTime.slice(11, 16)}
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-surface">
        <DrawerHeader>
          <DrawerTitle className="font-serif text-lg font-bold text-secondary">
            {course.name} — {slot.startTime.slice(11, 16)}
          </DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-6">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
