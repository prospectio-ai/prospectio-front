import { cn } from "@/lib/utils";
import { LeadStatus } from "@/domain/entities/types";

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusConfig = {
  cold: {
    label: 'Cold',
    className: 'status-cold',
  },
  warm: {
    label: 'Warm', 
    className: 'status-warm',
  },
  hot: {
    label: 'Hot',
    className: 'status-hot',
  },
};

export function StatusBadge({ status, className }: Readonly<StatusBadgeProps>) {
  const config = statusConfig[status];
  
  return (
    <span className={cn(
      "status-badge",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}