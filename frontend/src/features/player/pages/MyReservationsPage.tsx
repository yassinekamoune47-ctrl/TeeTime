import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Calendar, Clock, Users, MapPin, Download, XCircle } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { toast } from 'sonner';
import { reservationApi } from '@/api/endpoints/reservation.api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { PlayerReservation, ReservationStatus } from '@/features/reservations/types';

interface Reservation {
  id: string;
  clubName: string;
  clubLogo: string;
  courseName: string;
  date: string;
  time: string;
  players: number;
  status: ReservationStatus;
  description: string;
}

const statusColors: Record<ReservationStatus, string> = {
  CONFIRMED: 'border-primary bg-primary/15 text-primary',
  ACCEPTED: 'border-primary bg-primary/15 text-primary',
  PENDING: 'border-secondary bg-secondary/15 text-secondary',
  COMPLETED: 'border-secondary bg-secondary/15 text-secondary',
  REJECTED: 'border-border bg-muted text-muted-foreground',
  CANCELLED: 'border-border bg-muted text-muted-foreground',
};

const statusLabels: Record<ReservationStatus, string> = {
  CONFIRMED: 'Confirmée',
  ACCEPTED: 'Acceptée',
  PENDING: 'En attente',
  COMPLETED: 'Terminée',
  REJECTED: 'Refusée',
  CANCELLED: 'Annulée',
};

export default function MyReservationsPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const focusId = params.get('reservation');
  const [search, setSearch] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReservations = useCallback(async (searchQuery: string = '', pageNum: number = 0) => {
    try {
      const response = await reservationApi.searchPlayerReservations({
        search: searchQuery,
        status: null,
        page: pageNum,
        size: 10,
      });

      const data = response.data.data as PlayerReservation[];
      
      const formattedReservations: Reservation[] = data.map((res) => {
        const startDate = new Date(res.startTime);
        return {
          id: res.reservationId,
          clubName: res.clubName,
          clubLogo: res.clubLogoURL || '/teetime-logo.png',
          courseName: res.courseName,
          date: startDate.toLocaleDateString('fr-FR'),
          time: startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          players: res.numberOfPlayers,
          status: res.status,
          description: `Réservation ${(statusLabels[res.status] ?? res.status).toLowerCase()} pour ${res.numberOfPlayers} joueur(s) sur le parcours ${res.courseName}.`,
        };
      });

      if (pageNum === 0) {
        setReservations(formattedReservations);
      } else {
        setReservations((prev) => [...prev, ...formattedReservations]);
      }

      setHasMore(formattedReservations.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search - wait 500ms after user stops typing (immediate on mount)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchReservations(search, 0);
    }, search ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [search, fetchReservations]);

  // A reservation notification links here with ?reservation=<id>, which opens
  // that reservation's details without a second fetch.
  const linkedReservation = focusId
    ? reservations.find((r) => r.id === focusId) ?? null
    : null;
  const openReservation = selectedReservation ?? linkedReservation;
  const detailsOpen = dialogOpen || Boolean(linkedReservation);

  const closeDetails = () => {
    setDialogOpen(false);
    setSelectedReservation(null);
    if (focusId) {
      params.delete('reservation');
      setParams(params, { replace: true });
    }
  };

  const handleReservationClick = (r: Reservation) => {
    setSelectedReservation(r);
    setDialogOpen(true);
  };

  const handleCancel = async () => {
    if (!openReservation) return;
    try {
      await reservationApi.cancel(openReservation.id);
      toast.success('Réservation annulée');
      closeDetails();
      await fetchReservations(search, 0);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Échec de l'annulation de la réservation"));
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      fetchReservations(search, page + 1);
    }
  };

  const reservationItem = (r: Reservation) => (
    <div
      key={r.id}
      onClick={() => handleReservationClick(r)}
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
    >
      <img src={r.clubLogo} alt={r.clubName} className="h-12 w-12 shrink-0 rounded-full border-2 border-primary object-cover" />
      <div className="flex flex-1 flex-col gap-1">
        <span className="font-serif text-sm font-bold text-secondary">{r.clubName}</span>
        <span className="text-xs text-muted-foreground">{r.courseName}</span>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Calendar size={12} className="text-primary" />{r.date}</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-primary" />{r.time}</span>
          <span className="flex items-center gap-1"><Users size={12} className="text-primary" />{r.players}</span>
        </div>
      </div>
    </div>
  );

  const dialogContent = openReservation && (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <img src={openReservation.clubLogo} alt={openReservation.clubName} className="h-16 w-16 rounded-full border-2 border-primary object-cover" />
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-xl font-bold text-secondary">{openReservation.clubName}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            <span>{openReservation.courseName}</span>
          </div>
        </div>
      </div>

      <Badge className={`w-fit border ${statusColors[openReservation.status]}`}>
        {statusLabels[openReservation.status] ?? openReservation.status}
      </Badge>

      <p className="text-sm text-muted-foreground">{openReservation.description}</p>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('reservations.dialog.date')}</span>
          <span className="text-sm font-semibold">{openReservation.date}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Clock size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('reservations.dialog.time')}</span>
          <span className="text-sm font-semibold">{openReservation.time}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Users size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('reservations.dialog.players')}</span>
          <span className="text-sm font-semibold">{openReservation.players}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className="text-sm font-semibold">{statusLabels[openReservation.status] ?? openReservation.status}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" className="w-full gap-2 border-primary text-secondary" onClick={() => toast.success('Reçu téléchargé')}>
          <Download size={16} />
          {t('reservations.dialog.download')}
        </Button>
        {(openReservation.status === 'CONFIRMED' ||
          openReservation.status === 'ACCEPTED' ||
          openReservation.status === 'PENDING') && (
          <Button variant="destructive" className="w-full gap-2" onClick={handleCancel}>
            <XCircle size={16} />
            {t('reservations.dialog.cancel')}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-secondary">{t('reservations.title')}</h1>

      {/* Search bar */}
      <div className="flex flex-row justify-between gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('reservations.clubNamePlaceholder')}
            className="pl-10 border-primary placeholder:text-secondary"
          />
        </div>
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2 border-primary text-secondary" 
          onClick={() => navigate('/reservations')}
        >
          <span className="hidden md:inline">Créer une reservation</span>
          <span className="md:hidden">Créer une reservation</span>
        </Button>
      </div>

      {/* List */}
      {loading && reservations.length === 0 ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">{t('common.loading') || 'Chargement...'}</p>
        </div>
      ) : reservations.length === 0 ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Aucune réservation trouvée</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {reservations.map(reservationItem)}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={loadMore} 
                disabled={loading}
                className="border-primary text-secondary"
              >
                {loading ? (t('common.loading') || 'Chargement...') : (t('common.loadMore') || 'Charger plus')}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Details dialog */}
      {isDesktop ? (
        <Dialog open={detailsOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDetails())}>
          <DialogContent className="sm:max-w-md bg-surface">
            {dialogContent}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={detailsOpen} onOpenChange={(open) => (open ? setDialogOpen(true) : closeDetails())}>
          <DrawerContent className="max-h-[85vh] bg-surface">
            <div className="overflow-y-auto p-5">
              {dialogContent}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}