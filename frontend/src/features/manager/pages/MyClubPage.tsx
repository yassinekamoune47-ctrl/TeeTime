import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {MapPin, Phone, Mail, MapPinned, Calendar, BadgeCheck, Plus, Building2} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CourseCard from '@/features/courses/components/CourseCard.tsx';
import CourseEditCard from "@/features/manager/components/CourseEditCard.tsx";
import CreateCourseDialog from '../components/CreateCourseDialog';
import type { Course } from '@/features/courses/types';
import { Pencil } from 'lucide-react';
import EditClubDialog from '../components/EditClubDialog';
import {useDataMyClub} from "@/features/manager/hooks/useDataMyClub.ts";

export default function MyClubPage() {
  const { t } = useTranslation('app');
  const { data: myClubData, isLoading, error } = useDataMyClub();

  console.log("data from the fetching: " + myClubData);
  const courses = myClubData?.courses ?? [];

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  console.log("myClubData: ", myClubData);
  console.log("courses: ", courses);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setCourseDialogOpen(true);
  };

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Loading...</p>;
  } else if(error) {
    return <p className="py-8 text-center text-sm text-red-500">Failed to load users</p>;
  }

  return(
    <div className="flex flex-col gap-6">
      {/* Header — cover + logo */}
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <div className="relative h-32 w-full md:h-48">
          {myClubData?.logoURL == null ? (
                  <div className="bg-primary h-full w-full object-cover md:h-full md:w-full">
                  </div>
              )
              : (
                  <img src={myClubData?.coverURL} alt={myClubData?.name} className="h-full w-full object-cover" />
              )
          }
        </div>
        <div className="flex flex-col items-center gap-2 px-6 pb-6 md:items-start">

          {myClubData?.logoURL == null ? (
            <div
                className="flex items-center justify-center bg-primary h-24 w-24 -translate-y-12 rounded-full border-4 border-background object-cover md:h-32 md:w-32"
            >
              <Building2 className="h-24 w-24 text-background" />
            </div>
          )
          : (
                  <img
                      src={myClubData?.logoURL}
                      alt={myClubData?.name}
                      className="h-24 w-24 -translate-y-12 rounded-full border-4 border-background object-cover bg-background md:h-32 md:w-32"
                  />
              )
          }

          <div className="-mt-8 flex flex-col items-center gap-2 text-center md:items-start">
            <h1 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{myClubData?.name}</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin size={14} className="text-primary" />
              <span>{myClubData?.city}</span>
            </div>
              <p>
                  {myClubData?.description}
              </p>
          </div>
        </div>
      </div>

      {/* Two columns: courses (left) + club info (right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Courses */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-secondary">{t('myClub.courses')}</h2>
            <Button
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t('myClub.createCourse')}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(courses.length == 0) && (
              <p className="text-sm text-muted-foreground">
                {t('myClub.noCourses')}
              </p>
            )}
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} onClick={() => handleCourseClick(course)} />
            ))}
          </div>
        </div>

        {/* Club info sidebar */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col gap-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-base font-bold text-secondary">{t('myClub.clubInfo')}</h3>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 border-primary text-primary hover:bg-primary/10"
                onClick={() => setEditOpen(true)}
              >
                <Pencil size={14} />
                <span className="hidden sm:inline">{t('myClub.editClub')}</span>
              </Button>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('myClub.status')}</span>
              <Badge
                className={
                  myClubData?.status === 'ACTIVE'
                    ? 'border border-secondary bg-secondary/15 text-xs text-secondary'
                    : 'border border-border bg-muted text-xs text-muted-foreground'
                }
              >
                <BadgeCheck size={12} className="mr-1" />
                {t(`myClub.${myClubData?.status}`)}
              </Badge>
            </div>

            <Separator />

            {/* Creation date */}
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-primary" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{t('myClub.createdAt')}</span>
                <span className="text-sm font-medium text-secondary">{myClubData?.createdAt}</span>
              </div>
            </div>

            {/* Contact */}
            {(myClubData?.phone != null || myClubData?.email != null) && (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <span className="text-xs font-medium tracking-widest text-primary">{t('myClub.contact')}</span>
                  {(myClubData?.phone != null) && (
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-primary" />
                        <span className="text-sm text-secondary">{myClubData?.phone}</span>
                      </div>
                    )
                  }

                  {(myClubData?.email != null) && (
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-primary" />
                        <span className="text-sm text-secondary break-all">{myClubData?.email}</span>
                      </div>
                  )}
                </div>
              </>
             )
            }


            <Separator />

            {/* Address + Maps */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium tracking-widest text-primary">{t('myClub.address')}</span>
              <div className="flex items-start gap-3">
                <MapPinned size={16} className="mt-0.5 text-primary" />
                <span className="text-sm text-secondary">{myClubData?.address}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <CourseEditCard
        course={selectedCourse}
        open={courseDialogOpen}
        onOpenChange={(open) => {
          setCourseDialogOpen(open);
          if (!open) setSelectedCourse(null);
        }}
      />

      <CreateCourseDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        clubId={myClubData?.id ?? ''}
      />

      <EditClubDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        initialData={{
          id: myClubData?.id,
          name: myClubData?.name,
          city: myClubData?.city,
          description: myClubData?.description,
          phone: myClubData?.phone,
          email: myClubData?.email,
          address: myClubData?.address,
          logo: null,
          cover: null,
        }}
      />
    </div>
  );
}