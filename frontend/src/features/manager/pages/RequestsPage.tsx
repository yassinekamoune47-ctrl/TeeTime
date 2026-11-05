import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Clock, Calendar, Users, Info } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useManagerReservations } from '../hooks/useReservationRequests';

type RequestStatus = 'pending' | 'approved' | 'rejected';

interface BookingRequest {
  id: string;
  userFullName: string;
  userInitials: string;
  courseName: string;
  playersCount: number;
  time: string;
  date: string;
  requestedAt: string;
  status: RequestStatus;
  price: number | null;
  contact: string;
}

const statusColors: Record<RequestStatus, string> = {
  pending: 'border-primary bg-primary/15 text-primary',
  approved: 'border-secondary bg-secondary/15 text-secondary',
  rejected: 'border-border bg-muted text-muted-foreground',
};

// UI wording → backend ERStatus values (backend expects PENDING | ACCEPTED | REJECTED)
const STATUS_TO_API: Record<RequestStatus, 'PENDING' | 'ACCEPTED' | 'REJECTED'> = {
  pending: 'PENDING',
  approved: 'ACCEPTED',
  rejected: 'REJECTED',
};

const formatDate = (iso: string) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : '');
const formatDateTime = (iso: string) => (iso ? `${formatDate(iso)} ${iso.slice(11, 16)}` : '');
const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function RequestsPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Filters
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Debounce search input (350ms delay)
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useManagerReservations({
      name: search || undefined,
      status: statusFilter === 'all' ? undefined : STATUS_TO_API[statusFilter as RequestStatus],
      courseId: courseFilter === 'all' ? undefined : courseFilter,
      date: dateFilter || undefined,
    });

  // Infinite scroll sentinel — lazy loads the next page when scrolled near the bottom
  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, hasNextPage);

  const [selected, setSelected] = useState<BookingRequest | null>(null);
  const [open, setOpen] = useState(false);

  // Flatten paginated results
  const fetchedRequests = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  // Map to display model
  const requests: BookingRequest[] = useMemo(
    () =>
      fetchedRequests.map((r) => {
        const status = r.status.toLowerCase();
        return {
          id: r.id,
          userFullName: r.playerName,
          userInitials: initialsOf(r.playerName),
          courseName: r.courseName,
          playersCount: r.numberOfPlayers,
          time: r.startTime.slice(11, 16),
          date: formatDate(r.startTime),
          requestedAt: formatDateTime(r.requestedAt),
          status: status === 'accepted' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
          price: r.greenFee === null ? null : Number(r.greenFee),
          contact: r.playerPhone || '—',
        } as BookingRequest;
      }),
    [fetchedRequests],
  );

  // Course options derived from the loaded requests
  const courseOptions = useMemo(() => {
    const options: Record<string, string> = {};
    fetchedRequests.forEach((r) => {
      options[r.courseId] = r.courseName;
    });
    return options;
  }, [fetchedRequests]);

  const handleClick = (req: BookingRequest) => {
    setSelected(req);
    setOpen(true);
  };

  const detailsContent = selected && (
    <div className="flex flex-col gap-4">
      {/* Player header */}
      <div className="flex items-center gap-3">
        <Avatar size="lg" className="border-2 border-primary">
          <AvatarFallback className="bg-primary/15 font-bold text-primary">{selected.userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="font-serif text-lg font-bold text-secondary">{selected.userFullName}</span>
          <Badge className={`w-fit border text-xs ${statusColors[selected.status]}`}>
            {t(`requests.status.${selected.status}`)}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('requests.details.course')}</span>
          <span className="text-sm font-semibold text-secondary">{selected.courseName}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('requests.details.date')}</span>
          <span className="text-sm font-semibold text-secondary">{selected.date}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('requests.details.time')}</span>
          <span className="text-sm font-semibold text-secondary">{selected.time}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('requests.details.players')}</span>
          <span className="text-sm font-semibold text-secondary">{selected.playersCount}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('requests.details.price')}</span>
          <span className="text-sm font-semibold text-primary">
            {selected.price !== null ? `${selected.price} MAD` : t('requests.details.priceOnRequest')}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('requests.details.contact')}</span>
          <span className="text-sm font-semibold text-secondary">{selected.contact}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock size={12} className="text-primary" />
        <span>{t('requests.details.requestedAt')} {selected.requestedAt}</span>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" />
        <span>{t('requests.details.adminDecides')}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Filter bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Search — takes remaining width */}
          <div className="relative lg:flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('requests.searchPlaceholder')}
              className="pl-10 border-primary placeholder:text-secondary"
            />
          </div>

          {/* Status / Course / Date — same line as search on desktop */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1 sm:w-40">
              <Label className="text-xs text-muted-foreground">{t('requests.filterStatus')}</Label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue>
                    {statusFilter === 'all' ? t('requests.all') : t(`requests.status.${statusFilter}`)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('requests.all')}</SelectItem>
                  <SelectItem value="pending">{t('requests.status.pending')}</SelectItem>
                  <SelectItem value="approved">{t('requests.status.approved')}</SelectItem>
                  <SelectItem value="rejected">{t('requests.status.rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 sm:w-52">
              <Label className="text-xs text-muted-foreground">{t('requests.filterCourse')}</Label>
              <Select value={courseFilter} onValueChange={(v) => setCourseFilter(v ?? 'all')}>
                <SelectTrigger size="sm" className="w-full border-border">
                  {/* Base UI's SelectValue renders the raw value (the course id),
                      so we render the course name explicitly */}
                  <SelectValue>
                    {courseFilter === 'all'
                      ? t('requests.allCourses')
                      : courseOptions[courseFilter] ?? courseFilter}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('requests.allCourses')}</SelectItem>
                  {Object.entries(courseOptions).map(([id, name]) => (
                    <SelectItem key={id} value={id}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1 sm:w-40">
              <Label className="text-xs text-muted-foreground">{t('requests.filterDate')}</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border-border"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Requests list */}
      <div className="flex flex-col gap-2">
        {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
        ) : requests.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('requests.empty')}</p>
        ) : (
          requests.map((req) => (
            <div
              key={req.id}
              onClick={() => handleClick(req)}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md"
            >
              <Avatar size="lg" className="border border-border">
                <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{req.userInitials}</AvatarFallback>
              </Avatar>
              <Separator orientation="vertical" className="h-12" />
              <div className="flex flex-1 flex-col gap-1">
                <span className="font-medium text-secondary">{req.userFullName}</span>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-primary" />
                    {req.date} {t('requests.item.at')} {req.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} className="text-primary" />
                    {req.playersCount} {t('requests.item.players')}
                  </span>
                  <span>{req.courseName}</span>
                </div>
              </div>
              <Badge className={`shrink-0 border text-xs ${statusColors[req.status]}`}>
                {t(`requests.status.${req.status}`)}
              </Badge>
            </div>
          ))
        )}
      </div>

      {/* Lazy loading sentinel + indicator */}
      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
          <p className="text-center text-sm text-muted-foreground">Chargement...</p>
        )}
        {!hasNextPage && requests.length > 0 && !isLoading && (
          <p className="text-center text-xs text-muted-foreground">{t('requests.endOfList')}</p>
        )}
      </div>

      {/* Details dialog/drawer */}
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-secondary">
                {t('requests.details.title')}
              </DialogTitle>
            </DialogHeader>
            {detailsContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[90vh] bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                {t('requests.details.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-6 max-h-[65vh]">{detailsContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}