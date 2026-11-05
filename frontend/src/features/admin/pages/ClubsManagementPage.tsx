import {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, MapPin, Building, Users, Flag, Phone, Mail, Calendar, UserCog, MonitorX, MonitorCheck, Pencil } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Select, SelectTrigger, SelectContent, SelectItem, SelectValue} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import ClubFormDialog from '../components/ClubFormDialog';
import type { Club } from '../../clubs/types.ts';
import { ECStatus } from '../../clubs/types.ts';
import cities from '../../../data/cities.json' with {type: 'json'}

import {useChangeClubStatus} from "@/features/admin/hooks/useChangeClubStatus.ts";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll.ts";
import type { SearchClubs } from "@/api/types.ts";
import {useSearchDataClubs} from "@/features/admin/hooks/useSearchDataClubs.ts";
import AssignManagerDialog from "@/features/admin/components/AssignManagerDialog.tsx";
import AdminCourseEditDialog from "@/features/admin/components/AdminCourseEditDialog.tsx";

const statusColors: Record<string, string> = {
  "":        'border-border bg-muted text-muted-foreground',
  ACTIVE:    'border-secondary bg-secondary/15 text-secondary', // green
  SUSPENDED: 'border-red-500 bg-red-500/15 text-red-600',       // red
  ARCHIVED:  'border-border bg-muted text-muted-foreground',    // gray (for archived)
};

export default function ClubsManagementPage() {
  const { t } = useTranslation('app');

  const changeClubStatus = useChangeClubStatus();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [searchClub, setSearchClub] = useState<SearchClubs>({
    name: "",
    city: "",
    phone: "",
    email: "",
    status: "",
    ownerFirstName: "",
    ownerLastName: "",
    size: 10,
    page: 0
  });
  const [debounced, setDebounced] = useState(searchClub);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchClub), 200);
    return () => clearTimeout(t);
  }, [searchClub]);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchDataClubs(debounced);
  const loadMoreRef = useInfiniteScroll(() => fetchNextPage(), hasNextPage);

  const clubs = data?.pages.flatMap(p => p) ?? [];

  const selected = clubs.find((c) => c.id === selectedId);
  const editingCourse = selected?.courses.find((course) => course.id === editingCourseId) ?? null;

  const handleClick = (club: Club) => {
    setSelectedId(club.id);
    setOpen(true);
  };

  const handleChange = (club: Club) => {
    const status = club.status == ECStatus.ACTIVE ? ECStatus.SUSPENDED : ECStatus.ACTIVE;
    changeClubStatus.mutate(
        {
          clubId: club.id,
          status
        },
        {
          onSuccess: () => {
            // later
          },
        });
  }

  const openAssignDialog = () => {
    setAssignOpen(true);
  };

  console.log("clubs data: " + clubs);

  const detailsContent = selected && (
    <div className="flex flex-col gap-4">
      {selected.coverURL ? (
        <img src={selected.coverURL} alt={selected.name} className="h-32 w-full rounded-lg object-cover" />
      ) : (
          <img src='https://as2.ftcdn.net/jpg/00/89/24/05/1000_F_89240595_8WrStaamOuET51gnmJUNZc9GBePR85j6.webp' alt={selected.name} className="h-32 w-full rounded-lg object-cover" />
      )}

      <div className="flex items-center gap-3">
        <Avatar size="lg" className="border border-border">
          {
            selected.logoURL == null
                ? <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                  {selected.name.charAt(0).toLocaleUpperCase()}
                </AvatarFallback>
                : <AvatarImage src={selected.logoURL} />
          }
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="font-serif text-lg font-bold text-secondary">{selected.name}</span>
          <Badge className={`w-fit border text-xs ${statusColors[selected.status]}`}>
            {t(`clubsManagement.status.${selected.status.toLowerCase()}`)}
          </Badge>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{selected.description}</p>
      <Separator />
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t('clubsManagement.courses.title')}
        </span>
        {(selected.courses ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('clubsManagement.courses.empty')}</p>
        ) : (
          (selected.courses ?? []).map((course) => (
            <div key={course.id} className="flex items-center gap-3 rounded-lg border border-border p-2">
              {course.imagesUrls?.[0] ? (
                <img
                  src={course.imagesUrls[0]}
                  alt={course.name}
                  loading="lazy"
                  className="h-12 w-16 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="h-12 w-16 shrink-0 rounded-md bg-muted" />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-secondary">{course.name}</span>
                <span className="text-xs text-muted-foreground">
                  {course.holeCount} {t('clubsManagement.courses.holes')} ·{' '}
                  {course.greenFee !== null
                    ? `${course.greenFee} MAD`
                    : t('clubsManagement.courses.priceOnRequest')}
                  {course.extraFees && course.extraFees.length > 0 && (
                    <> · {course.extraFees.length} {t('clubsManagement.courses.extras')}</>
                  )}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0 gap-1.5 text-primary hover:bg-primary/10"
                onClick={() => setEditingCourseId(course.id)}
              >
                <Pencil size={14} /> {t('clubsManagement.courses.edit')}
              </Button>
            </div>
          ))
        )}
      </div>
      <Separator />
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.city')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <MapPin size={14} className="text-primary" /> {selected.city}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.createdAt')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Calendar size={14} className="text-primary" /> {selected.createdAt}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.members')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Users size={14} className="text-primary" /> {selected.memberCount}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.courses')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Flag size={14} className="text-primary" /> {selected.courseCount}
          </span>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.address')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Building size={14} className="text-primary" /> {selected.address}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.phone')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Phone size={14} className="text-primary" /> {selected.phone == null ? t('clubsManagement.details.notProvided') : selected.phone}
          </span>
        </div>
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.email')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Mail size={14} className="text-primary" /> {selected.email == null ? t('clubsManagement.details.notProvided') : selected.email}
          </span>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('clubsManagement.details.owner')}</span>
          {selected.ownerName ? (
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback className="bg-secondary/15 text-xs text-secondary">
                  {selected.ownerName.split(' ').map((n) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-semibold text-secondary">{selected.ownerName}</span>
            </div>
          ) : (
            <span className="text-sm font-semibold text-red-500">{t('clubsManagement.details.unassigned')}</span>
          )}
        </div>
      </div>
    </div>
  );

  console.log("selected club: " + selected?.ownerName);

  const isActive = selected?.status === ECStatus.ACTIVE;

  const colorsDetails = isActive
      ? 'border-red-500 text-red-600 hover:bg-red-500/10 hover:text-red-700'
      : 'border-secondary text-secondary hover:bg-secondary/10';

  const iconDetails = isActive ? (
      <>
        <MonitorX size={16} />
      </>
  ) : (
      <MonitorCheck size={16} />
  );

  const detailsFooter = selected && (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        className={`flex-1 gap-2 ${colorsDetails} `}
        onClick={() => handleChange(selected)}
      >
        {iconDetails} {selected.status == ECStatus.ACTIVE ? t('clubsManagement.details.suspend') : t('clubsManagement.details.activate')}

      </Button>
      <Button
              variant="outline"
              className="flex-1 gap-2 border-secondary text-secondary hover:bg-secondary/10"
              onClick={() => openAssignDialog()}
      >
            <UserCog size={16} /> {selected.ownerName ? t('clubsManagement.details.reassignManager') : t('clubsManagement.details.assignOwner')}
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className={"flex flex-row items-center justify-between"}>
        <h1 className="font-serif text-2xl font-bold text-secondary">{t('clubsManagement.title')}</h1>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => {setFormOpen(true); }}>
          <Plus size={16} />
          <span className="hidden sm:inline">{t('clubsManagement.add')}</span>
        </Button>
      </div>


      {/* Filter bar + Add button */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchClub.name}
                  onChange={(e) => setSearchClub({ ...searchClub, name: e.target.value })}
                  placeholder={t('clubsManagement.namePlaceholder')} className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchClub.phone}
                  onChange={(e) => setSearchClub({ ...searchClub, phone: e.target.value })}
                  placeholder={t('clubsManagement.phonePlaceholder')} className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchClub.email}
                  onChange={(e) => setSearchClub({ ...searchClub, email: e.target.value })}
                  placeholder={t('clubsManagement.emailPlaceholder')} className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchClub.ownerFirstName}
                  onChange={(e) => setSearchClub({ ...searchClub, ownerFirstName: e.target.value })}
                  placeholder={t('clubsManagement.ownerFirstNamePlaceholder')} className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchClub.ownerLastName}
                  onChange={(e) => setSearchClub({ ...searchClub, ownerLastName: e.target.value })}
                  placeholder={t('clubsManagement.ownerLastNamePlaceholder')} className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Select value={searchClub.status} onValueChange={(v) => setSearchClub({ ...searchClub, status: v ?? '' })}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue>
                    {searchClub.status ? t(`clubsManagement.status.${searchClub.status.toLocaleLowerCase()}`) : t('clubsManagement.status.all')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('clubsManagement.status.all')}</SelectItem>
                  <SelectItem value="ACTIVE">{t('clubsManagement.status.active')}</SelectItem>
                  <SelectItem value="SUSPENDED">{t('clubsManagement.status.suspended')}</SelectItem>
                  <SelectItem value="ARCHIVED">{t('clubsManagement.status.archived')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Select value={searchClub.city} onValueChange={(v) => setSearchClub({ ...searchClub, city: v ?? '' })}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue>
                    {searchClub.city ? searchClub.city : t('clubsManagement.city')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('clubsManagement.city')}</SelectItem>
                  {cities.map((city) => (
                      <SelectItem key={city.id} value={city.ville}>
                        {city.ville}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Clubs list */}
      {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">Failed to load users</p>
      ) : (
          <div className="flex flex-col gap-2">
            {clubs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t('clubsManagement.empty')}</p>
            ) : (
                clubs.map((c) => (
                    <div
                        key={c.id}
                        onClick={() => handleClick(c)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md"
                    >
                      <Avatar size="lg" className="border border-border">
                        {
                          c.logoURL == null
                              ? <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                                {c.name.charAt(0).toLocaleUpperCase()}
                              </AvatarFallback>
                              : <AvatarImage src={c.logoURL} />
                        }
                      </Avatar>
                      <Separator orientation="vertical" className="h-14" />
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="font-medium text-secondary">{c.name}</span>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin size={12} className="text-primary" /> {c.city}</span>
                          <span className="flex items-center gap-1"><Users size={12} className="text-primary" /> {c.memberCount}</span>
                          <span>
                    {c.ownerId ? c.ownerName : <span className="text-red-500">{t('clubsManagement.item.unassigned')}</span>}
                  </span>
                        </div>
                      </div>
                      <Badge className={`shrink-0 border text-xs ${statusColors[c.status]}`}>
                        {t(`clubsManagement.status.${c.status.toLowerCase()}`)}
                      </Badge>
                    </div>
                ))
            )}
          </div>
      )}


      <div ref={loadMoreRef} className="py-4">
        {isFetchingNextPage && (
            <p className="text-center text-sm text-muted-foreground">Loading more...</p>
        )}
      </div>

      {/* Details dialog/drawer */}
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md bg-surface max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-serif text-lg font-bold text-secondary">
                {t('clubsManagement.details.title')}
              </DialogTitle>
            </DialogHeader>
            {detailsContent}
            <DialogFooter className="gap-2">{detailsFooter}</DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[90vh] bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                {t('clubsManagement.details.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4 max-h-[60vh]">{detailsContent}</div>
            <DrawerFooter className="px-4 pb-6">{detailsFooter}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Club form dialog */}
      <ClubFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />

      {/* Assign manager dialog */}
      <AssignManagerDialog isDesktop={isDesktop} assignOpen={assignOpen} setAssignOpen={setAssignOpen} selectedClub={selected || null} />

      {/* Course edit dialog */}
      <AdminCourseEditDialog
        course={editingCourse}
        open={editingCourse !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setEditingCourseId(null);
        }}
      />
    </div>
  );
}