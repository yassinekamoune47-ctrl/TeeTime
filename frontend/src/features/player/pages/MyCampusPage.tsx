import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, MapPin, Calendar, Clock, User, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface CampusBooking {
  id: string;
  packageName: string;
  clubName: string;
  image: string;
  duration: string;
  startDate: string;
  endDate: string;
  status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED';
  description: string;
  price: number;
  instructor: string;
  level: string;
  images: string[];
}

const mockCampus: CampusBooking[] = [
  {
    id: '1',
    packageName: 'Stage Initiation Golf',
    clubName: 'Royal Golf de Marrakech',
    image: '/section1.png',
    duration: '3 jours',
    startDate: '20/07/2026',
    endDate: '22/07/2026',
    status: 'CONFIRMED',
    description: 'Un stage complet pour débutants. Apprenez les fondamentaux du swing, du putting et du jeu court avec un pro certifié.',
    price: 2500,
    instructor: 'Ahmed Benali',
    level: 'Débutant',
    images: ['/section1.png', '/section2.png'],
  },
  {
    id: '2',
    packageName: 'Perfectionnement Avancé',
    clubName: 'Golf du Palais Royal',
    image: '/section3.png',
    duration: '5 jours',
    startDate: '01/08/2026',
    endDate: '05/08/2026',
    status: 'PENDING',
    description: 'Stage intensif pour joueurs confirmés. Analyse vidéo, stratégie de parcours et préparation mentale.',
    price: 4500,
    instructor: 'Karim El Idrissi',
    level: 'Avancé',
    images: ['/section3.png', '/section1.png'],
  },
  {
    id: '3',
    packageName: 'Week-end Découverte',
    clubName: 'Royal Golf Anfa Mohammedia',
    image: '/section2.png',
    duration: '2 jours',
    startDate: '10/06/2026',
    endDate: '11/06/2026',
    status: 'COMPLETED',
    description: 'Un week-end pour découvrir le golf dans une ambiance conviviale.',
    price: 1500,
    instructor: 'Saïd Mansouri',
    level: 'Débutant',
    images: ['/section2.png'],
  },
];

const statusColors: Record<CampusBooking['status'], string> = {
  CONFIRMED: 'border-primary bg-primary/15 text-primary',
  PENDING: 'border-secondary bg-secondary/15 text-secondary',
  COMPLETED: 'border-secondary bg-secondary/15 text-secondary',
  CANCELLED: 'border-border bg-muted text-muted-foreground',
};

export default function MyCampusPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CampusBooking | null>(null);
  const [open, setOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  const handleClick = (c: CampusBooking) => {
    setSelected(c);
    setCurrentImage(0);
    setOpen(true);
  };

  const nextImage = () =>
    setCurrentImage((i) => (i + 1) % (selected?.images.length ?? 1));
  const prevImage = () =>
    setCurrentImage((i) =>
      (i - 1 + (selected?.images.length ?? 1)) % (selected?.images.length ?? 1)
    );

  const dialogContent = selected && (
    <div className="flex flex-col gap-5">
      {/* Image slider */}
      <div className="relative">
        <img
          src={selected.images[currentImage]}
          alt={selected.packageName}
          className="h-44 w-full rounded-lg object-cover"
        />
        {selected.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/80 p-1.5 shadow hover:bg-surface"
            >
              <ChevronLeft size={18} className="text-secondary" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-surface/80 p-1.5 shadow hover:bg-surface"
            >
              <ChevronRight size={18} className="text-secondary" />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
              {selected.images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === currentImage ? 'bg-primary' : 'bg-surface/60'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h2 className="font-serif text-xl font-bold text-secondary">{selected.packageName}</h2>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin size={14} className="text-primary" />
          <span>{selected.clubName}</span>
        </div>
      </div>

      <Badge className={`w-fit border ${statusColors[selected.status]}`}>
        {selected.status}
      </Badge>

      <p className="text-sm text-muted-foreground">{selected.description}</p>

      <Separator />

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('campus.dialog.startDate')}</span>
          <span className="text-sm font-semibold">{selected.startDate}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('campus.dialog.endDate')}</span>
          <span className="text-sm font-semibold">{selected.endDate}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Clock size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('campus.dialog.duration')}</span>
          <span className="text-sm font-semibold">{selected.duration}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <User size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('campus.dialog.instructor')}</span>
          <span className="text-sm font-semibold">{selected.instructor}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <GraduationCap size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('campus.dialog.level')}</span>
          <span className="text-sm font-semibold">{selected.level}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('campus.dialog.price')}</span>
          <span className="text-sm font-semibold text-primary">{selected.price} MAD</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-secondary">{t('campus.myCampus')}</h1>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('campus.searchPlaceholder')}
          className="pl-10 border-primary placeholder:text-secondary"
        />
      </div>

      <div className="flex flex-col gap-3">
        {mockCampus.map((c) => (
          <div
            key={c.id}
            onClick={() => handleClick(c)}
            className="flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-surface p-4 transition-shadow hover:shadow-md"
          >
            <img src={c.image} alt={c.packageName} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
            <div className="flex flex-1 flex-col gap-1">
              <span className="font-serif text-sm font-bold text-secondary">{c.packageName}</span>
              <span className="text-xs text-muted-foreground">{c.clubName}</span>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={12} className="text-primary" />{c.duration}</span>
                <span className="flex items-center gap-1"><Calendar size={12} className="text-primary" />{c.startDate}</span>
              </div>
            </div>
            <Badge className={`shrink-0 border text-xs ${statusColors[c.status]}`}>
              {c.status}
            </Badge>
          </div>
        ))}
      </div>

      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-surface max-h-[80vh] overflow-y-auto">{dialogContent}</DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[85vh] bg-surface">
            <div className="overflow-y-auto p-5 max-h-[80vh]">{dialogContent}</div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}