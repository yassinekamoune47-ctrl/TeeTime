import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MembershipSearchBar from '../components/MembershipSearchBar';
import ClubMembershipCard from '../components/ClubMembershipCard';
import MembershipDialog from '../components/MembershipDialog';
import type { ClubMembershipGroup, Membership } from '../types';
import { useSearchAllMemberships } from '../hooks/useSearchAllMemberships';
import { useMembershipClubs } from '../hooks/useMembershipClubs';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

export default function MembershipsPage() {
  const { t } = useTranslation('memberships');
  const [selectedMembership, setSelectedMembership] = useState<Membership | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expandedClubId, setExpandedClubId] = useState<string | null>(null);
  const [hasUserToggled, setHasUserToggled] = useState(false);

  const [filters, setFilters] = useState<{
    title: string;
    clubName: string;
    price: number | null;
  }>({
    title: '',
    clubName: '',
    price: null,
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchAllMemberships({
    title: filters.title,
    clubName: filters.clubName,
    price: filters.price,
  });

  const { data: allClubs = [] } = useMembershipClubs();

  const loadMoreRef = useInfiniteScroll(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, hasNextPage);

  const memberships = useMemo(
    () => data?.pages.flatMap((page) => page) ?? [],
    [data],
  );

  const matchedGroups = useMemo<ClubMembershipGroup[]>(() => {
    const groups = new Map<string, ClubMembershipGroup>();
    const clubMeta = new Map(allClubs.map((club) => [club.id, club]));

    memberships.forEach((membership) => {
      const name = membership.club?.name;
      if (!name) return;

      const id = membership.club?.id ?? name;
      const existing = groups.get(id);
      if (existing) {
        existing.memberships.push(membership);
        return;
      }
      const meta = clubMeta.get(id);
      groups.set(id, {
        club: {
          id,
          name,
          city: membership.club?.city ?? meta?.city ?? '',
          logoURL: meta?.logoURL ?? '',
          coverURL: meta?.coverURL ?? '',
          phone: meta?.phone ?? '',
        },
        memberships: [membership],
      });
    });

    return [...groups.values()];
  }, [allClubs, memberships]);

  const hasFilters = Boolean(filters.title || filters.clubName || filters.price);

  const cards = useMemo<ClubMembershipGroup[]>(() => {
    if (hasFilters || allClubs.length === 0) return matchedGroups;

    const plansByClub = new Map(matchedGroups.map((group) => [group.club.id, group.memberships]));

    return allClubs
      .map((club) => ({
        club: {
          id: club.id,
          name: club.name,
          city: club.city,
          logoURL: club.logoURL,
          coverURL: club.coverURL,
          phone: club.phone,
        },
        memberships: plansByClub.get(club.id) ?? [],
      }))
      .sort(
        (a, b) =>
          b.memberships.length - a.memberships.length ||
          a.club.name.localeCompare(b.club.name),
      );
  }, [allClubs, hasFilters, matchedGroups]);

  const autoExpandedId = useMemo(
    () => cards.find((card) => card.memberships.length > 0)?.club.id ?? null,
    [cards],
  );
  const activeExpandedId = hasUserToggled ? expandedClubId : autoExpandedId;

  const handleMembershipSelect = (membership: Membership) => {
    setSelectedMembership(membership);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      <main>
        {/* Search bar */}
        <section className="border-b border-border bg-surface mt-20">
          <div className="mx-auto max-w-5xl px-6">
            <MembershipSearchBar onFiltersChange={setFilters} />
          </div>
        </section>

        {/* Club cards with their own membership offers */}
        <section className="py-8">
          <div className="mx-auto w-full max-w-5xl px-6">
            {isLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('page.loading')}</p>
            ) : isError ? (
              <p className="py-8 text-center text-sm text-red-500">{t('page.error')}</p>
            ) : memberships.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {filters.price ? t('page.emptyPrice') : t('page.empty')}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {cards.map((card) => (
                  <ClubMembershipCard
                    key={card.club.id}
                    club={card.club}
                    memberships={card.memberships}
                    expanded={activeExpandedId === card.club.id}
                    onToggle={() => {
                      setHasUserToggled(true);
                      setExpandedClubId(activeExpandedId === card.club.id ? null : card.club.id);
                    }}
                    onSelect={handleMembershipSelect}
                  />
                ))}
              </div>
            )}

            {/* Infinite scroll loader trigger */}
            <div ref={loadMoreRef} className="py-4 text-center">
              {isFetchingNextPage && (
                <p className="text-sm text-muted-foreground">{t('page.loadingMore')}</p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <MembershipDialog
        membership={selectedMembership}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedMembership(null);
        }}
      />
    </div>
  );
}
