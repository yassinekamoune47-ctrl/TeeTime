import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Plus, Calendar, MapPin, Users, Archive, Trash2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import TournamentFormDialog from '../components/TournamentFormDialog';
import {
  type TournamentFormImage,
  type TournamentFormValues,
} from '../lib/tournamentForm';
import { tournamentApi, type TournamentResponse, type TournamentStatus } from '@/api/endpoints/tournament.api';
import { TOURNAMENT_STATUSES, TOURNAMENT_STATUS_BADGES_TINTED, TOURNAMENT_STATUS_KEYS } from '@/lib/constants';
import { resolveFileUrl } from '@/lib/fileUrl';
import { getApiErrorMessage } from '@/lib/apiError';

type ManagedTournament = TournamentResponse & {
  image: string;
  dateLabel: string;
};

function toManaged(tournament: TournamentResponse): ManagedTournament {
  return {
    ...tournament,
    image: resolveFileUrl(tournament.imageUrl) || '/section1.png',
    dateLabel: tournament.date ? new Date(tournament.date).toLocaleDateString('fr-MA') : '',
  };
}

function toFormValues(tournament: ManagedTournament): TournamentFormValues {
  return {
    name: tournament.name ?? '',
    description: tournament.description ?? '',
    date: tournament.date ? new Date(tournament.date).toISOString().split('T')[0] : '',
    location: tournament.location ?? '',
    entryFee: String(tournament.entryFee ?? ''),
    maxParticipants: String(tournament.maxParticipants ?? ''),
  };
}

function buildFormData(
  values: TournamentFormValues,
  image: TournamentFormImage,
  extra: Record<string, string> = {},
): FormData {
  const fd = new FormData();
  fd.append('name', values.name);
  fd.append('description', values.description);
  fd.append('date', values.date);
  fd.append('location', values.location);
  fd.append('entryFee', values.entryFee);
  fd.append('maxParticipants', values.maxParticipants);
  if (image.imageUrl) fd.append('imageUrl', image.imageUrl);
  if (image.imageFile) fd.append('image', image.imageFile);
  Object.entries(extra).forEach(([key, value]) => fd.append(key, value));
  return fd;
}

type PendingConfirmation = { kind: 'archive' | 'delete'; tournament: ManagedTournament };

export default function ManageTournamentsPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<TournamentStatus | null>(null);
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(search), 500);
    return () => clearTimeout(id);
  }, [search]);

  const {
    data: fetchedTournaments = [],
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: ['tournaments', 'manage', debounced, statusFilter, locationFilter],
    queryFn: () =>
      tournamentApi.search({
        q: debounced || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        location: locationFilter !== 'all' ? locationFilter : undefined,
        page: 0,
        size: 50,
      }),
  });

  const tournaments = useMemo(() => fetchedTournaments.map(toManaged), [fetchedTournaments]);
  const locations = useMemo(
    () => ['all', ...Array.from(new Set(tournaments.map((tour) => tour.location).filter(Boolean)))],
    [tournaments],
  );

  const selected = tournaments.find((tour) => tour.id === selectedId) ?? null;
  const editing = tournaments.find((tour) => tour.id === editingId) ?? null;

  const openDetails = (tournament: ManagedTournament) => {
    setSelectedId(tournament.id);
    setPendingStatus(null);
    setDetailsOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
  };

  const handleCreate = async (values: TournamentFormValues, image: TournamentFormImage) => {
    setIsSaving(true);
    try {
      await tournamentApi.create(buildFormData(values, image));
      toast.success(t('manageTournaments.details.created'));
      closeForm();
      void refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la création'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async (values: TournamentFormValues, image: TournamentFormImage) => {
    if (!editingId) return;
    setIsSaving(true);
    try {
      await tournamentApi.update(buildFormData(values, image, { id: editingId }));
      toast.success(t('manageTournaments.details.updated'));
      closeForm();
      void refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la mise à jour'));
    } finally {
      setIsSaving(false);
    }
  };

  const changeStatus = async (id: string, status: TournamentStatus) => {
    setIsSaving(true);
    try {
      await tournamentApi.update({ id, status });
      toast.success(t('manageTournaments.details.statusChanged'));
      setPendingStatus(null);
      void refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors du changement de statut'));
    } finally {
      setIsSaving(false);
    }
  };

  const runConfirmation = async () => {
    if (!confirmation) return;
    const { kind, tournament } = confirmation;
    setIsSaving(true);
    try {
      if (kind === 'archive') {
        await tournamentApi.update({ id: tournament.id, status: 'ARCHIVE' });
        toast.success(t('manageTournaments.confirm.archived'));
      } else {
        await tournamentApi.delete(tournament.id);
        toast.success(t('manageTournaments.confirm.deleted'));
      }
      setConfirmation(null);
      setDetailsOpen(false);
      setSelectedId(null);
      void refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Erreur lors de la mise à jour'));
    } finally {
      setIsSaving(false);
    }
  };

  const canArchive = selected !== null && selected.nextStatuses.includes('ARCHIVE');

  const detailsContent = selected && (
    <div className="flex flex-col gap-4">
      <img src={selected.image} alt={selected.name} className="h-44 w-full rounded-lg object-cover" />

      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-xl font-bold text-secondary">{selected.name}</h2>
        <Badge className={`border ${TOURNAMENT_STATUS_BADGES_TINTED[selected.status]}`}>
          {t(`manageTournaments.status.${TOURNAMENT_STATUS_KEYS[selected.status]}`)}
        </Badge>
      </div>

      {selected.description && <p className="text-sm text-muted-foreground">{selected.description}</p>}

      <Separator />

      <div className="grid grid-cols-2 gap-3">
        <Detail label={t('manageTournaments.details.date')} value={selected.dateLabel} />
        <Detail label={t('manageTournaments.details.location')} value={selected.location} />
        {selected.clubName && <Detail label={t('manageTournaments.details.club')} value={selected.clubName} />}
        <Detail label={t('manageTournaments.details.entryFee')} value={`${selected.entryFee} MAD`} />
        <Detail label={t('manageTournaments.details.maxParticipants')} value={String(selected.maxParticipants)} />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/10 p-3">
        <Label className="text-xs text-muted-foreground">{t('manageTournaments.details.changeStatus')}</Label>
        {selected.nextStatuses.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('manageTournaments.details.noStatusChange')}</p>
        ) : (
          <>
            <Select
              value={pendingStatus}
              items={selected.nextStatuses.map((status) => ({ value: status, label: t(`manageTournaments.status.${TOURNAMENT_STATUS_KEYS[status]}`) }))}
              onValueChange={(value) => setPendingStatus((value ?? null) as TournamentStatus | null)}
            >
              <SelectTrigger className="w-full border-border">
                <SelectValue placeholder={t('manageTournaments.details.statusLabel')} />
              </SelectTrigger>
              <SelectContent>
                {selected.nextStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {t(`manageTournaments.status.${TOURNAMENT_STATUS_KEYS[status]}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{t('manageTournaments.details.statusHint')}</p>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!pendingStatus || isSaving}
              onClick={() => pendingStatus && void changeStatus(selected.id, pendingStatus)}
            >
              {t('manageTournaments.details.changeStatus')}
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          className="gap-2 border-border"
          onClick={() => {
            setEditingId(selected.id);
            setFormOpen(true);
          }}
        >
          <Pencil size={16} />
          {t('manageTournaments.details.edit')}
        </Button>
        {canArchive && (
          <Button variant="outline" className="gap-2 border-border" onClick={() => setConfirmation({ kind: 'archive', tournament: selected })}>
            <Archive size={16} />
            {t('manageTournaments.details.archive')}
          </Button>
        )}
        <Button variant="destructive" className="gap-2" onClick={() => setConfirmation({ kind: 'delete', tournament: selected })}>
          <Trash2 size={16} />
          {t('manageTournaments.details.delete')}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-secondary">{t('manageTournaments.title')}</h1>

      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('manageTournaments.searchPlaceholder')}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus size={16} />
              {t('manageTournaments.add')}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">{t('manageTournaments.filterStatus')}</Label>
              <Select
                value={statusFilter}
                items={[{ value: 'all', label: t('manageTournaments.all') }, ...TOURNAMENT_STATUSES.map((status) => ({ value: status, label: t(`manageTournaments.status.${TOURNAMENT_STATUS_KEYS[status]}`) }))]}
                onValueChange={(value) => setStatusFilter(value ?? 'all')}
              >
                <SelectTrigger className="w-full border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('manageTournaments.all')}</SelectItem>
                  {TOURNAMENT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {t(`manageTournaments.status.${TOURNAMENT_STATUS_KEYS[status]}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">{t('manageTournaments.filterLocation')}</Label>
              <Select
                value={locationFilter}
                items={locations.map((location) => ({ value: location, label: location === 'all' ? t('manageTournaments.allLocations') : location }))}
                onValueChange={(value) => setLocationFilter(value ?? 'all')}
              >
                <SelectTrigger className="w-full border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location === 'all' ? t('manageTournaments.allLocations') : location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t('manageTournaments.loading')}</p>
      ) : tournaments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('manageTournaments.empty')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tournaments.map((tournament) => (
            <Card
              key={tournament.id}
              onClick={() => openDetails(tournament)}
              className="cursor-pointer overflow-hidden p-0"
            >
              <div className="relative">
                <img src={tournament.image} alt={tournament.name} className="h-48 w-full object-cover" />
                <Badge className={`absolute right-3 top-3 border ${TOURNAMENT_STATUS_BADGES_TINTED[tournament.status]}`}>
                  {t(`manageTournaments.status.${TOURNAMENT_STATUS_KEYS[tournament.status]}`)}
                </Badge>
              </div>
              <div className="p-4">
                <h3 className="font-serif text-lg font-bold text-secondary">{tournament.name}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin size={12} />
                  {tournament.location}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar size={12} />
                  {tournament.dateLabel}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users size={12} />
                  {t('manageTournaments.capacity', { max: tournament.maxParticipants })}
                </div>
                <div className="mt-auto font-serif text-lg font-bold text-primary">{tournament.entryFee} MAD</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isDesktop ? (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-surface sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-secondary">
                {t('manageTournaments.details.title')}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">{detailsContent}</div>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DrawerContent className="bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                {t('manageTournaments.details.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto px-4 pb-6">{detailsContent}</div>
          </DrawerContent>
        </Drawer>
      )}

      {formOpen && (
        <TournamentFormDialog
          open={formOpen}
          onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())}
          onSubmit={editingId ? handleUpdate : handleCreate}
          initialValues={editing ? toFormValues(editing) : undefined}
          initialImageUrl={editing?.image}
        />
      )}

      {confirmation && (
        <Dialog open onOpenChange={(open) => !open && setConfirmation(null)}>
          <DialogContent className="bg-surface sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg text-secondary">
                {t(confirmation.kind === 'archive' ? 'manageTournaments.confirm.archiveTitle' : 'manageTournaments.confirm.deleteTitle')}
              </DialogTitle>
              <DialogDescription>
                {t(
                  confirmation.kind === 'archive'
                    ? 'manageTournaments.confirm.archiveDescription'
                    : 'manageTournaments.confirm.deleteDescription',
                  { name: confirmation.tournament.name },
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmation(null)}>
                {t('manageTournaments.confirm.cancel')}
              </Button>
              <Button variant="destructive" onClick={() => void runConfirmation()} disabled={isSaving}>
                {t(confirmation.kind === 'archive' ? 'manageTournaments.confirm.archiveConfirm' : 'manageTournaments.confirm.deleteConfirm')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm text-secondary">{value}</span>
    </div>
  );
}
