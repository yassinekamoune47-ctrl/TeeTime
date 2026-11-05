import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Flag, Building2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { membershipApi } from '@/api/endpoints/membership.api';
import type { PlayerClubMembership } from '@/features/memberships/types';

interface ClubMembership {
  id: string;
  name: string;
  logo: string;
  location: string;
  membership: string;
  description: string;
  startDate: string;
  endDate: string;
  coursesCount: number;
}

export default function MyClubsPage() {  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ClubMembership | null>(null);
  const [open, setOpen] = useState(false);
  const [clubs, setClubs] = useState<ClubMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchClubs = useCallback(async (searchQuery: string = '', pageNum: number = 0) => {
    try {
      const response = await membershipApi.searchPlayerClubs({
        search: searchQuery,
        page: pageNum,
        size: 10,
      });

      const data = response.data.data as PlayerClubMembership[];
      
      const formattedClubs: ClubMembership[] = data.map((club) => ({
        id: club.clubId,
        name: club.clubName,
        logo: club.clubLogoURL || '/teetime-logo.png',
        location: club.clubCity,
        membership: club.membershipTitle,
        description: club.membershipDescription,
        startDate: new Date(club.membershipStartDate).toLocaleDateString('fr-FR'),
        endDate: new Date(club.membershipEndDate).toLocaleDateString('fr-FR'),
        coursesCount: club.coursesCount,
      }));

      if (pageNum === 0) {
        setClubs(formattedClubs);
      } else {
        setClubs((prev) => [...prev, ...formattedClubs]);
      }

      setHasMore(formattedClubs.length === 10);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search - wait 500ms after user stops typing (immediate on mount)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchClubs(search, 0);
    }, search ? 500 : 0);

    return () => clearTimeout(timeoutId);
  }, [search, fetchClubs]);

  const handleSearch = (value: string) => {
    setLoading(true);
    setSearch(value);
  };

  const handleClick = (club: ClubMembership) => {
    setSelected(club);
    setOpen(true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      fetchClubs(search, page + 1);
    }
  };

  const dialogContent = selected && (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <img src={selected.logo} alt={selected.name} className="h-16 w-16 rounded-full border-2 border-primary object-cover" />
        <div className="flex flex-col gap-1">
          <h2 className="font-serif text-xl font-bold text-secondary">{selected.name}</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            <span>{selected.location}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">{selected.description}</p>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('clubs.dialog.startDate')}</span>
          <span className="text-sm font-semibold">{selected.startDate}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('clubs.dialog.endDate')}</span>
          <span className="text-sm font-semibold">{selected.endDate}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Flag size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('clubs.dialog.courses')}</span>
          <span className="text-sm font-semibold">{selected.coursesCount}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Building2 size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('clubs.dialog.membership')}</span>
          <span className="text-sm font-semibold">{selected.membership}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-secondary">{t('clubs.myClubs')}</h1>

      <div className="flex flex-row justify-between gap-2">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <Input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('clubs.searchPlaceholder')}
            className="pl-10 border-primary placeholder:text-secondary"
          />
        </div>
        <Button 
          variant="outline" 
          size="lg" 
          className="gap-2 border-primary text-secondary" 
          onClick={() => navigate('/memberships')}
        >
          <span>{t('clubs.createSubscription')}</span>
        </Button>
      </div>

      {loading && clubs.length === 0 ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">{t('common.loading') || 'Loading...'}</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">{t('clubs.empty')}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {clubs.map((club) => (
              <div
                key={club.id}
                onClick={() => handleClick(club)}
                className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
              >
                <img src={club.logo} alt={club.name} className="h-12 w-12 shrink-0 rounded-full border-2 border-primary object-cover" />
                <div className="flex flex-1 flex-col gap-1">
                  <span className="font-serif text-sm font-bold text-secondary">{club.name}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={12} className="text-primary" />
                    <span>{club.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={loadMore} 
                disabled={loading}
                className="border-primary text-secondary"
              >
                {loading ? (t('common.loading') || 'Loading...') : (t('common.loadMore') || 'Load More')}
              </Button>
            </div>
          )}
        </>
      )}

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-surface">{dialogContent}</DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[85vh] bg-surface">
            <div className="overflow-y-auto p-5">{dialogContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}