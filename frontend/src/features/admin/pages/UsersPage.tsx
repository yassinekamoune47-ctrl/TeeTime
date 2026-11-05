import {useState, useEffect} from 'react';
import { useTranslation } from 'react-i18next';
import {Search, Mail, Phone, Trash2, Plus, Building, Calendar} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CreateUserDialog from '../components/CreateUserDialog';
import type {User} from "@/types/user.types.ts";
import {useInfiniteScroll} from "@/hooks/useInfiniteScroll.ts";
import type {EUStatus, SearchUsers} from "@/api/types.ts";
import {useSearchDataUsers} from "@/features/admin/hooks/useSearchDataUsers.ts";
import {useChangeUserStatus} from "@/features/admin/hooks/useChangeUserStatus.ts";

const roleColors: Record<string, string> = {
  "": 'border-muted bg-muted text-muted-foreground',
  ROLE_PLAYER: 'border-primary bg-primary/15 text-primary',
  ROLE_MANAGER: 'border-secondary bg-secondary/15 text-secondary',
};

const statusColors: Record<string, string> = {
  ACTIVE: 'border-secondary bg-secondary/15 text-secondary',
  SUSPENDED: 'border-red-500 bg-red-500/15 text-red-600',
  PENDING: 'border-primary bg-primary/15 text-primary',
};

export default function UsersPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [searchUser, setSearchUser] = useState<SearchUsers>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    gender: "",
    status: "",
    role: "",
    page: 0,
    size: 10
  })
  const [debounced, setDebounced] = useState(searchUser);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchUser), 200);
    return () => clearTimeout(t);
  }, [searchUser]);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useSearchDataUsers(debounced);
  const changeUserStatus = useChangeUserStatus();
  const loadMoreRef = useInfiniteScroll(() => fetchNextPage(), hasNextPage);

  const users = data?.pages.flatMap(p => p) ?? [];
  const selected = users.find((u) => u.id === selectedId);

  const handleClick = (user: User) => {
    setSelectedId(user.id);
    setOpen(true);
  };

  const handleChangeStatus = (status: EUStatus) => {
    if (!selected) return;
    changeUserStatus.mutate(
      { userId: selected.id, status },
      {
        onSuccess: () => {
          console.log("status changed with success to: ", status);
        }
      }
    );
  };

  const detailsContent = selected && (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Avatar size="lg" className="border-2 border-primary">
          {
            selected.avatarURL == null
                ? <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                  {selected.firstName.charAt(0).toLocaleUpperCase()}{selected.lastName.charAt(0).toLocaleUpperCase()}
                </AvatarFallback>
                : <AvatarImage src={selected.avatarURL} />
          }
        </Avatar>
        <div className="flex flex-col gap-1">
          <span className="font-serif text-lg font-bold text-secondary">{selected.firstName} {selected.lastName}</span>
          <div className="flex gap-2">
            <Badge className={`border text-xs ${roleColors[selected.role]}`}>
              {t(`users.role.${selected.role}`)}
            </Badge>
            <Badge className={`border text-xs ${statusColors[selected.status]}`}>
              {t(`users.status.${selected.status}`)}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('users.details.email')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Mail size={14} className="text-primary" /> {selected.email}
          </span>
        </div>
        <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('users.details.phone')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Phone size={14} className="text-primary" /> {selected.phoneNumber}
          </span>
        </div>
        {/*later*/}
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <span className="text-xs text-muted-foreground">{t('users.details.registeredAt')}</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
            <Calendar size={14} className="text-primary" /> {selected.registerAt}
          </span>
        </div>
        {/*<div className="flex flex-col gap-1 rounded-lg border border-border p-3">*/}
        {/*  <span className="text-xs text-muted-foreground">{t('users.details.reservations')}</span>*/}
        {/*  <span className="flex items-center gap-2 text-sm font-semibold text-secondary">*/}
        {/*    <CalendarCheck size={14} className="text-primary" /> {selected.reservationsCount}*/}
        {/*  </span>*/}
        {/*</div>*/}
        {selected.clubId && (
          <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
            <span className="text-xs text-muted-foreground">{t('users.details.club')}</span>
            <span className="flex items-center gap-2 text-sm font-semibold text-secondary">
              <Building size={14} className="text-primary" /> {selected.clubName}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const detailsFooter = selected && (
    <div className="flex flex-wrap gap-2">

      {/* Update user status */}

        {(selected.status == "ACTIVE")
            ? (
                <Button
                    variant="outline"
                    className="flex-1 gap-2 border-primary text-red-700 hover:bg-red-500 hover:text-white"
                    onClick={() => handleChangeStatus("SUSPENDED")}
                >
                  <Trash2 size={16} /> {t('users.details.suspend')}
                </Button>
            )
            : (
                <Button
                    variant="outline"
                    className="flex-1 gap-2 border-primary text-green-700 hover:bg-green-500 hover:text-white"
                    onClick={() => handleChangeStatus("ACTIVE")}
                >
                  <Trash2 size={16} /> {t('users.details.activate')}
                </Button>
            )
        }

    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-row items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-secondary">{t('users.title')}</h1>
        <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setFormOpen(true)}>
          <Plus size={16} />
          <span className="hidden sm:inline">{t('user.addUser')}</span>
        </Button>
      </div>


      {/* Filter bar + Add button */}
      <Card className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                value={searchUser.firstName}
                onChange={(e) => setSearchUser({...searchUser, firstName: e.target.value})}
                placeholder={t('users.firstNamePlaceholder')}
                className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchUser.lastName}
                  onChange={(e) => setSearchUser({...searchUser, lastName: e.target.value})}
                  placeholder={t('users.lastNamePlaceholder')}
                  className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  value={searchUser.email}
                  onChange={(e) => setSearchUser({...searchUser, email: e.target.value})}
                  placeholder={t('users.emailPlaceholder')}
                  className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input
                  type={"tel"}
                  value={searchUser.phoneNumber}
                  onChange={(e) => setSearchUser({...searchUser, phoneNumber: e.target.value})}
                  placeholder={t('users.phonePlaceholder')}
                  className="pl-10 border-primary placeholder:text-secondary"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Select value={searchUser.role} onValueChange={(v) => setSearchUser({...searchUser, role: v ?? ''})}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue>
                    {searchUser.role ? t(`users.role.${searchUser.role}`) : t('users.role.all')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('users.role.all')}</SelectItem>
                  <SelectItem value="ROLE_PLAYER">{t('users.role.ROLE_PLAYER')}</SelectItem>
                  <SelectItem value="ROLE_MANAGER">{t('users.role.ROLE_MANAGER')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Select value={searchUser.status} onValueChange={(v) => setSearchUser({...searchUser, status: v ?? ''})}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue>
                    {searchUser.status ? t(`users.status.${searchUser.status}`) : t('users.status.all')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('users.status.all')}</SelectItem>
                  <SelectItem value="ACTIVE">{t('users.status.ACTIVE')}</SelectItem>
                  <SelectItem value="SUSPENDED">{t('users.status.SUSPENDED')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Select value={searchUser.gender} onValueChange={(v) => setSearchUser({...searchUser, gender: v ?? ''})}>
                <SelectTrigger size="sm" className="w-full border-border">
                  <SelectValue>
                    {searchUser.gender ? t(`users.gender.${searchUser.gender.toLocaleLowerCase()}`) : t('users.gender.all')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('users.gender.all')}</SelectItem>
                  <SelectItem value="MALE">{t('users.gender.male')}</SelectItem>
                  <SelectItem value="FEMALE">{t('users.gender.female')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Users list */}
      {isLoading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>
      ) : error ? (
          <p className="py-8 text-center text-sm text-red-500">Failed to load users</p>
      ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t('users.empty')}</p>
      ) : (
          <div className="flex flex-col gap-2">
            {users.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">{t('users.empty')}</p>
            ) : (
                users.map((u) => (
                    <div
                        key={u.id}
                        onClick={() => handleClick(u)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md"
                    >
                      <Avatar size="lg" className="border border-border">
                        {
                          u.avatarURL == null
                              ? <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">
                                {u.firstName.charAt(0).toLocaleUpperCase()}{u.lastName.charAt(0).toLocaleUpperCase()}
                              </AvatarFallback>
                              : <AvatarImage src={u.avatarURL} />
                        }
                      </Avatar>
                      <Separator orientation="vertical" className="h-12" />
                      <div className="flex flex-1 flex-col gap-1">
                        <span className="font-medium text-secondary">{u.firstName} {u.lastName}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={`border text-xs ${roleColors[u.role]}`}>
                          {t(`users.role.${u.role}`)}
                        </Badge>
                        <Badge className={`border text-xs ${statusColors[u.status]}`}>
                          {t(`users.status.${u.status}`)}
                        </Badge>
                      </div>
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
                {t('users.details.title')}
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
                {t('users.details.title')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4 max-h-[60vh]">{detailsContent}</div>
            <DrawerFooter className="px-4 pb-6">{detailsFooter}</DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}

      {/* Create user dialog */}
      <CreateUserDialog
        open={formOpen}
        onOpenChange={setFormOpen}
      />
    </div>
  );
}