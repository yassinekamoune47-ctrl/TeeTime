import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TournamentSearchBar from '../components/TournamentSearchBar';
import TournamentCard from '../components/TournamentCard';
import TournamentDialog from '../components/TournamentDialog';
import type { Tournament, TournamentFilterValues } from '../types';
import { tournamentApi, type TournamentResponse } from '@/api/endpoints/tournament.api';
import { resolveFileUrl } from '@/lib/fileUrl';

/** Maps a backend TournamentResponse to the frontend Tournament shape */
function mapTournament(t: TournamentResponse): Tournament {
  let date = t.date ?? '';
  // Format ISO date (yyyy-MM-dd) as dd/MM/yyyy
  const parts = typeof date === 'string' ? date.split('-') : [];
  if (parts.length === 3) date = `${parts[2]}/${parts[1]}/${parts[0]}`;
  return {
    id: t.id,
    name: t.name,
    description: t.description,
    date,
    location: t.location,
    clubName: t.clubName,
    status: t.status,
    image: resolveFileUrl(t.imageUrl) || '/section1.png',
    entryFee: t.entryFee,
    maxParticipants: t.maxParticipants,
  };
}

export default function TournamentsPage() {
  const { t } = useTranslation('tournaments');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  // Raw search inputs (updated immediately as the user types)
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<TournamentFilterValues>({ date: '', location: '', status: '' });

  // Values actually sent to the API — debounced by 500ms like the other search requests
  const [query, setQuery] = useState({ q: '', date: '', location: '', status: '' });

  useEffect(() => {
    const id = setTimeout(() => {
      setQuery({
        q: searchInput.trim(),
        date: filters.date,
        location: filters.location.trim(),
        status: filters.status,
      });
    }, 500);
    return () => clearTimeout(id);
  }, [searchInput, filters]);

  useEffect(() => {
    let cancelled = false;
    tournamentApi
      .publicSearch({
        q: query.q || undefined,
        location: query.location || undefined,
        date: query.date || undefined,
        status: query.status || undefined,
        page: 0,
        size: 24,
      })
      .then((data) => {
        if (!cancelled) setTournaments((data ?? []).map(mapTournament));
      })
      .catch(() => {
        if (!cancelled) setTournaments([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleTournamentClick = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      <main>
        {/* Search bar */}
        <section className="border-b border-border bg-surface mt-20">
          <div className="mx-auto max-w-7xl px-6">
            <TournamentSearchBar
              name={searchInput}
              onNameChange={(value) => {
                setLoading(true);
                setSearchInput(value);
              }}
              filters={filters}
              onFiltersChange={(value) => {
                setLoading(true);
                setFilters(value);
              }}
            />
          </div>
        </section>

        {/* Tournament list */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
              {loading ? (
                <p className="col-span-full text-center text-sm text-muted-foreground">{t('page.loading')}</p>
              ) : tournaments.length === 0 ? (
                <p className="col-span-full text-center text-sm text-muted-foreground">{t('page.noResults')}</p>
              ) : (
                tournaments.map((tournament) => (
                  <TournamentCard
                    key={tournament.id}
                    tournament={tournament}
                    onClick={() => handleTournamentClick(tournament)}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <TournamentDialog
        tournament={selectedTournament}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedTournament(null);
        }}
      />
    </div>
  );
}