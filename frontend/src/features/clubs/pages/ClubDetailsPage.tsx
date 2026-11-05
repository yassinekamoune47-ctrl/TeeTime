import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Flag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CourseCard from '../../courses/components/CourseCard.tsx';
import CourseDialog from '../../courses/components/CourseDialog.tsx';
import type { Club } from '../types';
import { ECStatus } from '../types';
import type { Course } from '@/features/courses/types.ts';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FilterDialog, { type FilterValues } from '../components/FilterDialog';
import { api } from '@/api/apiConfig';

// Mock data (shapes match the real Club/Course API types) until the
// club-details API is wired in.
const course = (
  id: string,
  name: string,
  description: string,
  holeCount: number,
  greenFee: number | null,
  image: string,
  extra: Partial<Course> = {},
): Course => ({
  id,
  name,
  description,
  holeCount,
  greenFee,
  status: ECStatus.ACTIVE,
  createdAt: '2026-07-15T00:00:00Z',
  imagesUrls: [image],
  ...extra,
});

const club = (
  id: string,
  name: string,
  city: string,
  description: string,
  coverURL: string,
  courses: Course[],
): Club => ({
  id,
  name,
  description,
  city,
  address: city,
  phone: '',
  email: '',
  logoURL: '/teetime-logo.png',
  coverURL,
  status: ECStatus.ACTIVE,
  ownerId: null,
  ownerName: null,
  memberCount: 0,
  courseCount: courses.length,
  createdAt: '2026-07-15T00:00:00Z',
  courses,
});

const mockClubs: Club[] = [
  club('1', 'Royal Golf Dar Es Salam', 'Rabat', 'Un parcours royal historique au cœur de la forêt de Souissi.', '/royal-golf-rabat-cover.jpg', [
    course('1-1', 'Parcours Rouge', 'Le parcours signature 18 trous du Royal Golf Dar Es Salam.', 18, 1200, '/golf-courses/royal-dar-es-salam-rouge.webp'),
    course('1-2', 'Parcours Bleu', 'Le deuxième parcours 18 trous, plus court et technique.', 18, 850, '/golf-courses/royal-dar-es-salam-bleu.webp'),
    course('1-3', 'Parcours Vert', 'Un parcours 9 trous compact pour une partie rapide.', 9, 300, '/golf-courses/royal-dar-es-salam-vert.webp'),
  ]),
  club('2', 'Royal Golf de Marrakech', 'Marrakech', 'Un club légendaire au cœur de la palmeraie, fondé en 1920.', '/club 1.png', [
    course('2-1', 'Ancien Parcours', 'Le parcours historique 18 trous du club.', 18, 1200, '/golf-courses/royal-marrakech-ancien-parcours.webp'),
    course('2-2', 'Parcours Menara', 'Le parcours 9 trous, moderne et technique.', 9, 700, '/golf-courses/royal-marrakech-menara.webp'),
  ]),
  club('3', 'Royal Golf Anfa Mohammedia', 'Casablanca', "Un club urbain avec une vue imprenable sur l'océan Atlantique.", '/section2.png', [
    course('3-1', 'Parcours Anfa', 'Le parcours 9 trous du site d’Anfa.', 9, 400, '/golf-courses/rgam-anfa.webp', { greenFeeWeekend: 500 }),
    course('3-2', 'Parcours Mohammedia', 'Le parcours 18 trous du site de Mohammedia.', 18, 600, '/golf-courses/rgam-mohammedia.webp', { greenFeeWeekend: 700 }),
  ]),
  club('4', 'Golf du Palais Royal', 'Agadir', 'Un club privé à Agadir ; les green fees ne sont pas publiés.', '/club2.png', [
    course('4-1', 'Parcours Royal', 'Parcours 18 trous du Golf du Palais Royal d’Agadir.', 18, null, '/golf-courses/palais-royal-royal.webp', { priceOnRequest: true }),
  ]),
];

export default function ClubDetailPage() {
  const { t } = useTranslation('clubs');
  const { clubId } = useParams();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [club, setClub] = useState<Club | null>(() => mockClubs.find((c) => c.id === clubId) ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) return;
    let cancelled = false;

    api.get(`/clubs/${clubId}`)
      .then((res) => {
        if (!cancelled && res.data?.data) {
          setClub(res.data.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setClub((prev) => prev ?? mockClubs.find((c) => c.id === clubId) ?? null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clubId]);

  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterValues>({
    date: '',
    timeFrom: '',
    timeTo: '',
    players: '',
    holes: '',
 });

  if (loading && !club) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 text-center">
          <p className="text-muted-foreground">Loading club details...</p>
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 text-center">
          <p className="text-muted-foreground">Club not found</p>
        </div>
      </div>
    );
  }

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header transparent />

      <main className="pt-20">

        {/* Club header — LinkedIn style: cover banner + logo on left */}
        <section className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
              {/* Cover image — full width banner */}
              <div className="relative h-32 w-full md:h-48">
                <img
                  src={club.coverURL}
                  alt={club.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Logo + info — logo on left, overlapping cover */}
              <div className="flex flex-col items-center md:items-start gap-2 px-6 pb-6">
                <img
                    src={club.logoURL}
                    alt={club.name}
                    className="h-24 w-24 -translate-y-12 rounded-full border-4 border-background object-cover bg-background md:h-35 md:w-35"
                />
                <div className="-mt-8 flex flex-col items-center md:items-start gap-2 text-center">
                    <h1 className="font-serif text-2xl font-bold text-secondary md:text-3xl">
                        {club.name}
                    </h1>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin size={14} />
                        <span>{club.city}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Flag size={12} className="text-primary" />
                        <span>{club.courses.length} {t('club.courses')}</span>
                    </div>
                </div>
               </div>
            </div>

            {/* Description — below the header card */}
            <div className="mt-6">
              <p className="text-base text-muted-foreground">{club.description}</p>
            </div>
          </div>
        </section>

        {/* Courses list */}
        <section className="border-t border-border py-8">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-secondary">
                    {t('club.courses')}
                </h2>
                <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 border-primary text-secondary"
                    onClick={() => setFilterOpen(true)}
                >
                    <SlidersHorizontal size={18} />
                    <span className="hidden md:inline">{t('search.filter')}</span>
                </Button>
            </div>
            <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
              {club.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => handleCourseClick(course)}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <CourseDialog
        course={selectedCourse}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedCourse(null);
        }}
      />

      <FilterDialog
        open={filterOpen}
        onOpenChange={setFilterOpen}
        values={filters}
        onChange={setFilters}
        showHoles
      />
    </div>
  );
}