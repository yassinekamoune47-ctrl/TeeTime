import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import moment from 'moment';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Clock, Calendar as CalIcon, Ban, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import PlanningCalendar from '../components/PlanningCalendar';
import {
  useManagerPlanning,
  type ManagerPlanningSlot,
} from '../hooks/useManagerPlanning';
import { useDataMyClub } from '../hooks/useDataMyClub';
import { timeSlotApi } from '@/api/endpoints/timeSlot.api';
import { getApiErrorMessage } from '@/lib/apiError';

type SessionStatus = 'available' | 'partial' | 'full' | 'blocked';

interface Player { name: string; initials: string; }

export interface Session {
  id: string;
  time: string;
  date: string;
  start: Date;
  end: Date;
  status: SessionStatus;
  course: string;
  club: string;
  price: number | null;
  players: Player[];
  contact?: string;
}

const statusColors: Record<SessionStatus, string> = {
  available: 'bg-secondary/15 text-secondary border-secondary/30',
  partial: 'bg-primary/15 text-primary border-primary/30',
  full: 'bg-red-500/15 text-red-600 border-red-500/30',
  blocked: 'bg-red-500/15 text-red-600 border-red-500/30',
};

const pad = (n: number) => String(n).padStart(2, '0');

// ISO (YYYY-MM-DD) day-string for a date
const isoDay = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const fmtIso = (iso?: string): string =>
  iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '';

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// Map an API slot to the display model used by both tabs.
function deriveSession(s: ManagerPlanningSlot): Session {
  const start = new Date(s.startTime);
  let status: SessionStatus;
  if (s.status === 'CLOSED') status = 'blocked';
  else if (s.bookedPlayers >= 4) status = 'full';
  else if (s.bookedPlayers > 0 || s.status === 'RESERVED') status = 'partial';
  else status = 'available';

  // Use slot endTime if present and valid, otherwise fallback to start + 30 min
  let end = s.endTime ? new Date(s.endTime) : new Date(start.getTime() + 30 * 60 * 1000);
  if (isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    end = new Date(start.getTime() + 30 * 60 * 1000);
  }

  return {
    id: s.id,
    time: s.startTime.slice(11, 16),
    date: fmtIso(s.startTime),
    start,
    end,
    status,
    course: s.courseName ?? '',
    club: '',
    price: s.greenFee === null || s.greenFee === undefined ? null : Number(s.greenFee),
    players: s.players.map((p) => ({
      name: p.playerName,
      initials: initialsOf(p.playerName),
    })),
    contact: s.players.find((p) => p.phone)?.phone,
  };
}

type TabId = 'sessions' | 'calendar';

export default function PlanningPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [tab, setTab] = useState<TabId>('sessions');

  // ── Server-driven filters ────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  // Debounce search input (500ms delay)
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 500);
    return () => clearTimeout(id);
  }, [searchInput]);

  // Date range for the list tab
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Controlled date and view for calendar tab
  const [calendarDate, setCalendarDate] = useState<Date>(() => new Date());
  const [calendarView, setCalendarView] = useState<'week' | 'day'>(() => (isDesktop ? 'week' : 'day'));

  // Calculate date range for calendar tab
  const calendarRange = useMemo(() => {
    if (calendarView === 'day') {
      const dStr = isoDay(calendarDate);
      return { from: dStr, to: dStr };
    }
    const d = new Date(calendarDate);
    const dayOfWeek = d.getDay(); // 0 = Sunday
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - dayOfWeek);
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    return { from: isoDay(sunday), to: isoDay(saturday) };
  }, [calendarDate, calendarView]);

  const [courseFilter, setCourseFilter] = useState('all');

  // ── Client-side-only filters (small data volume per query) ───────
  const [statusFilter, setStatusFilter] = useState('all');

  const activeFilters = tab === 'calendar'
    ? {
        q: search,
        courseId: courseFilter === 'all' ? undefined : courseFilter,
        dateFrom: calendarRange.from,
        dateTo: calendarRange.to,
      }
    : {
        q: search,
        courseId: courseFilter === 'all' ? undefined : courseFilter,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManagerPlanning(activeFilters);

  // Infinite scroll sentinel — lazy loads the next page at the bottom of the list
  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, hasNextPage);

  const queryClient = useQueryClient();
  const { data: myClub } = useDataMyClub();

  const [selected, setSelected] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);

  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedCourseForSlot, setSelectedCourseForSlot] = useState<string>('');
  const [isClosingSlots, setIsClosingSlots] = useState(false);
  const [isReopeningSlot, setIsReopeningSlot] = useState(false);

  const fetchedSlots = useMemo(
    () => data?.pages.flatMap((p) => p.content) ?? [],
    [data],
  );

  // Course options (id → name) from myClub and the fetched slots
  const courseOptions = useMemo(() => {
    const options: Record<string, string> = {};
    (myClub?.courses ?? []).forEach((c) => {
      options[c.id] = c.name;
    });
    fetchedSlots.forEach((s) => {
      options[s.courseId] = s.courseName;
    });
    return options;
  }, [fetchedSlots, myClub]);

  const sessions: Session[] = useMemo(
    () => fetchedSlots.map(deriveSession),
    [fetchedSlots],
  );

  // Client-side extras on the already-fetched pages
  const filtered = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      return true;
    });
  }, [sessions, statusFilter]);

  const handleClick = (session: Session) => {
    setSelected(session);
    setOpen(true);
  };

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    setPendingSlot(slot);
    const defaultCourseId = courseFilter !== 'all' ? courseFilter : myClub?.courses?.[0]?.id || Object.keys(courseOptions)[0] || '';
    setSelectedCourseForSlot(defaultCourseId);
    setSlotDialogOpen(true);
  };

  const handleCloseSlots = async () => {
    if (!pendingSlot) return;
    const courseId = selectedCourseForSlot || (courseFilter !== 'all' ? courseFilter : myClub?.courses?.[0]?.id || Object.keys(courseOptions)[0]);
    if (!courseId) {
      toast.error('Veuillez sélectionner un parcours');
      return;
    }

    setIsClosingSlots(true);
    try {
      const startStr = moment(pendingSlot.start).format('YYYY-MM-DDTHH:mm:ss');
      const endStr = moment(pendingSlot.end).format('YYYY-MM-DDTHH:mm:ss');
      await timeSlotApi.createTimeSlot({
        startTime: startStr,
        endTime: endStr,
        status: 'CLOSED',
        courseId,
      });
      toast.success('Créneaux fermés avec succès (bloqués en rouge)');
      setSlotDialogOpen(false);
      setPendingSlot(null);
      queryClient.invalidateQueries({ queryKey: ['time-slots', 'planning'] });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la fermeture des créneaux'));
    } finally {
      setIsClosingSlots(false);
    }
  };

  const handleReopenSlot = async () => {
    if (!selected) return;
    setIsReopeningSlot(true);
    try {
      await timeSlotApi.updateTimeSlotStatus({
        id: selected.id,
        status: 'OPEN',
      });
      toast.success('Créneau rouvert aux réservations');
      setOpen(false);
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ['time-slots', 'planning'] });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la réouverture du créneau'));
    } finally {
      setIsReopeningSlot(false);
    }
  };

  const detailsContent = selected && (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-serif text-xl font-bold text-secondary">{selected.time}</div>
          <div className="text-xs text-muted-foreground">{selected.date} • {selected.course}</div>
        </div>
        <Badge className={`border ${statusColors[selected.status]}`}>
          {t(`planning.status.${selected.status}`)}
        </Badge>
      </div>

      <Separator />

      {selected.players.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium tracking-widest text-primary">{t('planning.details.players')}</span>
          <div className="flex -space-x-2">
            {selected.players.slice(0, 6).map((p) => (
              <Avatar key={p.initials} size="sm" className="ring-2 ring-surface">
                <AvatarFallback className="bg-primary/15 text-[10px] text-primary">{p.initials}</AvatarFallback>
              </Avatar>
            ))}
            {selected.players.length > 6 && (
              <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-surface">+{selected.players.length - 6}</div>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {selected.players.length} joueur{selected.players.length > 1 ? 's' : ''} •{' '}
            {selected.price !== null ? `${selected.price} MAD` : t('planning.details.priceOnRequest')}
          </div>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">Aucune réservation pour ce créneau.</div>
      )}

      <div className="pt-2 border-t border-border">
        {selected.status === 'blocked' ? (
          <Button
            className="w-full gap-2 bg-secondary text-white hover:bg-secondary/90"
            onClick={handleReopenSlot}
            disabled={isReopeningSlot}
          >
            <CheckCircle size={16} />
            {isReopeningSlot ? 'Réouverture...' : 'Ouvrir / Débloquer ce créneau'}
          </Button>
        ) : (
          <div className="text-xs text-muted-foreground text-center">
            Créneau disponible. Utilisez le calendrier pour le fermer.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('sessions')}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'sessions'
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border bg-surface text-muted-foreground hover:bg-muted'
          }`}
        >
          <Clock size={16} />
          {t('planning.tabSessions')}
        </button>
        <button
          onClick={() => setTab('calendar')}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
            tab === 'calendar'
              ? 'border-primary bg-primary/15 text-primary'
              : 'border-border bg-surface text-muted-foreground hover:bg-muted'
          }`}
        >
          <CalIcon size={16} />
          {t('planning.tabCalendar')}
        </button>
      </div>

      {/* Tab content */}
      {tab === 'sessions' ? (
        <div className="flex flex-col gap-4">
          {/* Filter bar */}
          <Card className="p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t('planning.searchPlaceholder')}
                  className="pl-10 border-primary placeholder:text-secondary"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">{t('planning.filterFrom')}</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="border-border"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">{t('planning.filterTo')}</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="border-border"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">{t('planning.filterStatus')}</Label>
                  <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                    <SelectTrigger size="sm" className="w-full border-border">
                      <SelectValue>
                        {statusFilter === 'all' ? t('planning.all') : t(`planning.status.${statusFilter}`)}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('planning.all')}</SelectItem>
                      <SelectItem value="available">{t('planning.status.available')}</SelectItem>
                      <SelectItem value="partial">{t('planning.status.partial')}</SelectItem>
                      <SelectItem value="full">{t('planning.status.full')}</SelectItem>
                      <SelectItem value="blocked">{t('planning.status.blocked')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1">
                  <Label className="text-xs text-muted-foreground">{t('planning.filterCourse')}</Label>
                  <Select value={courseFilter} onValueChange={(v) => setCourseFilter(v ?? 'all')}>
                    <SelectTrigger size="sm" className="w-full border-border">
                      <SelectValue>
                        {courseFilter === 'all'
                          ? t('planning.allCourses')
                          : courseOptions[courseFilter] ?? courseFilter}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('planning.allCourses')}</SelectItem>
                      {Object.entries(courseOptions).map(([id, name]) => (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>
            </div>
          </Card>

          {/* Sessions list */}
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('planning.noSessions')}</p>
            ) : (
              filtered.map((s) => (
                <div
                  key={s.id}
                  onClick={() => handleClick(s)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md"
                >
                  <div className="flex w-14 shrink-0 flex-col items-center">
                    <span className="font-serif text-sm font-bold text-secondary">{s.time}</span>
                    <span className="text-[10px] text-muted-foreground">{s.date}</span>
                  </div>
                  <Separator orientation="vertical" className="h-10" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-sm font-medium text-secondary">{s.course}</span>
                    <Badge className={`w-fit border text-[10px] ${statusColors[s.status]}`}>
                      {t(`planning.status.${s.status}`)}
                    </Badge>
                  </div>
                  {s.players.length > 0 && (
                    <div className="flex -space-x-2">
                      {s.players.slice(0, 3).map((p) => (
                        <Avatar key={p.initials} size="sm" className="ring-2 ring-surface">
                          <AvatarFallback className="bg-primary/15 text-[10px] text-primary">{p.initials}</AvatarFallback>
                        </Avatar>
                      ))}
                      {s.players.length > 3 && (
                        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground ring-2 ring-surface">
                          +{s.players.length - 3}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Lazy loading sentinel */}
            <div ref={loadMoreRef} className="py-4">
              {isFetchingNextPage && (
                <p className="text-center text-sm text-muted-foreground">Chargement...</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <PlanningCalendar
          sessions={sessions}
          date={calendarDate}
          view={calendarView}
          onNavigate={setCalendarDate}
          onView={setCalendarView}
          onSelectEvent={handleClick}
          onSelectSlot={handleSelectSlot}
        />
      )}

      {/* Details dialog/drawer */}
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-secondary">
                {t('planning.details.title')}
              </DialogTitle>
            </DialogHeader>
            {detailsContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[85vh] bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                {t('planning.details.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6 max-h-[75vh]">{detailsContent}</div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Slot creation / blocking dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent className="sm:max-w-md bg-surface">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold text-secondary">
              Fermer les créneaux (Bloquer)
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            {pendingSlot && (
              <div className="rounded-lg border border-border p-3 flex flex-col gap-1 bg-muted/30">
                <span className="text-xs text-muted-foreground">Période sélectionnée :</span>
                <span className="font-serif text-sm font-semibold text-secondary">
                  {moment(pendingSlot.start).format('DD/MM/YYYY')} de {moment(pendingSlot.start).format('HH:mm')} à {moment(pendingSlot.end).format('HH:mm')}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Des créneaux fermés de 5 minutes seront créés pour bloquer toute réservation sur cette période.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-medium text-secondary">Parcours concerné</Label>
              <Select value={selectedCourseForSlot} onValueChange={(v) => setSelectedCourseForSlot(v ?? '')}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue placeholder="Sélectionner un parcours">
                    {courseOptions[selectedCourseForSlot] ?? selectedCourseForSlot ?? 'Sélectionner un parcours'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(courseOptions).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setSlotDialogOpen(false)}
              disabled={isClosingSlots}
            >
              Annuler
            </Button>
            <Button
              className="gap-2 bg-destructive text-white hover:bg-destructive/90"
              onClick={handleCloseSlots}
              disabled={isClosingSlots}
            >
              <Ban size={16} />
              {isClosingSlots ? 'Fermeture en cours...' : 'Fermer les créneaux'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}