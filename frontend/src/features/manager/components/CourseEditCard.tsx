import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Save, Trash2, X, Undo2 } from 'lucide-react';
import type { Course } from '@/features/courses/types';
import type { ECStatus } from '@/features/clubs/types';
import { useUpdateCourse } from '../hooks/useUpdateCourse';
import { useDeleteCourse } from '../hooks/useDeleteCourse';
import { toast } from 'sonner';

interface CourseEditDialogProps {
    course: Course | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 50;
const MAX_TOTAL_SIZE_MB = 200;
const MB = 1024 * 1024;

function CourseEditContent({ course, onDone, mobile }: { course: Course; onDone: () => void; mobile: boolean }) {
    const { t } = useTranslation('app');

    const [name, setName] = useState(course.name);
    const [holeCount, setHoleCount] = useState(course.holeCount);
    const [greenFee, setGreenFee] = useState<number | ''>(course.greenFee ?? '');
    const [description, setDescription] = useState(course.description ?? '');
    const [status, setStatus] = useState<ECStatus>(course.status);
    const [imageUrlCount, setImageUrlCount] = useState(0);
    const [filesSelected, setFilesSelected] = useState(false);
    const [removedUrls, setRemovedUrls] = useState<string[]>([]);

    const fileInputsRef = useRef<Array<HTMLInputElement | null>>([]);

    const updateCourse = useUpdateCourse();
    const deleteCourse = useDeleteCourse();

    const validateFiles = (): boolean => {
        const allFiles = fileInputsRef.current.flatMap(
            (input) => (input?.files ? Array.from(input.files) : [])
        );

        if (allFiles.some((f) => !f.type.startsWith('image/'))) {
            toast.error('Only image files are allowed (JPG, PNG, WEBP, GIF)');
            return false;
        }
        if (allFiles.length > MAX_IMAGES) { toast.error(`Maximum ${MAX_IMAGES} images allowed`); return false; }
        if (allFiles.some((f) => f.size > MAX_FILE_SIZE_MB * MB)) { toast.error(`Each image must be under ${MAX_FILE_SIZE_MB}MB`); return false; }
        const total = allFiles.reduce((sum, f) => sum + f.size, 0);
        if (total > MAX_TOTAL_SIZE_MB * MB) { toast.error(`Total size must stay under ${MAX_TOTAL_SIZE_MB}MB`); return false; }
        return true;
    };

    const hasChanges =
        name !== course.name ||
        holeCount !== course.holeCount ||
        greenFee !== course.greenFee ||
        description !== (course.description ?? '') ||
        status !== course.status ||
        filesSelected ||
        removedUrls.length > 0;

    // Toggle an existing image between "keep" and "marked for removal" (click again = undo)
    const toggleRemoveImage = (url: string) => {
        setRemovedUrls((prev) =>
            prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
        );
    };

    const handleUpdate = () => {
        if (!validateFiles()) return;

        const allFiles = fileInputsRef.current.flatMap(
            (input) => (input?.files ? Array.from(input.files) : [])
        );

        const formData = new FormData();
        formData.append('id', course.id);
        formData.append('name', name);
        formData.append('holeCount', String(holeCount));
        formData.append('greenFee', String(greenFee));
        formData.append('description', description);
        formData.append('status', status);

        // Append each file under 'images' to match the backend UpdateCourseRequest DTO
        allFiles.forEach((file) => {
            formData.append('images', file);
        });

        // Append each URL marked for removal — backend contract: absent/empty = keep images
        removedUrls.forEach((url) => {
            formData.append('deletedImages', url);
        });

        updateCourse.mutate(formData, { onSuccess: onDone });
    };

    const handleDelete = () => {
        deleteCourse.mutate(course.id, { onSuccess: onDone });
    };

    const formBody = (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('myClub.form.name')}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="border-border" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-secondary">{t('myClub.form.holeCount')}</Label>
                    <Select value={String(holeCount)} onValueChange={(v) => setHoleCount(Number(v))}>
                        <SelectTrigger size="sm" className="w-full border-border">
                            <SelectValue>{holeCount}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="16">16</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-secondary">{t('myClub.form.greenFee')}</Label>
                    <Input
                        type="number"
                        min="0"
                        value={greenFee}
                        onChange={(e) => setGreenFee(e.target.value === '' ? '' : Number(e.target.value))}
                        className="border-border"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('myClub.status')}</Label>
                <Select value={status} onValueChange={(v) => setStatus((v ?? 'ACTIVE') as ECStatus)}>
                    <SelectTrigger size="sm" className="w-full border-border">
                        <SelectValue>{t(`myClub.${status}`)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ACTIVE">{t('myClub.ACTIVE')}</SelectItem>
                        <SelectItem value="SUSPENDED">{t('myClub.SUSPENDED')}</SelectItem>
                        <SelectItem value="ARCHIVED">{t('myClub.ARCHIVED')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('myClub.form.description')}</Label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
                />
            </div>

            {/* Current images — read-only preview so you know what exists */}
            {(course.imagesUrls?.length ?? 0) > 0 && (
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm text-secondary">{t('myClub.editCourse.currentImages')}</Label>
                    <div className="flex flex-wrap gap-2">
                        {course.imagesUrls?.map((url, idx) => {
                            const isRemoved = removedUrls.includes(url);
                            return (
                                <div key={idx} className="relative">
                                    <img
                                        src={url}
                                        alt={`${course.name} ${idx + 1}`}
                                        loading="lazy"
                                        decoding="async"
                                        className={`h-16 w-16 rounded-md border object-cover transition-all ${
                                            isRemoved
                                                ? 'border-red-400 opacity-40 grayscale'
                                                : 'border-border'
                                        }`}
                                    />
                                    {/* Red X — click to mark for removal, click again to undo */}
                                    <button
                                        type="button"
                                        onClick={() => toggleRemoveImage(url)}
                                        title={
                                            isRemoved
                                                ? t('myClub.editCourse.restoreImage')
                                                : t('myClub.editCourse.removeImage')
                                        }
                                        className={`absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white shadow transition-colors ${
                                            isRemoved
                                                ? 'bg-secondary hover:bg-secondary/80'
                                                : 'bg-red-500 hover:bg-red-600'
                                        }`}
                                    >
                                        {isRemoved ? (
                                            <Undo2 size={12} />
                                        ) : (
                                            <X size={12} />
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground">{t('myClub.editCourse.currentImagesHint')}</p>
                </div>
            )}

            {/* Image inputs — same mechanism as CreateCourseDialog */}
            <div className="flex flex-col gap-1.5">
                <Label className="text-sm text-secondary">{t('myClub.form.image')}</Label>
                <div className="flex flex-row gap-2">
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={() => setFilesSelected(true)}
                        ref={(el) => { fileInputsRef.current[0] = el; }}
                        className="border-border"
                    />
                    {/* type="button" prevents form submission when clicking + */}
                    <Button
                        type="button"
                        className="bg-secondary w-8"
                        onClick={() => setImageUrlCount(imageUrlCount + 1)}
                    >
                        +
                    </Button>
                </div>
            </div>
            {Array.from({ length: imageUrlCount }, (_, i) => (
                <div key={i} className="flex flex-row gap-2">
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={() => setFilesSelected(true)}
                        ref={(el) => { fileInputsRef.current[i + 1] = el; }}
                        className="border-border"
                    />
                    <Button
                        type="button"
                        className="bg-red-500 w-8"
                        onClick={() => setImageUrlCount(imageUrlCount - 1)}
                    >
                        -
                    </Button>
                </div>
            ))}
        </div>
    );

    const actions = (
        <div className="mt-1 flex flex-col gap-2 sm:flex-row">
            <Button
                onClick={handleUpdate}
                disabled={!hasChanges || updateCourse.isPending}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 sm:flex-1"
            >
                <Save size={16} />
                {t('myClub.editCourse.save')}
            </Button>
            <Button
                onClick={handleDelete}
                disabled={deleteCourse.isPending}
                variant="outline"
                className="w-full gap-2 sm:w-auto border-red-300 text-red-600 hover:bg-red-50"
            >
                <Trash2 size={16} />
                {t('myClub.editCourse.delete')}
            </Button>
        </div>
    );

    if (mobile) {
        return (
            <>
                <div className="overflow-y-auto px-4 pb-4 max-h-[65vh]">
                    {formBody}
                </div>
                <DrawerFooter className="px-4 pb-6">{actions}</DrawerFooter>
            </>
        );
    }

    return (
        <>
            <div className="flex flex-col gap-4 overflow-y-auto flex-1 px-6 pb-6">
                {formBody}
            </div>
            <DialogFooter className="gap-2 px-6 py-3 h-22 border-t">{actions}</DialogFooter>
        </>
    );
}

export default function CourseEditDialog({ course, open, onOpenChange }: CourseEditDialogProps) {
    const isDesktop = useMediaQuery('(min-width: 768px)');

    if (!course) return null;

    const onDone = () => onOpenChange(false);
    const content = <CourseEditContent key={`${course.id}-${open ? 'open' : 'closed'}`} course={course} onDone={onDone} mobile={!isDesktop} />;

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-md bg-surface max-h-[90vh] flex flex-col p-0 overflow-hidden">
                    <DialogHeader className="px-6 pt-5">
                        <DialogTitle className="font-serif text-lg font-bold text-secondary">
                            {course.name}
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
                        {course.name}
                    </DrawerTitle>
                </DrawerHeader>
                {content}
            </DrawerContent>
        </Drawer>
    );
}
