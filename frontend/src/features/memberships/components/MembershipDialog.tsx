import { useTranslation } from 'react-i18next';
import { MapPin, Building2, Tag, Calendar, Check } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Membership } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface MembershipDialogProps {
  membership: Membership | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeColors: Record<string, string> = {
  MONTHLY: 'bg-primary/15 text-primary border-primary',
  YEARLY: 'bg-secondary/15 text-secondary border-secondary',
  VIP: 'bg-primary text-primary-foreground border-primary',
};

export default function MembershipDialog({ membership, open, onOpenChange }: MembershipDialogProps) {
  const { t } = useTranslation('memberships');
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // useAuth() hydrates the auth store (GET /auth/me) — on this public page it
  // wouldn't be populated otherwise, making isAuthenticated always false
  const { isPending: isAuthPending } = useAuth();

  if (!membership) return null;

  const details = (
    <div className="grid grid-cols-2 gap-4">
      {membership.club?.name && (
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <Building2 size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('dialog.club')}</span>
          <span className="text-sm font-semibold text-foreground">{membership.club.name}</span>
        </div>
      )}
      {(membership.club?.city || membership.club?.address) && (
        <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
          <MapPin size={16} className="text-primary" />
          <span className="text-xs text-muted-foreground">{t('dialog.location')}</span>
          <span className="text-sm font-semibold text-foreground">{membership.club?.city || membership.club?.address}</span>
        </div>
      )}
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <Tag size={16} className="text-primary" />
        <span className="text-xs text-muted-foreground">{t('dialog.type')}</span>
        <Badge className={`w-fit border text-xs ${typeColors[membership.status ?? ''] || ''}`}>
          {t(`type.${membership.status}`)}
        </Badge>
      </div>
      <div className="flex flex-col gap-1 rounded-lg border border-border p-3">
        <Calendar size={16} className="text-primary" />
        <span className="text-xs text-muted-foreground">{t('dialog.duration')}</span>
        <span className="text-sm font-semibold text-foreground">
          {t('item.perYear')}
        </span>
      </div>
    </div>
  );

  const content = (
    <div className="flex flex-col gap-6">
      {/* Title + price */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-secondary sm:text-3xl">
            {membership.title}
          </h2>
          <Badge className={`mt-2 border ${typeColors[membership.status ?? ''] || ''}`}>
            {t(`type.${membership.status}`)}
          </Badge>
        </div>
        <div className="text-right">
          <span className="font-serif text-2xl font-bold text-primary">
            {membership.price} MAD
          </span>
          <p className="text-xs text-muted-foreground">
            {t('item.perYear')}
          </p>
        </div>
      </div>

      {/* Description */}
      <div>
        <h3 className="mb-2 text-xs font-medium tracking-widest text-primary">
          {t('dialog.description')}
        </h3>
        <p className="text-sm text-muted-foreground">{membership.description}</p>
      </div>

      {/* Details */}
      <div>
        <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
          {t('dialog.details')}
        </h3>
        {details}
      </div>

      <Separator />

      {/* Benefits */}
      {membership.benefits && membership.benefits.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-medium tracking-widest text-primary">
            {t('dialog.benefits')}
          </h3>
          <ul className="flex flex-col gap-2">
            {membership.benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check size={16} className="text-primary" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Subscribe button */}
      <div className="mt-auto">
        <Button
          size="lg"
          className="w-full"
          disabled={isAuthPending}
          onClick={() => {
            // Wait for the auth check to settle before deciding — otherwise a
            // logged-in user would be wrongly redirected to /login
            if (isAuthPending) return;
            if (!isAuthenticated) {
              navigate('/login');
              return;
            }
            if (!membership.id) return;
            onOpenChange(false);
            navigate(`/memberships/${membership.id}/subscribe`);
          }}
        >
          {t('dialog.subscribe')}
        </Button>
      </div>
    </div>
  );

  // ─── Desktop: centered Dialog ───
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg bg-white">
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Mobile: bottom sheet Drawer ───
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] bg-white">
        <div className="overflow-y-auto p-5">
          {content}
        </div>
      </DrawerContent>
    </Drawer>
  );
}