import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ClubRow {
  id: string;
  name: string;
  city: string;
  manager: string | null;
  members: number;
  reservations: number;
  utilization: number;
  revenue: string;
  status: 'published' | 'draft';
}

const mockClubs: ClubRow[] = [
  { id: '1', name: 'Golf du Palais Royal', city: 'Agadir', manager: 'Ahmed B.', members: 142, reservations: 380, utilization: 72, revenue: '45,200 DH', status: 'published' },
  { id: '2', name: 'Royal Golf Dar Es Salam', city: 'Rabat', manager: 'Sara M.', members: 98, reservations: 210, utilization: 55, revenue: '28,900 DH', status: 'published' },
  { id: '3', name: 'Michlifen', city: 'Ifrane', manager: null, members: 0, reservations: 0, utilization: 0, revenue: '0 DH', status: 'draft' },
  { id: '4', name: 'Royal Golf Anfa Mohammedia', city: 'Casablanca', manager: 'Karim E.', members: 120, reservations: 290, utilization: 68, revenue: '32,100 DH', status: 'published' },
  { id: '5', name: 'Sofitel Golf', city: 'Marrakech', manager: 'Nadia L.', members: 85, reservations: 175, utilization: 45, revenue: '21,400 DH', status: 'published' },
  { id: '6', name: 'Palmeraie', city: 'Marrakech', manager: 'Hassan T.', members: 110, reservations: 250, utilization: 61, revenue: '30,800 DH', status: 'published' },
  { id: '7', name: 'Ocean Golf', city: 'Agadir', manager: null, members: 45, reservations: 80, utilization: 22, revenue: '9,600 DH', status: 'draft' },
  { id: '8', name: 'Fes Golf', city: 'Fès', manager: 'Omar F.', members: 72, reservations: 140, utilization: 38, revenue: '16,200 DH', status: 'published' },
  { id: '9', name: 'Tanger Golf', city: 'Tanger', manager: 'Imane R.', members: 60, reservations: 110, utilization: 35, revenue: '12,500 DH', status: 'published' },
  { id: '10', name: 'Agadir Golf', city: 'Agadir', manager: 'Youssef K.', members: 55, reservations: 95, utilization: 28, revenue: '10,800 DH', status: 'published' },
  { id: '11', name: 'Bouskoura', city: 'Casablanca', manager: null, members: 0, reservations: 0, utilization: 0, revenue: '0 DH', status: 'draft' },
  { id: '12', name: 'Les Jardins', city: 'Rabat', manager: 'Leila A.', members: 88, reservations: 165, utilization: 52, revenue: '19,700 DH', status: 'published' },
  { id: '13', name: 'Mazagan Golf', city: 'El Jadida', manager: 'Said M.', members: 70, reservations: 130, utilization: 41, revenue: '15,300 DH', status: 'published' },
  { id: '14', name: 'Assilah Golf', city: 'Assilah', manager: null, members: 30, reservations: 45, utilization: 18, revenue: '5,400 DH', status: 'draft' },
  { id: '15', name: 'Ouarzazate', city: 'Ouarzazate', manager: 'Reda B.', members: 40, reservations: 70, utilization: 25, revenue: '8,100 DH', status: 'published' },
  { id: '16', name: 'Essaouira Golf', city: 'Essaouira', manager: 'Meryem C.', members: 50, reservations: 85, utilization: 32, revenue: '9,900 DH', status: 'published' },
  { id: '17', name: 'Nador Golf', city: 'Nador', manager: null, members: 0, reservations: 0, utilization: 0, revenue: '0 DH', status: 'draft' },
  { id: '18', name: 'Dakhla Golf', city: 'Dakhla', manager: 'Anas H.', members: 35, reservations: 60, utilization: 20, revenue: '7,200 DH', status: 'published' },
];

type SortKey = keyof Pick<ClubRow, 'name' | 'city' | 'members' | 'reservations' | 'utilization'>;

function utilColor(u: number) {
  if (u > 60) return 'text-secondary';
  if (u >= 30) return 'text-primary';
  return 'text-red-500';
}

function SortHeader({
  label,
  column,
  activeKey,
  onSort,
}: {
  label: string;
  column: SortKey;
  activeKey: SortKey;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th className="cursor-pointer pb-2 select-none hover:text-primary" onClick={() => onSort(column)}>
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown size={12} className={activeKey === column ? 'text-primary' : 'text-muted-foreground/50'} />
      </span>
    </th>
  );
}

export default function ClubPerformanceTable() {
  const { t } = useTranslation('app');
  const navigate = useNavigate();

  const [sortKey, setSortKey] = useState<SortKey>('reservations');
  const [sortAsc, setSortAsc] = useState(false);
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');
  const [page, setPage] = useState(1);

  const perPage = 20;

  const cities = useMemo(() => ['all', ...Array.from(new Set(mockClubs.map((c) => c.city)))], []);

  const filtered = useMemo(() => {
    let result = mockClubs;
    if (cityFilter !== 'all') result = result.filter((c) => c.city === cityFilter);
    if (statusFilter !== 'all') result = result.filter((c) => c.status === statusFilter);
    if (managerFilter !== 'all') {
      result = managerFilter === 'unassigned'
        ? result.filter((c) => c.manager === null)
        : result.filter((c) => c.manager !== null);
    }
    result = [...result].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortAsc ? av - bv : bv - av;
      return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return result;
  }, [cityFilter, statusFilter, managerFilter, sortKey, sortAsc]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  return (
    <Card className="flex flex-col p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-xs font-medium tracking-widest text-primary">
          {t('dashboard.admin.clubTable.title')}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Select value={cityFilter} onValueChange={(v) => { setCityFilter(v ?? 'all'); setPage(1); }}>
            <SelectTrigger size="sm" className="w-32 border-border">
              <SelectValue placeholder={t('dashboard.admin.clubTable.filterCity')} />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>{c === 'all' ? t('dashboard.admin.clubTable.all') : c}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v ?? 'all'); setPage(1); }}>
            <SelectTrigger size="sm" className="w-32 border-border">
              <SelectValue placeholder={t('dashboard.admin.clubTable.filterStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.admin.clubTable.all')}</SelectItem>
              <SelectItem value="published">{t('dashboard.admin.clubTable.published')}</SelectItem>
              <SelectItem value="draft">{t('dashboard.admin.clubTable.draft')}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={managerFilter} onValueChange={(v) => { setManagerFilter(v ?? 'all'); setPage(1); }}>
            <SelectTrigger size="sm" className="w-36 border-border">
              <SelectValue placeholder={t('dashboard.admin.clubTable.filterManager')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('dashboard.admin.clubTable.all')}</SelectItem>
              <SelectItem value="assigned">{t('dashboard.admin.clubTable.assigned')}</SelectItem>
              <SelectItem value="unassigned">{t('dashboard.admin.clubTable.unassignedLabel')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <SortHeader label={t('dashboard.admin.clubTable.club')} column="name" activeKey={sortKey} onSort={handleSort} />
              <th className="pb-2">{t('dashboard.admin.clubTable.city')}</th>
              <th className="pb-2">{t('dashboard.admin.clubTable.manager')}</th>
              <SortHeader label={t('dashboard.admin.clubTable.members')} column="members" activeKey={sortKey} onSort={handleSort} />
              <SortHeader label={t('dashboard.admin.clubTable.reservations')} column="reservations" activeKey={sortKey} onSort={handleSort} />
              <SortHeader label={t('dashboard.admin.clubTable.utilization')} column="utilization" activeKey={sortKey} onSort={handleSort} />
              <th className="pb-2">{t('dashboard.admin.clubTable.revenue')}</th>
              <th className="pb-2">{t('dashboard.admin.clubTable.status')}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr
                key={row.id}
                onClick={() => navigate(`/clubs/${row.id}`)}
                className="cursor-pointer border-b border-border transition-colors hover:bg-muted/50"
              >
                <td className="py-2.5 font-medium text-secondary">{row.name}</td>
                <td className="py-2.5 text-muted-foreground">{row.city}</td>
                <td className="py-2.5 text-muted-foreground">
                  {row.manager ?? <span className="text-red-500">{t('dashboard.admin.clubTable.unassigned')}</span>}
                </td>
                <td className="py-2.5 text-muted-foreground">{row.members}</td>
                <td className="py-2.5 text-muted-foreground">{row.reservations}</td>
                <td className={`py-2.5 font-semibold ${utilColor(row.utilization)}`}>{row.utilization}%</td>
                <td className="py-2.5 text-muted-foreground">{row.revenue}</td>
                <td className="py-2.5">
                  <Badge className={row.status === 'published' ? 'border border-secondary bg-secondary/15 text-xs text-secondary' : 'border border-border bg-muted text-xs text-muted-foreground'}>
                    {t(`dashboard.admin.clubTable.${row.status}`)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('dashboard.admin.clubTable.page', { current: page, total: totalPages || 1 })}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-border p-1.5 disabled:opacity-30 hover:bg-muted"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="rounded-md border border-border p-1.5 disabled:opacity-30 hover:bg-muted"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}