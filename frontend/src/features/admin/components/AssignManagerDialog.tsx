import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import {useState} from "react";
import {useTranslation} from "react-i18next";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import type {ManagerListProps} from "@/features/manager/types.ts";
import {useDataManagers} from "@/features/admin/hooks/useDataManagers.ts";
import type {Club} from "@/features/clubs/types.ts";
import {useReassignManager} from "@/features/admin/hooks/useReassignManager.ts";

export default function AssignManagerDialog({isDesktop, assignOpen, setAssignOpen, selectedClub}: {isDesktop?: boolean, assignOpen: boolean, setAssignOpen: (open: boolean) => void, selectedClub: Club | null}) {
    const { t } = useTranslation('app');
    const { data } = useDataManagers();

    const reassignManager = useReassignManager()

    const managers : ManagerListProps[] = data?.pages.flatMap(p => p) ?? [];

    const [selectedManagerId, setSelectedManagerId] = useState<string | null>(selectedClub?.ownerId || null);

    const handleAssignManager = (e: React.FormEvent) => {
        e.preventDefault();
        reassignManager.mutate(
            {
                clubId: selectedClub?.id,
                managerId: selectedManagerId,
            },
            {
                onSuccess: () => {
                    setAssignOpen(false); // close dialog
                },
            }
        )
    };

    const selectedManager = managers.find((m) => m.id === selectedManagerId);

    return isDesktop ? (
        <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
            <DialogContent className="sm:max-w-sm bg-surface">
                <DialogHeader>
                    <DialogTitle className="font-serif text-lg font-bold text-secondary">
                        {t('clubsManagement.details.assignManager')}
                    </DialogTitle>
                </DialogHeader>
                    <Select value={selectedManagerId} onValueChange={(v) => setSelectedManagerId(v)}>
                        <SelectTrigger className="w-full border-border">
                            <SelectValue >
                                {selectedManager
                                    ? `${selectedManager.firstName} ${selectedManager.lastName}`
                                    : t('clubsManagement.form.noOwner')}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>{t('clubsManagement.form.noOwner')}</SelectItem>
                            {managers.map((m: ManagerListProps) => (
                                <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                <DialogFooter className="gap-2">
                    <Button variant="outline" className="flex-1 border-border" onClick={() => setAssignOpen(false)}>
                        {t('clubsManagement.form.cancel')}
                    </Button>
                    <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAssignManager}>
                        {t('clubsManagement.form.save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ) : (
        <Drawer open={assignOpen} onOpenChange={setAssignOpen}>
            <DrawerContent className="max-h-[60vh] bg-surface">
                <DrawerHeader>
                    <DrawerTitle className="font-serif text-lg font-bold text-secondary">
                        {t('clubsManagement.details.assignManager')}
                    </DrawerTitle>
                </DrawerHeader>
            </DrawerContent>
        </Drawer>
    )
}