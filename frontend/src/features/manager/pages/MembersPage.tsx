import { useState, useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { membershipApi } from '@/api/endpoints/membership.api';
import { membershipRequestApi } from '@/api/endpoints/membershipRequest.api';
import type { Membership, EMRStatus } from '@/features/memberships/types';
import type { MembershipRequest as ApiMembershipRequest } from '@/features/memberships/types';
import { useAcceptMembershipRequest } from '../hooks/useAcceptMembershipRequest';
import { useRejectMembershipRequest } from '../hooks/useRejectMembershipRequest';
import { useUpdateMembership } from '../hooks/useUpdateMembership';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Users, UserPlus, Crown, Search, Check, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import OfferFormDialog from '../components/OfferFormDialog';

type TabId = 'members' | 'requests' | 'offers';
type MemberStatus = 'active' | 'suspended' | 'expired';
type RequestStatus = 'pending' | 'approved' | 'rejected';

interface Member {
  id: string;
  fullName: string;
  initials: string;
  since: string;
  status: MemberStatus;
  membership: string;
  contact: string;
}

const memberStatusColors: Record<MemberStatus, string> = {
  active: 'border-secondary bg-secondary/15 text-secondary',
  suspended: 'border-red-500 bg-red-500/15 text-red-600',
  expired: 'border-border bg-muted text-muted-foreground',
};

const requestStatusColors: Record<RequestStatus, string> = {
  pending: 'border-primary bg-primary/15 text-primary',
  approved: 'border-secondary bg-secondary/15 text-secondary',
  rejected: 'border-border bg-muted text-muted-foreground',
};

const apiStatusToUi = (status: EMRStatus): RequestStatus =>
  status === 'ACCEPTED' ? 'approved' : status === 'REJECTED' ? 'rejected' : 'pending';

const initialsOf = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function MembersPage() {
  const { t } = useTranslation('app');
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [tab, setTab] = useState<TabId>('members');

  const [searchMembers, setSearchMembers] = useState('');
  const [debouncedSearchMembers, setDebouncedSearchMembers] = useState('');
  const [searchOffers, setSearchOffers] = useState('');
  const [debouncedSearchOffers, setDebouncedSearchOffers] = useState('');
  const [searchPrice, setSearchPrice] = useState('');
  const [searchStatus, setSearchStatus] = useState<'' | 'ACTIVE' | 'SUSPENDED'>('');
  const [debouncedPrice, setDebouncedPrice] = useState('');
  const [reqFirstName, setReqFirstName] = useState('');
  const [reqLastName, setReqLastName] = useState('');
  const [reqPlanName, setReqPlanName] = useState('');
  const [reqStatus, setReqStatus] = useState<'' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>('');
  const [debouncedReqFirstName, setDebouncedReqFirstName] = useState('');
  const [debouncedReqLastName, setDebouncedReqLastName] = useState('');
  const [debouncedReqPlanName, setDebouncedReqPlanName] = useState('');

  // Debounce 500ms after typing, instant for first fetch (initial '' is synced)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchMembers(searchMembers), 500);
    return () => clearTimeout(timer);
  }, [searchMembers]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchOffers(searchOffers), 500);
    return () => clearTimeout(timer);
  }, [searchOffers]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPrice(searchPrice), 500);
    return () => clearTimeout(timer);
  }, [searchPrice]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedReqFirstName(reqFirstName), 500);
    return () => clearTimeout(t);
  }, [reqFirstName]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedReqLastName(reqLastName), 500);
    return () => clearTimeout(t);
  }, [reqLastName]);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedReqPlanName(reqPlanName), 500);
    return () => clearTimeout(t);
  }, [reqPlanName]);

  // Hook code inlined - was useSearchMyMemberships
  const {
    data: offersData,
    isLoading: isOffersLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<Membership[]>({
    queryKey: ['memberships', 'searchMy', debouncedSearchOffers, debouncedPrice, searchStatus],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await membershipApi.searchMyMemberships({
        title: debouncedSearchOffers,
        status: searchStatus || null,
        price: debouncedPrice ? Number(debouncedPrice) : null,
        page: pageParam as number,
        size: 10,
      });
      return res.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage && lastPage.length < 10 ? undefined : allPages.length,
    retry: false,
  });

  const offers = offersData?.pages.flat() ?? [];

  const {
    data: requestsData,
    isLoading: isRequestsLoading,
    fetchNextPage: fetchNextRequestsPage,
    hasNextPage: hasNextRequestsPage,
    isFetchingNextPage: isFetchingNextRequestsPage,
  } = useInfiniteQuery<ApiMembershipRequest[]>({
    queryKey: ['membershipRequests', 'search', debouncedReqFirstName, debouncedReqLastName, debouncedReqPlanName, reqStatus],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await membershipRequestApi.searchAll({
        firstName: debouncedReqFirstName,
        lastName: debouncedReqLastName,
        planName: debouncedReqPlanName,
        status: reqStatus || null,
        page: pageParam as number,
        size: 10,
      });
      return res.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length < 10 ? undefined : allPages.length),
    retry: false,
  });

  const requestsFromApi = requestsData?.pages.flat() ?? [];

  // ─── Members tab: real club members = players with an ACCEPTED membership request ───
  const {
    data: membersData,
    isLoading: isMembersLoading,
  } = useInfiniteQuery<ApiMembershipRequest[]>({
    queryKey: ['clubMembers', debouncedSearchMembers],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await membershipRequestApi.searchMembers({
        firstName: '',
        lastName: '',
        planName: debouncedSearchMembers,
        status: null,
        page: pageParam as number,
        size: 10,
      });
      return res.data.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage && lastPage.length < 10 ? undefined : allPages.length),
    retry: false,
  });

  const toMember = (r: ApiMembershipRequest): Member => ({
    id: r.id,
    fullName: r.userFullName ?? '',
    initials: (r.userFullName ?? '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
    since: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '',
    status: 'active',
    membership: r.planName ?? '',
    contact: '',
  });

  // Suspend/reinstate overrides applied on top of the API data (display only for now)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, MemberStatus>>({});

  const members: Member[] = (membersData?.pages.flat() ?? [])
    .map(toMember)
    .map((m) => (statusOverrides[m.id] ? { ...m, status: statusOverrides[m.id] } : m));

  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApiMembershipRequest | null>(null);
  const acceptRequest = useAcceptMembershipRequest();
  const rejectRequest = useRejectMembershipRequest();
  const [selectedOffer, setSelectedOffer] = useState<Membership | null>(null);
  const [open, setOpen] = useState(false);
  const [offerFormOpen, setOfferFormOpen] = useState(false);

  const updateMembership = useUpdateMembership();
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [editBenefits, setEditBenefits] = useState<string[]>(['']);

  const filteredMembers = useMemo(() => {
    if (!searchMembers) return members;
    const q = searchMembers.toLowerCase();
    return members.filter((m) => m.fullName.toLowerCase().includes(q) || m.membership.toLowerCase().includes(q) || m.status.includes(q));
  }, [members, searchMembers]);



  const openMember = (m: Member) => { setSelectedMember(m); setSelectedRequest(null); setSelectedOffer(null); setOpen(true); };
  const openRequest = (r: ApiMembershipRequest) => { setSelectedRequest(r); setSelectedMember(null); setSelectedOffer(null); setOpen(true); };
  const openOffer = (o: Membership) => {
    setSelectedMember(null);
    setSelectedRequest(null);
    setSelectedOffer(o);
    setEditTitle(o.title ?? '');
    setEditDescription(o.description ?? '');
    setEditPrice(String(o.price ?? ''));
    setEditStatus(o.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE');
    setEditBenefits(o.benefits && o.benefits.length > 0 ? o.benefits : ['']);
    setOpen(true);
  };

  const handleSuspend = (id: string, action: 'suspended' | 'active') => {
    setStatusOverrides((prev) => ({ ...prev, [id]: action }));
    setSelectedMember((prev) => (prev ? { ...prev, status: action } : null));
    toast.success(action === 'suspended' ? t('members.member.suspended') : t('members.member.reinstated'));
  };

  const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
    { id: 'members', label: t('members.tabMembers'), icon: Users },
    { id: 'requests', label: t('members.tabRequests'), icon: UserPlus },
    { id: 'offers', label: t('members.tabOffers'), icon: Crown },
  ];

  const detailsContent = (
    <>
      {selectedMember && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="border-2 border-primary">
              <AvatarFallback className="bg-primary/15 font-bold text-primary">{selectedMember.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-bold text-secondary">{selectedMember.fullName}</span>
              <Badge className={`w-fit border text-xs ${memberStatusColors[selectedMember.status]}`}>
                {t(`members.member.${selectedMember.status === 'suspended' ? 'suspended_status' : selectedMember.status}`)}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('members.member.membership')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedMember.membership}</span>
            </div>
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('members.member.since')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedMember.since}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('members.member.contact')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedMember.contact}</span>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg" className="border-2 border-primary">
              <AvatarFallback className="bg-primary/15 font-bold text-primary">{initialsOf(selectedRequest.userFullName)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="font-serif text-lg font-bold text-secondary">{selectedRequest.userFullName}</span>
              <Badge className={`w-fit border text-xs ${requestStatusColors[apiStatusToUi(selectedRequest.status)]}`}>
                {selectedRequest.status}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('members.request.membership')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedRequest.planName}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1 rounded-lg border border-border p-3">
              <span className="text-xs text-muted-foreground">{t('members.request.contact')}</span>
              <span className="text-sm font-semibold text-secondary">{selectedRequest.userFullName}</span>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">{t('members.request.requested')} {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : ''}</span>
        </div>
      )}

      {selectedOffer && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('members.offer.form.name')}</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="border-border" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('members.offer.form.description')}</Label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-secondary">{t('members.offer.form.price')}</Label>
              <Input type="number" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="border-border" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm text-secondary">Statut</Label>
              <Select value={editStatus} onValueChange={(v) => setEditStatus(v === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE')}>
                <SelectTrigger className="w-full border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Actif</SelectItem>
                  <SelectItem value="SUSPENDED">Suspendu</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm text-secondary">{t('members.offer.form.benefits')}</Label>
            <div className="flex flex-row gap-2">
              <Input value={editBenefits[0] ?? ''} onChange={(e) => { const next=[...editBenefits]; next[0]=e.target.value; setEditBenefits(next); }} className="border-border" placeholder={t('members.offer.form.benefitsPlaceholder')} />
              <Button type="button" className="bg-secondary w-8 shrink-0" onClick={() => setEditBenefits([...editBenefits, ''])}>
                +
              </Button>
            </div>
          </div>
          {editBenefits.slice(1).map((b, idx) => {
            const realIdx = idx + 1;
            return (
              <div key={realIdx} className="flex flex-row gap-2">
                <Input value={b} onChange={(e) => { const next=[...editBenefits]; next[realIdx]=e.target.value; setEditBenefits(next); }} className="border-border" placeholder={t('members.offer.form.benefitsPlaceholder')} />
                <Button type="button" className="bg-red-500 w-8 shrink-0 hover:bg-red-600" onClick={() => setEditBenefits(editBenefits.filter((_, i) => i !== realIdx))}>
                  -
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

  const detailsFooter = (
    <>
      {selectedMember && (
        <div className="flex gap-2">
          {selectedMember.status === 'active' ? (
            <Button className="flex-1 gap-2 bg-red-500 text-white hover:bg-red-500/80" onClick={() => handleSuspend(selectedMember.id, 'suspended')}>
              <X size={16} /> {t('members.member.suspend')}
            </Button>
          ) : (
            <Button className="flex-1 gap-2 bg-secondary text-white hover:bg-secondary/80" onClick={() => handleSuspend(selectedMember.id, 'active')}>
              <Check size={16} /> {t('members.member.reinstate')}
            </Button>
          )}
        </div>
      )}
      {selectedRequest && (
        apiStatusToUi(selectedRequest.status) === 'pending' ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-2 border-border text-muted-foreground hover:bg-muted"
              disabled={rejectRequest.isPending}
              onClick={() => rejectRequest.mutate(selectedRequest.id, { onSuccess: () => setOpen(false) })}
            >
              <X size={16} /> {t('members.request.reject')}
            </Button>
            <Button
              className="flex-1 gap-2 bg-secondary text-white hover:bg-secondary/80"
              disabled={acceptRequest.isPending}
              onClick={() => acceptRequest.mutate(selectedRequest.id, { onSuccess: () => setOpen(false) })}
            >
              <Check size={16} /> {t('members.request.approve')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </div>
        )
      )}
      {selectedOffer && (
        <div className="flex gap-2">
          <Button
            className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={updateMembership.isPending}
            onClick={() => {
              updateMembership.mutate(
                {
                  id: selectedOffer.id,
                  title: editTitle,
                  description: editDescription,
                  price: Number(editPrice) || 0,
                  status: editStatus,
                  benefits: editBenefits.map((b) => b.trim()).filter(Boolean),
                },
                { onSuccess: () => setOpen(false) },
              );
            }}
          >
            {updateMembership.isPending ? '...' : t('members.offer.form.save')}
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col gap-6">
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
      {tab === 'members' && (
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
            <Input value={searchMembers} onChange={(e) => setSearchMembers(e.target.value)} placeholder={t('members.searchMembers')} className="pl-10 border-primary placeholder:text-secondary" />
          </div>
          <div className="flex flex-col gap-2">
            {isMembersLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
            ) : filteredMembers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('members.empty')}</p>
            ) : (
              filteredMembers.map((m) => (
                <div key={m.id} onClick={() => openMember(m)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md">
                  <Avatar size="lg" className="border border-border">
                    <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{m.initials}</AvatarFallback>
                  </Avatar>
                  <Separator orientation="vertical" className="h-12" />
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="font-medium text-secondary">{m.fullName}</span>
                    <span className="text-xs text-muted-foreground">{m.membership} · {t('members.member.since')} {m.since}</span>
                  </div>
                  <Badge className={`shrink-0 border text-xs ${memberStatusColors[m.status]}`}>
                    {t(`members.member.${m.status === 'suspended' ? 'suspended_status' : m.status}`)}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {tab === 'requests' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input value={reqFirstName} onChange={(e) => setReqFirstName(e.target.value)} placeholder="Prénom" className="border-primary placeholder:text-secondary" />
            <Input value={reqLastName} onChange={(e) => setReqLastName(e.target.value)} placeholder="Nom" className="border-primary placeholder:text-secondary" />
            <Input value={reqPlanName} onChange={(e) => setReqPlanName(e.target.value)} placeholder="Offre" className="border-primary placeholder:text-secondary" />
            <Select value={reqStatus} onValueChange={(v) => setReqStatus((v ?? '') as '' | 'PENDING' | 'ACCEPTED' | 'REJECTED')}>
              <SelectTrigger className="w-full border-primary text-secondary">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="ACCEPTED">Accepté</SelectItem>
                <SelectItem value="REJECTED">Refusé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            {isRequestsLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
            ) : requestsFromApi.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('members.empty')}</p>
            ) : (
              <>
                {requestsFromApi.map((r) => (
                  <div key={r.id} onClick={() => openRequest(r)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md">
                    <Avatar size="lg" className="border border-border">
                      <AvatarFallback className="bg-primary/15 text-sm font-bold text-primary">{r.userFullName.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-medium text-secondary">{r.userFullName}</span>
                      <span className="text-xs text-muted-foreground">{r.planName} · {new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <Badge className={`shrink-0 border text-xs ${r.status === 'PENDING' ? 'border-primary bg-primary/15 text-primary' : r.status === 'ACCEPTED' ? 'border-secondary bg-secondary/15 text-secondary' : 'border-border bg-muted text-muted-foreground'}`}>
                      {r.status}
                    </Badge>
                  </div>
                ))}
                {hasNextRequestsPage && (
                  <Button variant="outline" className="mt-2 w-full" onClick={() => fetchNextRequestsPage()} disabled={isFetchingNextRequestsPage}>
                    {isFetchingNextRequestsPage ? 'Chargement...' : 'Charger plus'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {tab === 'offers' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 min-w-0">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
              <Input value={searchOffers} onChange={(e) => setSearchOffers(e.target.value)} placeholder={t('members.searchOffers')} className="pl-10 border-primary placeholder:text-secondary" />
            </div>
            <Input type="number" value={searchPrice} onChange={(e) => setSearchPrice(e.target.value)} placeholder="Prix" className="w-24 sm:w-32 shrink-0 border-primary placeholder:text-secondary" />
            <Select value={searchStatus} onValueChange={(v) => setSearchStatus((v ?? '') as '' | 'ACTIVE' | 'SUSPENDED')}>
              <SelectTrigger className="w-28 sm:w-36 shrink-0 border-primary text-secondary">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tous</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="SUSPENDED">Suspendu</SelectItem>
              </SelectContent>
            </Select>
            <Button className="gap-2 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setOfferFormOpen(true)}>
              <Plus size={16} />
              <span className="hidden sm:inline">{t('members.offer.create')}</span>
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {isOffersLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Chargement...</p>
            ) : offers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">{t('members.empty')}</p>
            ) : (
              <>
                {offers.map((o) => (
                  <div key={o.id ?? o.title} onClick={() => openOffer(o)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-3 transition-shadow hover:shadow-md">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Crown size={18} className="text-primary" />
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div className="flex flex-1 flex-col gap-1">
                      <span className="font-medium text-secondary">{o.title}</span>
                      <span className="text-xs text-muted-foreground">{o.price} MAD · {o.benefits.length} avantages</span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-serif text-sm font-bold text-primary">{o.price} MAD</span>
                      <Badge className={`shrink-0 border text-xs ${o.status === 'ACTIVE' ? 'border-secondary bg-secondary/15 text-secondary' : 'border-border bg-muted text-muted-foreground'}`}>
                        {o.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {hasNextPage && (
                  <Button variant="outline" className="mt-2 w-full" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Chargement...' : 'Charger plus'}
                  </Button>
                )}
              </>
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
                {selectedMember ? t('members.tabMembers') : selectedRequest ? t('members.tabRequests') : t('members.tabOffers')}
              </DialogTitle>
            </DialogHeader>
            {detailsContent}
            {(selectedMember || selectedRequest || selectedOffer) && (
              <DialogFooter className="gap-2">{detailsFooter}</DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[90vh] bg-surface">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                {selectedMember ? t('members.tabMembers') : selectedRequest ? t('members.tabRequests') : t('members.tabOffers')}
              </DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4 max-h-[60vh]">{detailsContent}</div>
            {(selectedMember || selectedRequest || selectedOffer) && (
              <DrawerFooter className="px-4 pb-6">{detailsFooter}</DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      )}

      {/* Offer form dialog */}
      <OfferFormDialog open={offerFormOpen} onOpenChange={setOfferFormOpen} />
    </div>
  );
}