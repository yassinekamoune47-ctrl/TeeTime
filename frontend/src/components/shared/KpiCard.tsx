import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
}

export default function KpiCard({ label, value, icon: Icon, trend }: KpiCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium tracking-widest text-muted-foreground">{label}</span>
          <span className="font-serif text-2xl font-bold text-secondary">{value}</span>
          {trend && <span className="text-xs text-primary">{trend}</span>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon size={20} className="text-primary" />
        </div>
      </div>
    </Card>
  );
}