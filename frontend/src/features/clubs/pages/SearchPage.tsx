
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import SearchBar from '../components/SearchBar';
import ClubCard from '../components/ClubCard';
import { useClubSearch, type ClubSearchCriteria } from '../hooks/useClubSearch';

const EMPTY_CRITERIA: ClubSearchCriteria = { city: '', clubName: '' };

export default function SearchPage() {
  const { t } = useTranslation('clubs');
  const [criteria, setCriteria] = useState<ClubSearchCriteria>(EMPTY_CRITERIA);

  const { data, isLoading, isError } = useClubSearch(criteria);
  const clubs = data ?? [];

  const hasSearch = criteria.city.trim() !== '' || criteria.clubName.trim() !== '';

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      <main>
        <section className="border-b border-border bg-surface mt-20">
          <div className="mx-auto max-w-7xl px-6">
            <SearchBar
              onSearch={(next) => setCriteria(next)}
              onReset={() => setCriteria(EMPTY_CRITERIA)}
            />
          </div>
        </section>

        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            {isLoading ? (
              <p className="py-8 text-center">
                Chargement des clubs...
              </p>
            ) : isError ? (
              <p className="py-8 text-center text-red-500">
                Impossible de charger les clubs.
              </p>
            ) : clubs.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <p className="text-sm">
                  {hasSearch
                    ? t('search.noResult', { criteria: [criteria.city, criteria.clubName].filter(Boolean).join(' · ') })
                    : 'Aucun club actif trouvé.'}
                </p>
                {hasSearch && (
                  <Button
                    variant="outline"
                    className="gap-2 border-primary text-secondary"
                    onClick={() => setCriteria(EMPTY_CRITERIA)}
                  >
                    {t('search.reset')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {clubs.map((club) => (
                  <ClubCard key={club.id} club={club} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
