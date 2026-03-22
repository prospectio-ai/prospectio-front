import { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Trash2, User, MapPin, Briefcase, Calendar, Edit3, Save, X, Code2, Upload, Loader2, Search, AlertTriangle } from 'lucide-react';
import { AnimatedPage } from '@/application/components/layout/animated-page';
import { ContentFade, FadeIn } from '@/application/components/animated/content-fade';
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardDescription,
  AnimatedCardHeader,
  AnimatedCardTitle,
} from '@/application/components/ui/animated-card';
import { AnimatedInput } from '@/application/components/ui/animated-input';
import { AnimatedButton } from '@/application/components/ui/animated-button';
import { Textarea } from '@/application/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/application/components/ui/avatar';
import { Badge } from '@/application/components/ui/badge';
import { ShimmerSkeleton, SkeletonCard } from '@/application/components/ui/shimmer-skeleton';
import { TaskProgress } from '@/application/components/ui/task-progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/application/components/ui/alert-dialog';
import { useToast } from '@/application/hooks/use-toast';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Profile as ProfileType, WorkExperience } from '@/domain/entities/profile';
import { Task, InsertLeadsRequest } from '@/domain/entities/task';
import { ResumePreviewModal } from '@/application/components/profile/ResumePreviewModal';
import { staggerItemVariants, transitions } from '@/lib/animations';

// Create singleton instance outside component to prevent recreation on each render
const backendApi = new BackendApiService();

function buildJobParams(profile: ProfileType): string[] {
  const params: string[] = [];
  if (profile.technos && profile.technos.length > 0) {
    params.push(...profile.technos);
  }
  if (profile.job_title) {
    params.push(profile.job_title);
  }
  return params;
}

function hasValidSearchCriteria(profile: ProfileType): boolean {
  return (!!profile.technos && profile.technos.length > 0) || !!profile.job_title;
}

interface PollCallbacks {
  onStatusUpdate: (taskStatus: Task) => void;
  onCompleted: (taskStatus: Task) => void;
  onFailed: (taskStatus: Task) => void;
  onTimeout: () => void;
  onError: (error: unknown) => void;
  isMounted: () => boolean;
}

function startTaskPolling(
  taskId: string,
  callbacks: PollCallbacks,
  pollInterval = 2000,
  maxAttempts = 150,
): void {
  let attempts = 0;

  const pollStatus = async (): Promise<void> => {
    if (!callbacks.isMounted()) return;
    attempts++;

    try {
      const taskStatus = await backendApi.getTaskStatus(taskId);
      callbacks.onStatusUpdate(taskStatus);

      if (taskStatus.status === 'completed') {
        callbacks.onCompleted(taskStatus);
        return;
      }

      if (taskStatus.status === 'failed') {
        callbacks.onFailed(taskStatus);
        return;
      }

      if (attempts >= maxAttempts) {
        callbacks.onTimeout();
        return;
      }

      if (callbacks.isMounted()) {
        setTimeout(pollStatus, pollInterval);
      }
    } catch (error) {
      callbacks.onError(error);
    }
  };

  setTimeout(pollStatus, pollInterval);
}

export default function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechno, setNewTechno] = useState('');
  const [extractedProfile, setExtractedProfile] = useState<ProfileType | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTask, setSearchTask] = useState<Task | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMountedRef = useRef(true);
  const { toast } = useToast();

  // Cleanup on unmount to prevent memory leaks from polling
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const buildPollCallbacks = useCallback((
    toastFn: typeof toast,
    navigateFn: typeof navigate,
  ): PollCallbacks => ({
    isMounted: () => isMountedRef.current,
    onStatusUpdate: (taskStatus) => {
      setSearchTask((prev) => ({
        ...prev,
        ...taskStatus,
        task_type: 'insert_leads',
        started_at: prev?.started_at || new Date().toISOString(),
      }));
    },
    onCompleted: (taskStatus) => {
      setIsSearching(false);
      setSearchTask((prev) => ({
        ...prev,
        ...taskStatus,
        task_type: 'insert_leads',
        completed_at: new Date().toISOString(),
      }));
      toastFn({
        title: "Search completed",
        description: taskStatus.message || "Job opportunities have been found and added to your leads.",
      });
      setTimeout(() => navigateFn('/jobs'), 1500);
    },
    onFailed: (taskStatus) => {
      setIsSearching(false);
      setSearchTask((prev) => ({
        ...prev,
        ...taskStatus,
        task_type: 'insert_leads',
        completed_at: new Date().toISOString(),
      }));
      toastFn({
        title: "Search failed",
        description: taskStatus.message || "Failed to search for opportunities.",
        variant: "destructive",
      });
    },
    onTimeout: () => {
      setIsSearching(false);
      setSearchTask((prev) => prev ? {
        ...prev,
        status: 'failed',
        message: 'Search timeout - taking longer than expected',
        completed_at: new Date().toISOString(),
      } : null);
    },
    onError: (error) => {
      setIsSearching(false);
      setSearchTask((prev) => prev ? {
        ...prev,
        status: 'failed',
        message: error instanceof Error ? error.message : 'Failed to check search status',
        completed_at: new Date().toISOString(),
      } : null);
    },
  }), []);

  // Check for running tasks on mount and resume polling if found
  useEffect(() => {
    const checkRunningTasks = async () => {
      try {
        const runningTasks = await backendApi.getRunningTasks('insert_leads');
        if (runningTasks.length === 0 || !isMountedRef.current) return;

        const task = runningTasks[0];
        const resumedTask: Task = {
          ...task,
          task_type: 'insert_leads',
          started_at: task.started_at || task.created_at || new Date().toISOString(),
        };
        setSearchTask(resumedTask);
        setIsSearching(true);

        startTaskPolling(task.task_id, buildPollCallbacks(toast, navigate));
      } catch (error) {
        // Silently fail - not critical if we can't check for running tasks
        console.error('Failed to check for running tasks:', error);
      }
    };

    checkRunningTasks();
  }, [toast, navigate]);

  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => backendApi.getProfile(),
  });

  const profile = profileData?.data;

  const { register, handleSubmit, setValue, watch, reset } = useForm<ProfileType>({
    defaultValues: profile || {
      job_title: '',
      location: '',
      bio: '',
      work_experience: [],
      technos: []
    }
  });

  const watchedExperience = watch('work_experience') || [];
  const watchedTechnos = watch('technos') || [];

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: ProfileType) => backendApi.upsertProfile(profileData),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetAllDataMutation = useMutation({
    mutationFn: () => backendApi.resetAllData(),
    onMutate: () => {
      setIsResetting(true);
    },
    onSuccess: () => {
      toast({
        title: "All data reset",
        description: "Successfully deleted all your data including profile, jobs, companies, and contacts.",
      });
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      // Reset the form to empty state
      reset({
        job_title: '',
        location: '',
        bio: '',
        work_experience: [],
        technos: []
      });
      setShowResetDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Failed to reset data. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsResetting(false);
    }
  });

  const handleResetAllData = () => {
    resetAllDataMutation.mutate();
  };

  const onSubmit = (data: ProfileType) => {
    updateProfileMutation.mutate(data);
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    };
    setValue('work_experience', [...watchedExperience, newExperience]);
  };

  const removeExperience = (index: number) => {
    const updated = watchedExperience.filter((_, i) => i !== index);
    setValue('work_experience', updated);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...watchedExperience];
    updated[index] = { ...updated[index], [field]: value };
    setValue('work_experience', updated);
  };

  const addTechno = () => {
    if (newTechno.trim() && !watchedTechnos.includes(newTechno.trim())) {
      setValue('technos', [...watchedTechnos, newTechno.trim()]);
      setNewTechno('');
    }
  };

  const removeTechno = (technoToRemove: string) => {
    const updated = watchedTechnos.filter(techno => techno !== technoToRemove);
    setValue('technos', updated);
  };

  const handleTechnoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechno();
    }
  };

  const handleEdit = () => {
    if (profile) {
      reset(profile);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset(profile);
    setIsEditing(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const result = await backendApi.uploadResume(file);
      setExtractedProfile(result.extracted_profile);
      setShowPreviewModal(true);
      toast({
        title: "Resume processed",
        description: "Your resume has been successfully analyzed.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to process resume. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyExtractedProfile = () => {
    if (!extractedProfile) return;

    // Apply extracted profile data to form
    reset(extractedProfile);
    setShowPreviewModal(false);
    setIsEditing(true);

    toast({
      title: "Profile data applied",
      description: "Review the extracted data and save when ready.",
    });
  };

  const handleSearchOpportunities = useCallback(async () => {
    // Validate profile has required fields
    if (!profile?.location) {
      toast({
        title: "Location required",
        description: "Please add a location to your profile before searching for opportunities.",
        variant: "destructive",
      });
      return;
    }

    if (!hasValidSearchCriteria(profile)) {
      toast({
        title: "Skills or job title required",
        description: "Please add skills or a job title to your profile before searching for opportunities.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchTask(null);

    try {
      const request: InsertLeadsRequest = {
        source: 'jsearch',
        location: profile.location,
        job_params: buildJobParams(profile),
      };

      toast({
        title: "Starting opportunity search",
        description: "Searching for job opportunities matching your profile...",
      });

      const task = await backendApi.insertLeads(request);

      const initialTask: Task = {
        ...task,
        task_type: 'insert_leads',
        started_at: new Date().toISOString(),
      };
      setSearchTask(initialTask);

      const baseCallbacks = buildPollCallbacks(toast, navigate);
      startTaskPolling(task.task_id, {
        ...baseCallbacks,
        onTimeout: () => {
          baseCallbacks.onTimeout();
          toast({
            title: "Search timeout",
            description: "The search is taking longer than expected. Please check the jobs page later.",
            variant: "destructive",
          });
        },
        onError: (error) => {
          baseCallbacks.onError(error);
          toast({
            title: "Error checking status",
            description: error instanceof Error ? error.message : "Failed to check search status.",
            variant: "destructive",
          });
        },
      });
    } catch (error) {
      setIsSearching(false);
      setSearchTask(null);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Failed to start opportunity search. Please try again.",
        variant: "destructive",
      });
    }
  }, [profile, toast, navigate]);

  const loadingSkeleton = (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-8 w-48" rounded="md" />
      <SkeletonCard lines={4} />
      <SkeletonCard lines={6} />
      <SkeletonCard lines={3} />
    </div>
  );

  return (
    <AnimatedPage>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept=".pdf"
          className="hidden"
        />

        {/* Resume Preview Modal */}
        <ResumePreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          onApply={handleApplyExtractedProfile}
          extractedProfile={extractedProfile}
          isApplying={updateProfileMutation.isPending}
        />

        {/* Header */}
        <FadeIn className="mb-8 flex justify-center items-start">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit-actions"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={transitions.smooth}
                className="flex gap-2"
              >
                <AnimatedButton
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateProfileMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </AnimatedButton>
                <AnimatedButton
                  onClick={handleSubmit(onSubmit)}
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-primary text-white"
                  animationStyle="glow"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
                </AnimatedButton>
              </motion.div>
            ) : (
              <motion.div
                key="view-actions"
                initial={prefersReducedMotion ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={transitions.smooth}
                className="flex gap-2"
              >
                <AnimatedButton
                  variant="outline"
                  onClick={handleSearchOpportunities}
                  disabled={isSearching || isUploading}
                  className="border-primary/50 hover:border-primary hover:bg-primary/5"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search Opportunities
                    </>
                  )}
                </AnimatedButton>
                <AnimatedButton
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={isUploading || isSearching}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume (PDF)
                    </>
                  )}
                </AnimatedButton>
                <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                  <AlertDialogTrigger asChild>
                    <AnimatedButton
                      variant="outline"
                      disabled={isSearching || isUploading || isResetting}
                      className="border-destructive/50 text-destructive hover:border-destructive hover:bg-destructive/5"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset All Data
                        </>
                      )}
                    </AnimatedButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <AlertDialogTitle className="text-xl">Reset All Data?</AlertDialogTitle>
                      </div>
                      <AlertDialogDescription className="pt-3 text-base">
                        This action cannot be undone. This will permanently delete:
                        <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />{' '}
                            Your profile information
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />{' '}
                            All saved job opportunities
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />{' '}
                            All companies and contacts
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />{' '}
                            All generated messages
                          </li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
                      <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleResetAllData}
                        disabled={isResetting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isResetting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Yes, delete everything
                          </>
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <AnimatedButton
                  onClick={handleEdit}
                  disabled={isSearching}
                  className="bg-gradient-primary text-white"
                  animationStyle="glow"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </AnimatedButton>
              </motion.div>
            )}
          </AnimatePresence>
        </FadeIn>

        {/* Task Progress Display */}
        <AnimatePresence>
          {searchTask && (
            <FadeIn className="mb-6">
              <AnimatedCard disableHover>
                <AnimatedCardContent className="p-0">
                  <TaskProgress
                    task={searchTask}
                    taskLabel="Searching Job Opportunities"
                    showElapsedTime
                    showItemsCounter
                  />
                </AnimatedCardContent>
              </AnimatedCard>
            </FadeIn>
          )}
        </AnimatePresence>

        <ContentFade isLoading={isLoading} skeleton={loadingSkeleton}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <FadeIn delay={0.1}>
              <AnimatedCard disableHover>
                <AnimatedCardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback className="bg-gradient-primary text-white text-xl">
                        <User className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <AnimatedCardTitle className="text-xl">Basic Information</AnimatedCardTitle>
                      <AnimatedCardDescription>
                        Your professional identity and contact details
                      </AnimatedCardDescription>
                    </div>
                  </div>
                </AnimatedCardHeader>
                <AnimatedCardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="job_title" className="text-sm font-medium">Job Title</label>
                      {isEditing ? (
                        <AnimatedInput
                          id="job_title"
                          {...register('job_title')}
                          placeholder="e.g., Senior Full Stack Developer"
                        />
                      ) : (
                        <div className="flex items-center text-sm">
                          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                          {profile?.job_title || 'Not specified'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="location" className="text-sm font-medium">Location</label>
                      {isEditing ? (
                        <AnimatedInput
                          id="location"
                          {...register('location')}
                          placeholder="e.g., FR, Paris"
                        />
                      ) : (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          {profile?.location || 'Not specified'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">Professional Bio</label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        {...register('bio')}
                        placeholder="Tell us about your professional background, skills, and interests..."
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile?.bio || 'No bio provided'}
                      </p>
                    )}
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </FadeIn>

            {/* Work Experience */}
            <FadeIn delay={0.2}>
              <AnimatedCard disableHover>
                <AnimatedCardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <AnimatedCardTitle className="text-xl">Work Experience</AnimatedCardTitle>
                      <AnimatedCardDescription>
                        Your professional background and career history
                      </AnimatedCardDescription>
                    </div>
                    {isEditing && (
                      <AnimatedButton type="button" onClick={addExperience} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                      </AnimatedButton>
                    )}
                  </div>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  {isEditing ? (
                    <div className="space-y-6">
                      <AnimatePresence mode="popLayout">
                        {watchedExperience.map((exp, index) => (
                          <motion.div
                            key={`${exp.company}-${exp.position}-${index}`}
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={transitions.smooth}
                            layout
                            className="p-4 border rounded-lg space-y-4"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium">Experience {index + 1}</h4>
                              <AnimatedButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeExperience(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </AnimatedButton>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <AnimatedInput
                                placeholder="Company name"
                                value={exp.company}
                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                              />
                              <AnimatedInput
                                placeholder="Position/Role"
                                value={exp.position}
                                onChange={(e) => updateExperience(index, 'position', e.target.value)}
                              />
                              <AnimatedInput
                                placeholder="Start date (YYYY-MM)"
                                value={exp.start_date}
                                onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                              />
                              <AnimatedInput
                                placeholder="End date (YYYY-MM) or leave empty for current"
                                value={exp.end_date || ''}
                                onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                              />
                            </div>

                            <Textarea
                              placeholder="Description of responsibilities and achievements..."
                              value={exp.description || ''}
                              onChange={(e) => updateExperience(index, 'description', e.target.value)}
                              rows={3}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {watchedExperience.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Briefcase className="h-8 w-8 mx-auto mb-2" />
                          <p>No work experience added yet</p>
                          <p className="text-sm">Click "Add Experience" to get started</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {profile?.work_experience && profile.work_experience.length > 0 ? (
                        profile.work_experience.map((exp, index) => (
                          <motion.div
                            key={`${exp.company}-${exp.position}-${index}`}
                            variants={prefersReducedMotion ? undefined : staggerItemVariants}
                            className="flex space-x-4"
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                              <Briefcase className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="font-medium">{exp.position}</h4>
                                <span className="text-muted-foreground">at</span>
                                <span className="font-medium">{exp.company}</span>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {exp.start_date} - {exp.end_date || 'Present'}
                                </div>
                              </div>
                              {exp.description && (
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {exp.description}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Briefcase className="h-8 w-8 mx-auto mb-2" />
                          <p>No work experience added yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatedCardContent>
              </AnimatedCard>
            </FadeIn>

            {/* Technologies */}
            <FadeIn delay={0.3}>
              <AnimatedCard disableHover>
                <AnimatedCardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <AnimatedCardTitle className="text-xl">Skills</AnimatedCardTitle>
                      <AnimatedCardDescription>
                        Programming languages, frameworks, and tools you work with
                      </AnimatedCardDescription>
                    </div>
                  </div>
                </AnimatedCardHeader>
                <AnimatedCardContent>
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <AnimatedInput
                          placeholder="Add a skill (e.g., React, Python, AWS...)"
                          value={newTechno}
                          onChange={(e) => setNewTechno(e.target.value)}
                          onKeyDown={handleTechnoKeyPress}
                          className="flex-1"
                        />
                        <AnimatedButton type="button" onClick={addTechno} variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </AnimatedButton>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <AnimatePresence mode="popLayout">
                          {watchedTechnos.map((techno) => (
                            <motion.div
                              key={techno}
                              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={transitions.fast}
                              layout
                            >
                              <Badge variant="secondary" className="flex items-center gap-1">
                                {techno}
                                <button
                                  type="button"
                                  onClick={() => removeTechno(techno)}
                                  className="ml-1 hover:text-destructive transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                      {watchedTechnos.length === 0 && (
                        <div className="text-center py-6 text-muted-foreground">
                          <Code2 className="h-8 w-8 mx-auto mb-2" />
                          <p>No technologies added yet</p>
                          <p className="text-sm">Add your skills above</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {profile?.technos && profile.technos.length > 0 ? (
                        <motion.div
                          className="flex flex-wrap gap-2"
                          initial="initial"
                          animate="animate"
                          variants={prefersReducedMotion ? undefined : {
                            animate: {
                              transition: { staggerChildren: 0.05 }
                            }
                          }}
                        >
                          {profile.technos.map((techno) => (
                            <motion.div
                              key={techno}
                              variants={prefersReducedMotion ? undefined : staggerItemVariants}
                            >
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Code2 className="h-3 w-3" />
                                {techno}
                              </Badge>
                            </motion.div>
                          ))}
                        </motion.div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <Code2 className="h-8 w-8 mx-auto mb-2" />
                          <p>No technologies added yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </AnimatedCardContent>
              </AnimatedCard>
            </FadeIn>
          </form>
        </ContentFade>
      </div>
    </AnimatedPage>
  );
}
