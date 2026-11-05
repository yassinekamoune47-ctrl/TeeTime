import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Course } from '@/features/courses/types';
import type { ECStatus } from '@/features/clubs/types';
import { useAdminUpdateCourse } from '../hooks/useAdminUpdateCourse';

interface AdminCourseEditDialogProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface ExtraRow {
    label: string;
    labelEn: string;
    price: string;
}

function CourseForm({ course, onDone, mobile }: { course: Course; onDone: () => void; mobile: boolean }) {
    const { t } = useTranslation('app');
    const updateCourse = useAdminUpdateCourse();

    const [name, setName] = useState(course.name);
    const [holeCount, setHoleCount] = useState(String(course.holeCount));
    const [description, setDescription] = useState(course.description ?? '');
    const [priceOnRequest, setPriceOnRequest] = useState(course.greenFee === null);
    const [greenFee, setGreenFee] = useState(course.greenFee === null ? '' : String(course.greenFee));
    const [image, setImage] = useState(course.imagesUrls?.[0] ?? '');
    const [status, setStatus] = useState<ECStatus>(course.status);
    const [extras, setExtras] = useState<ExtraRow[]>(
        (course.extraFees ?? []).map((extra) => ({
            label: extra.label,
            labelEn: extra.labelEn ?? '',
            price: extra.price === null || extra.price === undefined ? '' : String(extra.price),
        })),
    );

    const updateExtra = (index: number, key: keyof ExtraRow, value: string) => {
        setExtras((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
    };

    const removeExtra = (index: number) => {
        setExtras((prev) => prev.filter((_, i) => i !== index));
    };

    const addExtra = () => {
        setExtras((prev) => [...prev, { label: '', labelEn: '', price: '' }]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const parsedFee = priceOnRequest || greenFee.trim() === '' ? null : Number(greenFee);
        const parsedHoles = Number(holeCount);

        updateCourse.mutate(
            {
                id: course.id,
                name: name.trim(),
                holeCount: Number.isFinite(parsedHoles) && parsedHoles > 0 ? parsedHoles : course.holeCount,
                description,
                price_per_player: parsedFee,
                image: image.trim() === '' ? null : image.trim(),
                is_active: status === 'ACTIVE',
                extra_fees: extras
                    .filter((row) => row.label.trim() !== '')
                    .map((row) => ({
                        label: row.label.trim(),
                        labelEn: row.labelEn.trim() || undefined,
                        price: row.price.trim() === '' ? null : Number(row.price),
                    })),
            },
            { onSuccess: onDone },
        );
    };

    const body = (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.name')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="border-border" required />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.holes')}</Label>
                    <Input
                        type="number"
                        min="1"
                        max="36"
                        value={holeCount}
                        onChange={(e) => setHoleCount(e.target.value)}
                        className="border-border"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.status')}</Label>
                    <Select value={status} onValueChange={(v) => setStatus((v ?? 'ACTIVE') as ECStatus)}>
                        <SelectTrigger size="sm" className="w-full border-border">
                            <SelectValue>{t(`clubsManagement.status.${status.toLowerCase()}`)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">{t('clubsManagement.status.active')}</SelectItem>
                            <SelectItem value="SUSPENDED">{t('clubsManagement.status.suspended')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex flex-col gap-2 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                    <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.priceOnRequest')}</Label>
                    <Switch checked={priceOnRequest} onCheckedChange={(checked) => setPriceOnRequest(Boolean(checked))} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.greenFee')}</Label>
                    <Input
                        type="number"
                        min="0"
                        value={greenFee}
                        onChange={(e) => setGreenFee(e.target.value)}
                        placeholder={t('clubsManagement.courses.form.priceOnRequest')}
                        disabled={priceOnRequest}
                        className="border-border"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.image')}</Label>
                <Input value={image} onChange={(e) => setImage(e.target.value)} className="border-border" placeholder="/golf-courses/..." />
                {image.trim() !== '' && (
                    <img src={image} alt={name} className="h-24 w-full rounded-lg border border-border object-cover" />
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.description')}</Label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm text-secondary">{t('clubsManagement.courses.form.extras')}</Label>
                    <Button type="button" variant="outline" size="sm" className="gap-1.5 border-border" onClick={addExtra}>
                        <Plus size={14} /> {t('clubsManagement.courses.form.addExtra')}
                    </Button>
                </div>
                {extras.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('clubsManagement.courses.form.noExtras')}</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {extras.map((row, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    value={row.label}
                                    onChange={(e) => updateExtra(index, 'label', e.target.value)}
                                    placeholder={t('clubsManagement.courses.form.extraLabel')}
                                    className="border-border"
                                />
                                <Input
                                    type="number"
                                    min="0"
                                    value={row.price}
                                    onChange={(e) => updateExtra(index, 'price', e.target.value)}
                                    placeholder={t('clubsManagement.courses.form.priceOnRequest')}
                                    className="w-32 border-border"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="shrink-0 text-red-500 hover:text-red-600"
                                    onClick={() => removeExtra(index)}
                                    aria-label={t('clubsManagement.courses.form.removeExtra')}
                                >
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                <p className="text-[11px] text-muted-foreground">{t('clubsManagement.courses.form.extrasHint')}</p>
            </div>
        </div>
    );

    const footer = (
        <>
            <Button type="button" variant="outline" className="border-border" onClick={onDone}>
                {t('clubsManagement.courses.form.cancel')}
            </Button>
            <Button type="submit" form="admin-course-form" disabled={updateCourse.isPending}>
                {t('clubsManagement.courses.form.save')}
            </Button>
        </>
    );

    if (mobile) {
        return (
            <>
                <div className="max-h-[65vh] overflow-y-auto px-4 pb-2">
                    <form id="admin-course-form" onSubmit={handleSubmit}>{body}</form>
                </div>
                <DrawerFooter className="px-4 pb-6">{footer}</DrawerFooter>
            </>
        );
    }

    return (
        <>
            <div className="max-h-[65vh] overflow-y-auto px-6 py-2">
                <form id="admin-course-form" onSubmit={handleSubmit}>{body}</form>
            </div>
            <DialogFooter className="px-6 pb-4">{footer}</DialogFooter>
        </>
    );
}

export default function AdminCourseEditDialog({ course, open, onOpenChange }: AdminCourseEditDialogProps) {
    const { t } = useTranslation('app');
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (!course) return null;

    const content = (
        <CourseForm
            key={course.id}
            course={course}
            mobile={!isDesktop}
            onDone={() => onOpenChange(false)}
        />
    );

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-h-[85vh] overflow-hidden bg-surface sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-lg font-bold text-secondary">
                            {t('clubsManagement.courses.editTitle')}
                        </DialogTitle>
                    </DialogHeader>
                    {content}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent className="max-h-[90vh] bg-surface">
                <DrawerHeader>
                    <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                        {t('clubsManagement.courses.editTitle')}
                    </DrawerTitle>
                </DrawerHeader>
                {content}
            </DrawerContent>
        </Drawer>
    );
}
