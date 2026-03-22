import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { Progress } from '@/application/components/ui/progress';
import { cn } from '@/lib/utils';
import type { Task } from '@/domain/entities/task';

interface TaskProgressProps {
  /** The task to display progress for */
  task: Task;
  /** Optional className for the container */
  className?: string;
  /** Whether to show elapsed time */
  showElapsedTime?: boolean;
  /** Whether to show the items counter (X/Y) */
  showItemsCounter?: boolean;
  /** Custom label for the task type */
  taskLabel?: string;
}

/**
 * TaskProgress - Displays real-time progress for async tasks
 *
 * Features:
 * - Animated progress bar with percentage
 * - Current step message display
 * - Items processed counter (X/Y items)
 * - Elapsed time calculation
 * - Status icons (spinner for running, checkmark for complete, X for failed)
 * - Error details display if failed
 * - Respects reduced motion preferences
 * - Uses Prospectio golden design system
 */
export function TaskProgress({
  task,
  className,
  showElapsedTime = true,
  showItemsCounter = true,
  taskLabel,
}: TaskProgressProps) {
  const prefersReducedMotion = useReducedMotion();
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const startTimeRef = React.useRef<number | null>(null);

  // Calculate elapsed time
  React.useEffect(() => {
    const isRunning = task.status === 'processing' || task.status === 'in_progress' || task.status === 'pending';

    if (isRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = task.started_at ? new Date(task.started_at).getTime() : Date.now();
      }

      const interval = setInterval(() => {
        const now = Date.now();
        const start = startTimeRef.current ?? now;
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);

      return () => clearInterval(interval);
    } else if (task.status === 'completed' || task.status === 'failed') {
      // Calculate final elapsed time
      if (task.started_at && task.completed_at) {
        const start = new Date(task.started_at).getTime();
        const end = new Date(task.completed_at).getTime();
        setElapsedTime(Math.floor((end - start) / 1000));
      }
    }
  }, [task.status, task.started_at, task.completed_at]);

  // Format elapsed time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Get status configuration
  const getStatusConfig = () => {
    switch (task.status) {
      case 'pending':
        return {
          icon: Clock,
          iconClass: 'text-muted-foreground',
          bgClass: 'bg-muted/50',
          borderClass: 'border-border',
          label: 'Pending',
          isAnimating: false,
        };
      case 'processing':
      case 'in_progress':
        return {
          icon: Loader2,
          iconClass: 'text-primary',
          bgClass: 'bg-primary/5',
          borderClass: 'border-primary/30',
          label: 'Processing',
          isAnimating: true,
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          iconClass: 'text-emerald-500',
          bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
          borderClass: 'border-emerald-200 dark:border-emerald-800',
          label: 'Completed',
          isAnimating: false,
        };
      case 'failed':
        return {
          icon: XCircle,
          iconClass: 'text-red-500',
          bgClass: 'bg-red-50 dark:bg-red-900/20',
          borderClass: 'border-red-200 dark:border-red-800',
          label: 'Failed',
          isAnimating: false,
        };
      default:
        return {
          icon: Clock,
          iconClass: 'text-muted-foreground',
          bgClass: 'bg-muted/50',
          borderClass: 'border-border',
          label: 'Unknown',
          isAnimating: false,
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;
  const progress = task.progress;
  const percentage = progress?.percentage ?? 0;
  const isRunning = task.status === 'processing' || task.status === 'in_progress';

  // Animation variants
  const containerVariants = {
    initial: { opacity: 0, y: -10, scale: 0.98 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.98,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  };

  const shimmerVariants = {
    animate: {
      x: ['0%', '100%'],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const content = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 transition-all duration-300',
        statusConfig.bgClass,
        statusConfig.borderClass,
        className
      )}
    >
      {/* Animated shimmer overlay for running state */}
      {isRunning && !prefersReducedMotion && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
            variants={shimmerVariants}
            animate="animate"
            style={{ left: '-8rem' }}
          />
        </motion.div>
      )}

      {/* Header row */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Status icon with pulse effect */}
          <div className="relative flex-shrink-0">
            {isRunning && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20"
                variants={pulseVariants}
                animate="animate"
              />
            )}
            <div
              className={cn(
                'relative flex h-10 w-10 items-center justify-center rounded-full',
                isRunning ? 'bg-primary/10' : 'bg-muted/50'
              )}
            >
              <StatusIcon
                className={cn(
                  'h-5 w-5',
                  statusConfig.iconClass,
                  statusConfig.isAnimating && 'animate-spin'
                )}
              />
            </div>
          </div>

          {/* Task info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-foreground truncate">
                {taskLabel || getTaskTypeLabel(task.task_type)}
              </h4>
              <span
                className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  task.status === 'completed' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                  task.status === 'failed' && 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                  (task.status === 'processing' || task.status === 'in_progress') && 'bg-primary/10 text-primary',
                  task.status === 'pending' && 'bg-muted text-muted-foreground'
                )}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {task.message}
            </p>
          </div>
        </div>

        {/* Timer & Counter */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {showElapsedTime && elapsedTime > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span className="tabular-nums font-medium">{formatTime(elapsedTime)}</span>
            </div>
          )}
          {showItemsCounter && progress && progress.total > 0 && (
            <div className="text-sm font-medium tabular-nums">
              <span className="text-foreground">{progress.current}</span>
              <span className="text-muted-foreground"> / {progress.total}</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress section */}
      {(isRunning || task.status === 'completed') && progress && (
        <div className="space-y-2">
          {/* Progress bar container */}
          <div className="relative">
            <Progress
              value={percentage}
              className={cn(
                'h-2.5',
                task.status === 'completed' && '[&>div]:bg-emerald-500'
              )}
            />

            {/* Animated shimmer on progress bar */}
            {isRunning && !prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-4rem', '200%'] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              </motion.div>
            )}
          </div>

          {/* Percentage display */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span
              className={cn(
                'font-semibold tabular-nums',
                task.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'
              )}
            >
              {Math.round(percentage)}%
            </span>
          </div>
        </div>
      )}

      {/* Indeterminate progress for pending/processing without progress data */}
      {isRunning && !progress && (
        <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
          <motion.div
            className="absolute inset-y-0 w-1/3 rounded-full bg-gradient-to-r from-primary/50 via-primary to-primary/50"
            animate={{
              x: ['-100%', '400%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
      )}

      {/* Error details */}
      <AnimatePresence>
        {task.status === 'failed' && task.error_details && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-100/50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  Error Details
                </p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 break-words">
                  {task.error_details}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Wrap with AnimatePresence for enter/exit animations
  if (prefersReducedMotion) {
    return content;
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      layout
    >
      {content}
    </motion.div>
  );
}

/**
 * Helper function to get human-readable task type labels
 */
function getTaskTypeLabel(taskType?: string): string {
  switch (taskType) {
    case 'insert_leads':
      return 'Searching Opportunities';
    case 'generate_campaign':
      return 'Generating Campaign';
    default:
      return 'Task Progress';
  }
}

export default TaskProgress;
