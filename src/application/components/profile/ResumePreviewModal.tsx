import { Profile, WorkExperience } from '@/domain/entities/profile';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/application/components/ui/dialog';
import { Button } from '@/application/components/ui/button';
import { Badge } from '@/application/components/ui/badge';
import { ScrollArea } from '@/application/components/ui/scroll-area';
import { Separator } from '@/application/components/ui/separator';
import { Briefcase, MapPin, User, Code2, Calendar, FileText } from 'lucide-react';

interface ResumePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  extractedProfile: Profile | null;
  isApplying?: boolean;
}

export function ResumePreviewModal({
  isOpen,
  onClose,
  onApply,
  extractedProfile,
  isApplying = false,
}: ResumePreviewModalProps) {
  if (!extractedProfile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resume Extraction Preview
          </DialogTitle>
          <DialogDescription>
            Review the extracted profile information from your resume before applying it to your profile.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Job Title</p>
                    <p className="text-sm font-medium">
                      {extractedProfile.job_title || 'Not found'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">
                      {extractedProfile.location || 'Not found'}
                    </p>
                  </div>
                </div>
              </div>

              {extractedProfile.bio && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Bio</p>
                    <p className="text-sm leading-relaxed">{extractedProfile.bio}</p>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Work Experience */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide">
                Work Experience ({extractedProfile.work_experience?.length || 0})
              </h3>

              {extractedProfile.work_experience && extractedProfile.work_experience.length > 0 ? (
                <div className="space-y-4">
                  {extractedProfile.work_experience.map((exp: WorkExperience, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/30">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{exp.position}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {exp.start_date} - {exp.end_date || 'Present'}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No work experience extracted
                </p>
              )}
            </div>

            <Separator />

            {/* Technologies */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm uppercase text-muted-foreground tracking-wide flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Skills ({extractedProfile.technos?.length || 0})
              </h3>

              {extractedProfile.technos && extractedProfile.technos.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {extractedProfile.technos.map((techno: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {techno}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No skills extracted
                </p>
              )}
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isApplying}>
            Cancel
          </Button>
          <Button
            onClick={onApply}
            disabled={isApplying}
            className="bg-gradient-primary text-white"
          >
            {isApplying ? 'Applying...' : 'Apply to Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
