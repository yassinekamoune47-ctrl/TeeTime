import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, CheckCircle2, Calendar, Clock, Users, Flag } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Slot } from '../types';
import { useNavigate } from 'react-router-dom';

interface ReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  date: string;
  slot: Slot | null;
  pricePerPlayer: number | null;
}

export default function ReservationDialog({
  open,
  onOpenChange,
  courseName,
  date,
  slot,
  pricePerPlayer,
}: ReservationDialogProps) {
  const { t } = useTranslation('reservations');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [step, setStep] = useState<'select' | 'summary'>('select');
  const [slotCount, setSlotCount] = useState(1);
  const navigate = useNavigate();

  if (!slot) return null;

  const maxSlots = slot.totalSlots - slot.players.length;
  const total = pricePerPlayer !== null ? slotCount * pricePerPlayer : null;

  const handleReserve = () => setStep('summary');

  const handleConfirm = () => {
    toast.success(t('notification.success'), {
      description: t('notification.successDesc'),
    });
    onOpenChange(false);
    setStep('select');
    setSlotCount(1);
    navigate(`/reservations`);
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setStep('select');
      setSlotCount(1);
    }
  };

  // ─── Shared content ───
  const selectContent = (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
          {t('dialog.selectSlots')}
        </h3>
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSlotCount((n) => Math.max(1, n - 1))}
            disabled={slotCount <= 1}
          >
            <Minus size={16} />
          </Button>
          <span className="font-serif text-3xl font-bold text-secondary">{slotCount}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSlotCount((n) => Math.min(maxSlots, n + 1))}
            disabled={slotCount >= maxSlots}
          >
            <Plus size={16} />
          </Button>
        </div>
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {slotCount} {t('dialog.slots')} · {maxSlots} {t('slot.places')}
        </p>
      </div>

      <Button size="lg" className="w-full" onClick={handleReserve}>
        {t('dialog.reserve')}
      </Button>
    </div>
  );

  const summaryContent = (
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
          {t('dialog.summary')}
        </h3>
        <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flag size={14} className="text-primary" /> {t('dialog.course')}
            </span>
            <span className="text-sm font-medium text-foreground">{courseName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar size={14} className="text-primary" /> {t('dialog.date')}
            </span>
            <span className="text-sm font-medium text-foreground">{date}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock size={14} className="text-primary" /> {t('dialog.time')}
            </span>
            <span className="text-sm font-medium text-foreground">{slot.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users size={14} className="text-primary" /> {t('dialog.places')}
            </span>
            <span className="text-sm font-medium text-foreground">{slotCount}</span>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">{t('dialog.total')}</span>
            <span className="font-serif text-xl font-bold text-primary">
              {total !== null ? `${total} MAD` : t('dialog.priceOnRequest')}
            </span>
          </div>
        </div>
      </div>

      <Button size="lg" className="w-full gap-2" onClick={handleConfirm}>
        <CheckCircle2 size={18} />
        {t('dialog.confirm')}
      </Button>
    </div>
  );

  const allContent = (
    <div className="flex flex-col gap-6">
      {/* Header with time */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-secondary md:text-2xl">{slot.time}</h2>
          <p className="text-sm text-muted-foreground">{courseName} — {date}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
          slot.available ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {maxSlots} {t('slot.places')}
        </span>
      </div>

      <Separator />

      {step === 'select' ? selectContent : summaryContent}
    </div>
  );

  // ─── Desktop: Dialog ───
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-white">
          {allContent}
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Mobile: Drawer ───
  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <div className="overflow-y-auto p-5 bg-white">
          {allContent}
        </div>
      </DrawerContent>
    </Drawer>
  );
}