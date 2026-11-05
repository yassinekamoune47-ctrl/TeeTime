import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Search, UserPlus, UserCheck, Package, Plus, Check, X, Pencil, Power, Trash2, Clock, User, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import PackageFormDialog from '../components/PackageFormDialog';

type TabId = 'requests' | 'accepted' | 'packages';
type RequestStatus = 'pending' | 'approved' | 'rejected';
type PackageStatus = 'active' | 'inactive';
type Level = 'beginner' | 'intermediate' | 'advanced';

interface PackageRequest {
  id: string;
  fullName: string;
  initials: string;
  packageName: string;
  requestedAt: string;
  status: RequestStatus;
  contact: string;
}

interface AcceptedParticipant {
  id: string;
  fullName: string;
  initials: string;
  packageName: string;
  acceptedAt: string;
  contact: string;
}

interface PackageItem {
  id: string;
  name: string;
  description: string;
  clubName: string;
  price: number;
  duration: string;
  level: Level;
  instructor: string;
  startDate: string;
  endDate: string;
  image: string;
  status: PackageStatus;
  participantsCount: number;
}

const requestStatusColors: Record<RequestStatus, string> = {
  pending: 'border-primary bg-primary/15 text-primary',
  approved: 'border-secondary bg-secondary/15 text-secondary',
  rejected: 'border-border bg-muted text-muted-foreground',
};

const packageStatusColors: Record<PackageStatus, string> = {
  active: 'border-secondary bg-secondary/15 text-secondary',
  inactive: 'border-border bg-muted text-muted-foreground',
};

// const levelColors: Record<Level, string> = {
//   beginner: 'border-secondary bg-secondary/15 text-secondary',
//   intermediate: 'border-primary bg-primary/15 text-primary',
//   advanced: 'border-red-500 bg-red-500/15 text-red-600',
// };

const mockRequests: PackageRequest[] = [
  { id: '1', fullName: 'Ahmed Benali', initials: 'AB', packageName: 'Stage Initiation Golf', requestedAt: 'il y a 2h', status: 'pending', contact: '+212 6 12 34 56 78' },
  { id: '2', fullName: 'Sara Mansouri', initials: 'SM', packageName: 'Perfectionnement Avancé', requestedAt: 'il y a 5h', status: 'pending', contact: '+212 6 98 76 54 32' },
  { id: '3', fullName: 'Youssef Khalfouni', initials: 'YK', packageName: 'Week-end Découverte', requestedAt: 'il y a 1j', status: 'pending', contact: '+212 6 55 44 33 22' },
  { id: '4', fullName: 'Imane Rachidi', initials: 'IR', packageName: 'Stage Initiation Golf', requestedAt: 'il y a 2j', status: 'rejected', contact: '+212 6 77 88 99 00' },
];

const mockAccepted: AcceptedParticipant[] = [
  { id: '1', fullName: 'Karim El Idrissi', initials: 'KE', packageName: 'Stage Initiation Golf', acceptedAt: 'il y a 3j', contact: '+212 6 11 22 33 44' },
  { id: '2', fullName: 'Nadia Lamrani', initials: 'NL', packageName: 'Perfectionnement Avancé', acceptedAt: 'il y a 4j', contact: '+212 6 90 80 70 60' },
  { id: '3', fullName: 'Omar Fassi', initials: 'OF', packageName: 'Week-end Découverte', acceptedAt: 'il y a 5j', contact: '+212 6 33 22 11 00' },
  { id: '4', fullName: 'Leila Alaoui', initials: 'LA', packageName: 'Stage Initiation Golf', acceptedAt: 'il y a 1sem', contact: '+212 6 44 55 66 77' },
];

const mockPackages: PackageItem[] = [
  { id: '1', name: 'Stage Initiation Golf', description: 'Un stage complet pour débutants. Apprenez les fondamentaux du swing, du putting et du jeu court avec un pro certifié.', clubName: 'Royal Golf de Marrakech', price: 2500, duration: '3 jours', level: 'beginner', instructor: 'Ahmed Benali', startDate: '20/07/2026', endDate: '22/07/2026', image: '/section1.png', status: 'active', participantsCount: 12 },
  { id: '2', name: 'Perfectionnement Avancé', description: 'Stage intensif pour joueurs confirmés. Analyse vidéo, stratégie de parcours et préparation mentale.', clubName: 'Golf du Palais Royal', price: 4500, duration: '5 jours', level: 'advanced', instructor: 'Karim El Idrissi', startDate: '01/08/2026', endDate: '05/08/2026', image: '/section3.png', status: 'active', participantsCount: 8 },
  { id: '3', name: 'Week-end Découverte', description: 'Un week-end pour découvrir le golf dans une ambiance conviviale.', clubName: 'Royal Golf Anfa Mohammedia', price: 1500, duration: '2 jours', level: 'beginner', instructor: 'Saïd Mansouri', startDate: '10/06/2026', endDate: '11/06/2026', image: '/section2.png', status: 'active', participantsCount: 15 },
  { id: '4', name: 'Stage Intermédiaire', description: 'Pour les joueurs ayant déjà les bases et souhaitant progresser.', clubName: 'Royal Golf de Marrakech', price: 3000, duration: '4 jours', level: 'intermediate', instructor: 'Nadia Lamrani', startDate: '15/09/2026', endDate: '18/09/2026', image: '/section1.png', status: 'inactive', participantsCount: 0 },
];

export default function PackagesPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [tab, setTab] = useState<TabId>('requests');
  const [requests, setRequests] = useState(mockRequests);
  const [accepted, setAccepted] = useState(mockAccepted);
  const [packages, setPackages] = useState(mockPackages);

  const [searchRequests, setSearchRequests] = useState('');
  const [searchAccepted, setSearchAccepted] = useState('');
  const [searchPackages, setSearchPackages] = useState('');

  const [selectedRequest, setSelectedRequest] = useState<PackageRequest | null>(null);
  const [selectedAccepted, setSelectedAccepted] = useState<AcceptedParticipant | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PackageItem | null>(null);

  const filteredRequests = useMemo(() => {
    if (!searchRequests) return requests;
    const q = searchRequests.toLowerCase();
    return requests.filter((r) => r.fullName.toLowerCase().includes(q) || r.packageName.toLowerCase().includes(q) || r.status.includes(q));
  }, [requests, searchRequests]);

  const filteredAccepted = useMemo(() => {
    if (!searchAccepted) return accepted;
    const q = searchAccepted.toLowerCase();
    return accepted.filter((a) => a.fullName.toLowerCase().includes(q) || a.packageName.toLowerCase().includes(q));
  }, [accepted, searchAccepted]);

  const filteredPackages = useMemo(() => {
    if (!searchPackages) return packages;
    const q = searchPackages.toLowerCase();
    return packages.filter((p) => p.name.toLowerCase().includes(q) || p.clubName.toLowerCase().includes(q) || p.status.includes(q));
  }, [packages, searchPackages]);

  const openRequest = (r: PackageRequest) => { setSelectedRequest(r); setSelectedAccepted(null); setSelectedPackage(null); setOpen(true); };
  const openAccepted = (a: AcceptedParticipant) => { setSelectedAccepted(a); setSelectedRequest(null); setSelectedPackage(null); setOpen(true); };
  const openPackage = (p: PackageItem) => { setSelectedPackage(p); setSelectedRequest(null); setSelectedAccepted(null); setOpen(true); };

  const handleRequestAction = (id: string, action: 'approved' | 'rejected') => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: action } : r)));
    if (action === 'approved') {
      const req = requests.find((r) => r.id === id);
      if (req) {
        const newAccepted: AcceptedParticipant = {
          id: `acc-${Date.now()}`,
          fullName: req.fullName,
          initials: req.initials,
          packageName: req.packageName,
          acceptedAt: 'à l\'instant',
          contact: req.contact,
        };
        setAccepted((prev) => [newAccepted, ...prev]);
      }
    }
    setSelectedRequest((prev) => (prev ? { ...prev, status: action } : null));
    toast.success(action === 'approved' ? t('managePackages.request.approved') : t('managePackages.request.rejected'));
    if (action === 'rejected') setTimeout(() => setOpen(false), 800);
  };

  const handleRemoveAccepted = (id: string) => {
    setAccepted((prev) => prev.filter((a) => a.id !== id));
    setOpen(false);
    toast.success(t('managePackages.request.removed'));
  };

  const handlePackageStatus = (id: string, status: PackageStatus) => {
    setPackages((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setSelectedPackage((prev) => (prev ? { ...prev, status } : null));
    toast.success(status === 'active' ? t('managePackages.package.activated') : t('managePackages.package.deactivated'));
  };

  const handleDeletePackage = (id: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== id));
    setOpen(false);
    toast.success(t('managePackages.package.deleted'));
  };

  const handleCreatePackage = (data: Omit<PackageItem, 'id' | 'status' | 'participantsCount'>) => {
    const newPackage: PackageItem = { ...data, id: `pkg-${Date.now()}`, status: 'active', participantsCount: 0 };
    setPackages((prev) => [...prev, newPackage]);
    setFormOpen(false);
    toast.success(t('managePackages.package.created'));
  };

  const handleUpdatePackage = (data: Omit<PackageItem, 'id' | 'status' | 'participantsCount'>) => {
    if (!editing) return;
    setPackages((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...data } : p)));
    setSelectedPackage((prev) => (prev && prev.id === editing.id ? { ...prev, ...data } : prev));
    setFormOpen(false);
    setEditing(null);
    toast.success(t('managePackages.package.updated'));
  };

  const tabs: { id: TabId; label: string; icon: typeof UserPlus }[] = [
    { id: 'requests', label: t('managePackages.tabRequests'), icon: UserPlus },
    { id: 'accepted', label: t('managePackages.tabAccepted'), icon: UserCheck },
    { id: 'packages', label: t('managePackages.tabPackages'), icon: Package },
  ];

  const detailsContent = (
    <>
      {selectedRequest && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="border-2 border-primary">
              <AvatarFallback className="bg-primary/15 font-bold text-primary">{selectedRequest.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-bold text-secondary">{selectedRequest.fullName}</span>
              <Badge className={`w-fit border text-xs ${requestStatusColors[selectedRequest.status]}`}>
                {t(`managePackages.request.${selectedRequest.status}`)}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.request.package')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedRequest.packageName}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.request.contact')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedRequest.contact}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{t('managePackages.request.requested')} {selectedRequest.requestedAt}</span>
        </div>
      )}

      {selectedAccepted && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="border-2 border-secondary">
              <AvatarFallback className="bg-secondary/15 font-bold text-secondary">{selectedAccepted.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-bold text-secondary">{selectedAccepted.fullName}</span>
              <Badge className="w-fit border border-secondary bg-secondary/15 text-xs text-secondary">
                {t('managePackages.tabAccepted')}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.request.package')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedAccepted.packageName}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.request.contact')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedAccepted.contact}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{t('managePackages.request.approved')} {selectedAccepted.acceptedAt}</span>
        </div>
      )}

      {selectedPackage && (
        <div className="flex flex-col gap-4">
          <img src={selectedPackage.image} alt={selectedPackage.name} className="h-40 w-full rounded-lg object-cover" />
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-bold text-secondary">{selectedPackage.name}</span>
              <Badge className={`w-fit border text-xs ${packageStatusColors[selectedPackage.status]}`}>
                {t(`managePackages.package.${selectedPackage.status}`)}
              </Badge>
            </div>
            <span className="font-serif text-xl font-bold text-primary">{selectedPackage.price} MAD</span>
          </div>
          <p className="text-sm text-muted-foreground">{selectedPackage.description}</p>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.club')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedPackage.clubName}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.duration')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedPackage.duration}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.level')}</span>
              <span className="text-sm font-semibold text-secondary">{t(`managePackages.package.level${selectedPackage.level.charAt(0).toUpperCase() + selectedPackage.level.slice(1)}`)}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.instructor')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedPackage.instructor}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.startDate')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedPackage.startDate}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.endDate')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedPackage.endDate}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('managePackages.package.participants')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedPackage.participantsCount}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const detailsFooter = (
    <>
      {selectedRequest && selectedRequest.status === 'pending' && (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1 gap-2 border-border text-muted-foreground hover:bg-muted" onClick={() => handleRequestAction(selectedRequest.id, 'rejected')}>
            <X size={16} /> {t('managePackages.request.reject')}
          </Button>
          <Button className="flex-1 gap-2 bg-secondary text-white hover:bg-secondary/80" onClick={() => handleRequestAction(selectedRequest.id, 'approved')}>
            <Check size={16} /> {t('managePackages.request.approve')}
          </Button>
        </div>
      )}
      {selectedAccepted && (
        <div className="flex gap-2">
          <Button className="flex-1 gap-2 bg-red-500 text-white hover:bg-red-500/80" onClick={() => handleRemoveAccepted(selectedAccepted.id)}>
            <X size={16} /> {t('managePackages.request.remove')}
          </Button>
        </div>
      )}
      {selectedPackage && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-primary text-primary hover:bg-primary/10"
            onClick={() => { setEditing(selectedPackage); setOpen(false); setFormOpen(true); }}
          >
            <Pencil size={16} /> {t('managePackages.package.update')}
          </Button>
          {selectedPackage.status === 'active' ? (
            <Button className="flex-1 gap-2 bg-red-500 text-white hover:bg-red-500/80" onClick={() => handlePackageStatus(selectedPackage.id, 'inactive')}>
              <Power size={16} /> {t('managePackages.package.deactivate')}
            </Button>
          ) : (
            <Button className="flex-1 gap-2 bg-secondary text-white hover:bg-secondary/80" onClick={() => handlePackageStatus(selectedPackage.id, 'active')}>
              <Power size={16} /> {t('managePackages.package.activate')}
            </Button>
          )}
          <Button variant="outline" className="flex-1 gap-2 border-border text-muted-foreground hover:bg-muted" onClick={() => handleDeletePackage(selectedPackage.id)}>
            <Trash2 size={16} /> {t('managePackages.package.delete')}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-2xl font-bold text-secondary">{t('managePackages.title')}</h1>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {tabs.map((tabItem) => {
          const Icon = tabItem.icon;
          return (
            <button
              key={tabItem.id}
              onClick={() => setTab(tabItem.id)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                tab === tabItem.id
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border bg-surface text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon size={16} />
              {tabItem.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      {tab === 'requests' && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input value={searchRequests} onChange={(e) => setSearchRequests(e.target.value)} placeholder={t('managePackages.searchRequests')} className="pl-10 border-primary placeholder:text-secondary" />
          </div>
          <div className="flex flex-col gap-2">
            {filteredRequests.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('managePackages.empty')}</p>
            ) : (
              filteredRequests.map((r) => (
                <div key={r.id} onClick={() => openRequest(r)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md">
                  <Avatar size="lg" className="border border-border">
                    <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{r.initials}</AvatarFallback>
                  </Avatar>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-medium text-secondary">{r.fullName}</span>
                    <span className="text-xs text-muted-foreground">{r.packageName} · {t('managePackages.request.requested')} {r.requestedAt}</span>
                  </div>
                  <Badge className={`shrink-0 border text-xs ${requestStatusColors[r.status]}`}>
                    {t(`managePackages.request.${r.status}`)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'accepted' && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input value={searchAccepted} onChange={(e) => setSearchAccepted(e.target.value)} placeholder={t('managePackages.searchAccepted')} className="pl-10 border-primary placeholder:text-secondary" />
          </div>
          <div className="flex flex-col gap-2">
            {filteredAccepted.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('managePackages.empty')}</p>
            ) : (
              filteredAccepted.map((a) => (
                <div key={a.id} onClick={() => openAccepted(a)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md">
                  <Avatar size="lg" className="border border-border">
                    <AvatarFallback className="bg-secondary/15 text-sm font-bold text-secondary">{a.initials}</AvatarFallback>
                  </Avatar>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-medium text-secondary">{a.fullName}</span>
                    <span className="text-xs text-muted-foreground">{a.packageName} · {t('managePackages.request.approved')} {a.acceptedAt}</span>
                  </div>
                  <Badge className="shrink-0 border border-secondary bg-secondary/15 text-xs text-secondary">
                    {t('managePackages.tabAccepted')}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'packages' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input value={searchPackages} onChange={(e) => setSearchPackages(e.target.value)} placeholder={t('managePackages.searchPackages')} className="pl-10 border-primary placeholder:text-secondary" />
            </div>
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus size={16} />
              <span className="hidden sm:inline">{t('managePackages.package.create')}</span>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {filteredPackages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('managePackages.empty')}</p>
            ) : (
              filteredPackages.map((p) => (
                <div key={p.id} onClick={() => openPackage(p)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md">
                  <img src={p.image} alt={p.name} className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                  <Separator orientation="vertical" className="h-14" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-medium text-secondary">{p.name}</span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {p.duration}</span>
                      <span className="flex items-center gap-1"><GraduationCap size={12} className="text-primary" /> {t(`managePackages.package.level${p.level.charAt(0).toUpperCase() + p.level.slice(1)}`)}</span>
                      <span className="flex items-center gap-1"><User size={12} className="text-primary" /> {p.participantsCount}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-serif text-sm font-bold text-primary">{p.price} MAD</span>
                    <Badge className={`shrink-0 border text-xs ${packageStatusColors[p.status]}`}>
                      {t(`managePackages.package.${p.status}`)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Details dialog/drawer */}
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-secondary">
                {selectedRequest ? t('managePackages.tabRequests') : selectedAccepted ? t('managePackages.tabAccepted') : t('managePackages.tabPackages')}
              </DialogTitle>
            </DialogHeader>
            {detailsContent}
            {(selectedRequest || selectedAccepted || selectedPackage) && (
              <DialogFooter className="gap-2">{detailsFooter}</DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[90vh] bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                {selectedRequest ? t('managePackages.tabRequests') : selectedAccepted ? t('managePackages.tabAccepted') : t('managePackages.tabPackages')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4 max-h-[60vh]">{detailsContent}</div>
            {(selectedRequest || selectedAccepted || selectedPackage) && (
              <DrawerFooter className="px-4 pb-6">{detailsFooter}</DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}

      {/* Package form dialog */}
      <PackageFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={editing ? handleUpdatePackage : handleCreatePackage}
        initialData={editing ?? undefined}
      />
    </div>
  );
}