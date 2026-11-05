import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

type SlotStatus = 'available' | 'partial' | 'full' | 'blocked' | 'past';

interface Slot {
  time: string;
  occupancy: string;
  status: SlotStatus;
  bookedBy?: string;
  contact?: string;
}

const statusColors: Record<SlotStatus, string> = {
  available: 'bg-secondary/15 text-secondary border-secondary/30',
  partial: 'bg-primary/15 text-primary border-primary/30',
  full: 'bg-red-500/15 text-red-600 border-red-500/30',
  blocked: 'bg-muted text-muted-foreground border-border',
  past: 'bg-transparent text-muted-foreground/40 border-border/50',
};

const mockSlots: Slot[] = [
  { time: '06:00', occupancy: '—', status: 'past' },
  { time: '07:00', occupancy: '4/4', status: 'full', bookedBy: 'Ahmed B.', contact: '+212 6 12 34 56' },
  { time: '08:00', occupancy: '2/4', status: 'partial', bookedBy: 'Youssef K.', contact: '+212 6 98 76 54' },
  { time: '09:00', occupancy: '4/4', status: 'full', bookedBy: 'Sara M.', contact: '+212 6 55 44 33' },
  { time: '10:00', occupancy: '0/4', status: 'available' },
  { time: '11:00', occupancy: '1/4', status: 'partial', bookedBy: 'Karim E.', contact: '+212 6 77 88 99' },
  { time: '12:00', occupancy: '—', status: 'blocked' },
  { time: '13:00', occupancy: '3/4', status: 'partial', bookedBy: 'Omar F.', contact: '+212 6 22 33 44' },
  { time: '14:00', occupancy: '0/4', status: 'available' },
  { time: '15:00', occupancy: '4/4', status: 'full', bookedBy: 'Nadia L.', contact: '+212 6 90 80 70' },
  { time: '16:00', occupancy: '2/4', status: 'partial', bookedBy: 'Hassan T.', contact: '+212 6 11 22 33' },
  { time: '17:00', occupancy: '0/4', status: 'available' },
  { time: '18:00', occupancy: '1/4', status: 'partial', bookedBy: 'Imane R.', contact: '+212 6 44 55 66' },
  { time: '19:00', occupancy: '0/4', status: 'available' },
  { time: '20:00', occupancy: '—', status: 'past' },
];

export default function TeeSheetMini() {
  const { t } = useTranslation('app');
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Slot | null>(null);

  return (
    <Card className="flex flex-col p-4">
      <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
        {t('dashboard.manager.teeSheet.title')}
      </h3>

      {/* Legend */}
      <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {(['available', 'partial', 'full', 'blocked', 'past'] as SlotStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`size-2.5 rounded-sm border ${statusColors[s]}`} />
            {t(`dashboard.manager.teeSheet.${s}`)}
          </div>
        ))}
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {mockSlots.map((slot) => (
          <Popover key={slot.time} open={selected?.time === slot.time} onOpenChange={(o) => setSelected(o ? slot : null)}>
            <PopoverTrigger
              render={
                <button
                  className={`flex flex-col items-center gap-0.5 rounded-md border px-2 py-1.5 text-xs transition-colors ${statusColors[slot.status]} ${
                    slot.status === 'past' ? 'cursor-default' : 'cursor-pointer hover:shadow-sm'
                  }`}
                  disabled={slot.status === 'past'}
                >
                  <span className="font-semibold">{slot.time}</span>
                  <span className="text-[10px]">{slot.occupancy}</span>
                </button>
              }
            />
            {slot.bookedBy && (
              <PopoverContent className="w-48 p-3">
                <div className="flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.manager.teeSheet.bookedBy')}</span>
                    <span className="font-semibold text-secondary">{slot.bookedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.manager.teeSheet.players')}</span>
                    <span className="font-semibold text-secondary">{slot.occupancy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('dashboard.manager.teeSheet.contact')}</span>
                    <span className="font-semibold text-secondary">{slot.contact}</span>
                  </div>
                </div>
              </PopoverContent>
            )}
          </Popover>
        ))}
      </div>

      <button
        onClick={() => navigate('/planning')}
        className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
      >
        {t('dashboard.manager.teeSheet.viewFull')}
        <ChevronRight size={14} />
      </button>
    </Card>
  );
}