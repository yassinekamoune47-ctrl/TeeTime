import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { FaUser } from "react-icons/fa";
import type { Slot } from '../types';

interface SlotButtonProps {
  slot: Slot;
  onClick: () => void;
}

export default function SlotButton({ slot, onClick }: SlotButtonProps) {
  const { t } = useTranslation('reservations');
  const availableCount = slot.totalSlots - slot.players.length;

  return (
    <button
      onClick={slot.available ? onClick : undefined}
      disabled={!slot.available}
      className={`
        flex flex-col gap-3 rounded-lg border p-4 text-left transition-all
        ${slot.available
          ? 'border-primary bg-primary/5 hover:bg-primary/10 cursor-pointer'
          : 'border-border bg-muted/50 cursor-not-allowed opacity-60'
        }
      `}
    >
      {/* Time + available count */}
      <div className="flex items-center justify-between">
        <span className={`font-serif text-xl font-bold ${slot.available ? 'text-secondary' : 'text-muted-foreground'}`}>
          {slot.time}
        </span>
        {slot.available && (
                <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-primary/15 text-primary">
                    {availableCount} {t('slot.places')}
                </span>
            )  
        }
        
      </div>

      {/* Avatar group — 4 slots */}
      <div className="flex -space-x-2">
        {Array.from({ length: slot.totalSlots }).map((_, i) => {
          const player = slot.players[i];
          return (
            <Avatar
              key={i}
              className={`h-9 w-9 rounded-full border-2 ${
                player
                  ? 'border-primary bg-secondary'
                  : 'border-border bg-background'
              }`}
            >
              {player?.avatar && <AvatarImage src={player.avatar} alt={player.name} />}
              <AvatarFallback className={player ? 'bg-primary/10' : 'bg-muted'}>
                {player ? (
                  <FaUser size={14} className="text-primary" />
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
}