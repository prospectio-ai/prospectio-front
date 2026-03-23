import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Send,
  Copy,
  Mail,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Plus,
  Users,
  Calendar,
  Clock,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { AnimatedPage } from '@/application/components/layout/animated-page';
import { AnimatedList, AnimatedGridItem } from '@/application/components/animated/animated-grid';
import { ContentFade, FadeIn } from '@/application/components/animated/content-fade';
import {
  AnimatedCard,
  AnimatedCardContent,
  AnimatedCardHeader,
  AnimatedCardTitle,
} from '@/application/components/ui/animated-card';
import { AnimatedButton } from '@/application/components/ui/animated-button';
import { AnimatedInput } from '@/application/components/ui/animated-input';
import { Badge } from '@/application/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/application/components/ui/select';
import { ShimmerSkeleton, SkeletonCard } from '@/application/components/ui/shimmer-skeleton';
import { TaskProgress } from '@/application/components/ui/task-progress';
import { useToast } from '@/application/hooks/use-toast';
import { useCampaignStream } from '@/application/hooks/useCampaignStream';
import { useCampaignPagination, PAGE_SIZE } from '@/application/hooks/useCampaignPagination';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Campaign, CampaignMessage } from '@/domain/entities/campaign';
import { Task } from '@/domain/entities/task';
import { cn } from '@/lib/utils';

// Create singleton instance outside component to prevent recreation on each render
const backendApi = new BackendApiService();

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getTaskMessage(
  progress: { current: number; total: number; currentContactName?: string } | null,
  isCompleted: boolean,
  streamResult: { successful: number; failed: number } | null,
  error: string | null
): string {
  if (progress) {
    const contactName = progress.currentContactName || 'contact';
    return `Generating message ${progress.current}/${progress.total} for ${contactName}`;
  }
  if (isCompleted && streamResult) {
    return `Campaign completed: ${streamResult.successful} successful, ${streamResult.failed} failed`;
  }
  if (error) {
    return `Error: ${error}`;
  }
  return 'Starting campaign generation...';
}

export default function ProspectCampaign() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prefersReducedMotion = useReducedMotion();

  // Campaign selection state
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState<string>('');
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  // SSE streaming hook for campaign generation
  const {
    isStreaming,
    campaignId: streamingCampaignId,
    progress: streamProgress,
    messages: streamedMessages,
    error: streamError,
    isCompleted: streamCompleted,
    result: streamResult,
    startStream,
    retryStream,
  } = useCampaignStream({
    onComplete: (result) => {
      toast({
        title: "Campaign Complete",
        description: `Generated ${result?.successful} messages successfully!`,
      });
      refetchCampaigns();
      queryClient.invalidateQueries({ queryKey: ['newContacts'] });
      // Select the new campaign after a small delay to allow refetch
      // Use campaignId from result to avoid stale closure issue
      if (result?.campaignId) {
        setTimeout(() => setSelectedCampaignId(result.campaignId), 500);
      }
    },
    onError: (error) => {
      toast({
        title: "Campaign Failed",
        description: error,
        variant: "destructive",
      });
    },
  });

  // Fetch campaigns list
  const { data: campaignsData, isLoading: isLoadingCampaigns, refetch: refetchCampaigns } = useQuery({
    queryKey: ['campaigns', 0, 100],
    queryFn: () => backendApi.getCampaigns(0, 100),
  });

  const campaigns = campaignsData?.campaigns || [];

  // Fetch new contacts count (contacts without messages)
  const { data: newContactsData, isLoading: isLoadingNewContacts } = useQuery({
    queryKey: ['newContacts', 0, 1],
    queryFn: () => backendApi.getNewContacts(0, 1),
  });

  const newContactsCount = newContactsData?.contacts?.length ?? 0;
  const newContactsPages = newContactsData?.pages ?? 0;
  // Total new contacts is approximated by pages count (each page has limit items)
  const totalNewContacts = newContactsPages > 0 ? newContactsPages : newContactsCount;

  // Get selected campaign details
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  // Fetch campaign messages when a campaign is selected
  // We use a ref to track current offset since the hook manages offset state
  const [queryOffset, setQueryOffset] = useState(0);

  // Reset query offset when campaign changes
  useEffect(() => {
    setQueryOffset(0);
  }, [selectedCampaignId]);

  // Fetch campaign messages with pagination
  const { data: campaignMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['campaignMessages', selectedCampaignId, queryOffset, PAGE_SIZE],
    queryFn: () => selectedCampaignId
      ? backendApi.getCampaignMessages(selectedCampaignId, queryOffset, PAGE_SIZE)
      : Promise.resolve([]),
    enabled: !!selectedCampaignId && !isStreaming,
  });

  // Campaign pagination hook - manages accumulation and display logic
  const {
    displayMessages,
    isLoadingMore,
    hasMore,
    handleLoadMore: paginationHandleLoadMore,
  } = useCampaignPagination({
    selectedCampaignId,
    campaignMessages,
    isStreaming,
    streamCompleted,
    streamedMessages,
    totalContacts: selectedCampaign?.total_contacts ?? 0,
  });

  // Handle loading more messages - updates both hook state and query offset
  const handleLoadMore = useCallback(() => {
    paginationHandleLoadMore();
    setQueryOffset(prev => prev + PAGE_SIZE);
  }, [paginationHandleLoadMore]);

  // Build current task object from stream state for TaskProgress component
  const getStreamStatus = (): Task['status'] => {
    if (streamCompleted) return 'completed';
    if (streamError) return 'failed';
    return 'in_progress';
  };

  const currentTask: Task | null = (isStreaming || streamCompleted || streamError)
    ? {
        task_id: streamingCampaignId || '',
        message: getTaskMessage(streamProgress, streamCompleted, streamResult, streamError),
        status: getStreamStatus(),
        task_type: 'generate_campaign',
        progress: streamProgress
          ? {
              current: streamProgress.current,
              total: streamProgress.total,
              percentage: streamProgress.percentage,
            }
          : undefined,
        started_at: new Date().toISOString(),
        completed_at: streamCompleted ? new Date().toISOString() : undefined,
      }
    : null;

  const handleGenerateCampaign = () => {
    if (!campaignName.trim()) {
      toast({
        title: "Campaign Name Required",
        description: "Please enter a name for your campaign",
        variant: "destructive",
      });
      return;
    }

    if (totalNewContacts === 0) {
      toast({
        title: "No New Contacts",
        description: "Add some contacts first before generating a campaign",
        variant: "destructive",
      });
      return;
    }

    // Use SSE streaming for campaign generation
    startStream(campaignName.trim());
    setCampaignName('');
    toast({
      title: "Campaign Generation Started",
      description: `Creating "${campaignName}" with personalized messages...`,
    });
  };

  const handleRetryCampaign = () => {
    if (!selectedCampaign) return;
    retryStream(selectedCampaign.id);
    toast({
      title: "Retry Started",
      description: `Retrying failed messages for "${selectedCampaign.name}"...`,
    });
  };

  const handleCopyMessage = (message: CampaignMessage) => {
    const fullMessage = `Subject: ${message.subject}\n\n${message.message}`;
    navigator.clipboard.writeText(fullMessage);
    toast({
      title: "Copied!",
      description: "Message copied to clipboard",
    });
  };

  const handleSendEmail = (message: CampaignMessage) => {
    if (!message.contact_email || message.contact_email.length === 0) {
      toast({
        title: "No Email",
        description: "This contact has no email address",
        variant: "destructive",
      });
      return;
    }

    const subject = encodeURIComponent(message.subject);
    const body = encodeURIComponent(message.message);
    const mailtoUrl = `mailto:${message.contact_email[0]}?subject=${subject}&body=${body}`;
    globalThis.location.href = mailtoUrl;
  };

  const toggleMessageExpansion = (contactId: string) => {
    setExpandedMessages(prev => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  const getStatusIcon = (status: CampaignMessage['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: CampaignMessage['status']) => {
    const variants = {
      success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      skipped: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return variants[status];
  };

  const getCampaignStatusBadge = (status: Campaign['status']) => {
    const variants = {
      draft: { class: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300', label: 'Draft' },
      in_progress: { class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: 'Generating' },
      completed: { class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: 'Completed' },
      failed: { class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: 'Failed' },
    };
    return variants[status] || variants.draft;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isGenerating = isStreaming;

  const loadingSkeleton = (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-32 w-full" rounded="lg" />
      <div className="space-y-4">
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={3} />
      </div>
    </div>
  );

  return (
    <AnimatedPage>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header Section */}
        <FadeIn className="mb-10">
          <div className="relative">
            {/* Decorative gradient orb */}
            <div
              className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
              }}
            />

            <div className="relative flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
                  <Megaphone className="h-7 w-7 text-white" />
                </div>
                {/* Animated ring */}
                {!prefersReducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-primary/50"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Prospect Campaign
                </h1>
                <p className="text-muted-foreground text-lg mt-1">
                  Generate personalized outreach messages at scale
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        <ContentFade
          isLoading={isLoadingCampaigns || isLoadingNewContacts}
          skeleton={loadingSkeleton}
          contentKey="campaign-content"
        >
          {/* Campaign Selector Section */}
          <FadeIn delay={0.05} className="mb-6">
            <AnimatedCard disableHover className="overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
              <AnimatedCardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Campaign Selector */}
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      Select Campaign
                    </label>
                    <Select
                      value={selectedCampaignId || ''}
                      onValueChange={(value) => setSelectedCampaignId(value || null)}
                    >
                      <SelectTrigger className="w-full h-12 text-base">
                        <SelectValue placeholder="Choose an existing campaign..." />
                      </SelectTrigger>
                      <SelectContent>
                        {campaigns.length === 0 ? (
                          <div className="py-4 px-3 text-center text-muted-foreground text-sm">
                            No campaigns yet. Create your first one below.
                          </div>
                        ) : (
                          campaigns.map((campaign) => {
                            const statusInfo = getCampaignStatusBadge(campaign.status);
                            return (
                              <SelectItem key={campaign.id} value={campaign.id}>
                                <div className="flex items-center gap-3">
                                  <span className="font-medium">{campaign.name}</span>
                                  <Badge className={cn("text-xs", statusInfo.class)}>
                                    {statusInfo.label}
                                  </Badge>
                                  <span className="text-muted-foreground text-xs">
                                    {campaign.successful}/{campaign.total_contacts}
                                  </span>
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* New Contacts Badge */}
                  <div className="lg:w-48 flex-shrink-0">
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      New Contacts
                    </label>
                    <div className="h-12 flex items-center justify-center rounded-lg border border-dashed border-primary/30 bg-primary/5">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          {totalNewContacts}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedCardContent>
            </AnimatedCard>
          </FadeIn>

          {/* Selected Campaign Details */}
          {selectedCampaign && !isGenerating && (() => {
            const statusBadge = getCampaignStatusBadge(selectedCampaign.status);
            return (
            <FadeIn delay={0.1} className="mb-6">
              <AnimatedCard disableHover className="border-l-4 border-l-primary">
                <AnimatedCardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        {selectedCampaign.name}
                        <Badge className={statusBadge.class}>
                          {statusBadge.label}
                        </Badge>
                      </h3>
                      {selectedCampaign.description && (
                        <p className="text-muted-foreground mt-1">{selectedCampaign.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(selectedCampaign.created_at)}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground tabular-nums">
                            {selectedCampaign.total_contacts}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">Total</div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-500 tabular-nums">
                            {selectedCampaign.successful}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">Success</div>
                        </div>
                        <div className="w-px h-8 bg-border" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-500 tabular-nums">
                            {selectedCampaign.failed}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase">Failed</div>
                        </div>
                      </div>
                      {/* Retry Failed Button */}
                      {selectedCampaign.failed > 0 &&
                        (selectedCampaign.status === 'completed' || selectedCampaign.status === 'failed') &&
                        !isStreaming && (
                          <AnimatedButton
                            variant="outline"
                            size="sm"
                            onClick={handleRetryCampaign}
                            className="ml-4 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Retry failed
                          </AnimatedButton>
                      )}
                    </div>
                  </div>
                </AnimatedCardContent>
              </AnimatedCard>
            </FadeIn>
            );
          })()}

          {/* New Campaign Creation Section */}
          <FadeIn delay={0.1} className="mb-8">
            <AnimatedCard disableHover className="overflow-hidden">
              <div className="h-1 bg-gradient-primary" />
              <AnimatedCardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-end gap-6">
                  {/* Campaign Name Input */}
                  <div className="flex-1 w-full">
                    <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                      Create New Campaign
                    </label>
                    <AnimatedInput
                      placeholder="Enter campaign name (e.g., Q1 2024 Outreach)..."
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      disabled={isGenerating}
                      className="h-14 text-lg"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      This will generate messages for all {totalNewContacts} new contacts
                    </p>
                  </div>

                  {/* Generate Button */}
                  <AnimatedButton
                    size="lg"
                    animationStyle="glow"
                    onClick={handleGenerateCampaign}
                    disabled={isGenerating || totalNewContacts === 0 || !campaignName.trim()}
                    className="bg-gradient-primary text-white px-8 h-14 text-lg font-semibold shadow-xl hover:shadow-2xl transition-shadow whitespace-nowrap"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Generate Campaign
                      </>
                    )}
                  </AnimatedButton>
                </div>

                {/* Task Progress during generation */}
                <AnimatePresence>
                  {currentTask && (isGenerating || currentTask.status === 'completed' || currentTask.status === 'failed') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8"
                    >
                      <TaskProgress
                        task={currentTask}
                        taskLabel="Generating Campaign Messages"
                        showElapsedTime
                        showItemsCounter
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedCardContent>
            </AnimatedCard>
          </FadeIn>

          {/* Live Messages During Generation */}
          {isGenerating && streamedMessages.length > 0 && (
            <FadeIn delay={0.15} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-foreground flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-5 w-5 text-primary" />
                  </motion.div>
                  Live Progress
                </h2>
                <Badge variant="secondary" className="text-sm px-3 py-1 animate-pulse">
                  {streamedMessages.length} messages generated
                </Badge>
              </div>
            </FadeIn>
          )}

          {/* Generated Messages */}
          {displayMessages.length > 0 && (
            <FadeIn delay={0.2}>
              {!isGenerating && (
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-foreground">
                    {selectedCampaignId ? 'Campaign Messages' : 'Generated Messages'}
                  </h2>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {displayMessages.length} of {selectedCampaign?.total_contacts ?? displayMessages.length} messages
                  </Badge>
                </div>
              )}

              <AnimatedList gap="md">
                {displayMessages.map((message, index) => {
                  const isExpanded = expandedMessages.has(message.contact_id);
                  const isNew = isGenerating && index >= displayMessages.length - 3;

                  return (
                    <AnimatedGridItem key={message.id || message.contact_id || index}>
                      <motion.div
                        initial={isNew ? { opacity: 0, y: 20, scale: 0.95 } : false}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <AnimatedCard
                          className={cn(
                            "transition-all duration-300",
                            message.status === 'success' && "border-l-4 border-l-emerald-500",
                            message.status === 'failed' && "border-l-4 border-l-red-500",
                            message.status === 'skipped' && "border-l-4 border-l-amber-500",
                            isNew && "ring-2 ring-primary/30"
                          )}
                        >
                          <AnimatedCardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(message.status)}
                                <div>
                                  <AnimatedCardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    {message.contact_name
                                      ? capitalize(message.contact_name)
                                      : 'Unknown Contact'
                                    }
                                  </AnimatedCardTitle>
                                  {message.company_name && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                      <Building2 className="h-3.5 w-3.5" />
                                      {capitalize(message.company_name)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {message.created_at && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {new Date(message.created_at).toLocaleTimeString()}
                                  </span>
                                )}
                                <Badge className={getStatusBadge(message.status)}>
                                  {capitalize(message.status)}
                                </Badge>
                              </div>
                            </div>
                          </AnimatedCardHeader>

                          <AnimatedCardContent className="space-y-4">
                            {message.status === 'success' && (
                              <>
                                {/* Subject Line */}
                                <div className="bg-muted/50 rounded-lg p-4">
                                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                                    Subject
                                  </div>
                                  <div className="font-medium text-foreground">
                                    {message.subject}
                                  </div>
                                </div>

                                {/* Message Preview/Full */}
                                <div>
                                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                    Message
                                  </div>
                                  <div
                                    className={cn(
                                      "text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed",
                                      !isExpanded && "line-clamp-3"
                                    )}
                                  >
                                    {message.message}
                                  </div>

                                  {message.message.length > 200 && (
                                    <button
                                      onClick={() => toggleMessageExpansion(message.contact_id)}
                                      className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 mt-2 transition-colors"
                                    >
                                      {isExpanded ? (
                                        <>
                                          <ChevronUp className="h-4 w-4" />
                                          Show less
                                        </>
                                      ) : (
                                        <>
                                          <ChevronDown className="h-4 w-4" />
                                          Show more
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2 border-t border-border">
                                  <AnimatedButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCopyMessage(message)}
                                    className="flex-1"
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy
                                  </AnimatedButton>
                                  <AnimatedButton
                                    size="sm"
                                    animationStyle="glow"
                                    onClick={() => handleSendEmail(message)}
                                    disabled={!message.contact_email || message.contact_email.length === 0}
                                    className="flex-1 bg-gradient-primary text-white"
                                  >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Send Email
                                  </AnimatedButton>
                                </div>
                              </>
                            )}

                            {message.status === 'failed' && message.error && (
                              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
                                <span className="font-medium">Error:</span> {message.error}
                              </div>
                            )}

                            {message.status === 'skipped' && (
                              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-sm text-amber-600 dark:text-amber-400">
                                This contact was skipped during generation.
                                {message.error && <span> Reason: {message.error}</span>}
                              </div>
                            )}
                          </AnimatedCardContent>
                        </AnimatedCard>
                      </motion.div>
                    </AnimatedGridItem>
                  );
                })}
              </AnimatedList>

              {/* Load More Button */}
              {!isStreaming && selectedCampaign && hasMore && (
                <FadeIn delay={0.1} className="flex justify-center mt-6">
                  <AnimatedButton
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Load More Messages
                      </>
                    )}
                  </AnimatedButton>
                </FadeIn>
              )}
            </FadeIn>
          )}

          {/* Empty State */}
          {!selectedCampaignId && !isGenerating && !streamCompleted && displayMessages.length === 0 && (
            <FadeIn delay={0.2} className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="w-24 h-24 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto">
                  <Send className="h-12 w-12 text-muted-foreground" />
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gradient-primary opacity-60" />
                <div className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full bg-gradient-primary opacity-40" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Ready to Launch Your Campaign
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {campaigns.length > 0 && "Select an existing campaign above to view its messages, or create a new one."}
                {campaigns.length === 0 && totalNewContacts > 0 && `You have ${totalNewContacts} new contacts ready. Enter a campaign name above and click "Generate Campaign" to create personalized outreach messages.`}
                {campaigns.length === 0 && totalNewContacts === 0 && "Add some contacts first to start generating personalized campaign messages."}
              </p>
            </FadeIn>
          )}

          {/* Loading Messages State */}
          {selectedCampaignId && isLoadingMessages && (
            <FadeIn delay={0.2}>
              <div className="space-y-4">
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
                <SkeletonCard lines={3} />
              </div>
            </FadeIn>
          )}
        </ContentFade>
      </div>
    </AnimatedPage>
  );
}
