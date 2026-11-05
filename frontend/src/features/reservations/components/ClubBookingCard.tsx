import { MapPin } from 'lucide-react';
import CourseBookingRow from './CourseBookingRow';
import type { ClubAvailability, CourseAvailability, SlotAvailability } from '../types';

interface ClubBookingCardProps {
  club: ClubAvailability;
  date: string;
  onSlotSelect: (course: CourseAvailability, slot: SlotAvailability, club: ClubAvailability) => void;
}

export default function ClubBookingCard({ club, date, onSlotSelect }: ClubBookingCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
      <header className="relative h-32 w-full overflow-hidden sm:h-40">
        <img
          src={club.coverUrl || '/club 1.png'}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 p-3 sm:p-4">
          <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/70 bg-background shadow-sm">
            <img src={club.logoUrl || '/teetime-logo.png'} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-serif text-lg font-bold text-white drop-shadow sm:text-xl">{club.name}</h2>
            <p className="flex items-center gap-1 text-sm text-white/90">
              <MapPin size={13} className="shrink-0" />
              <span className="truncate">{club.city}</span>
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2 p-2.5 sm:p-3">
        {club.courses.map((course) => (
          <CourseBookingRow
            key={`${course.id}-${date}`}
            course={course}
            date={date}
            clubBlocked={club.blockedForPlayer}
            onSlotSelect={(selectedCourse, slot) => onSlotSelect(selectedCourse, slot, club)}
          />
        ))}
      </div>
    </section>
  );
}
