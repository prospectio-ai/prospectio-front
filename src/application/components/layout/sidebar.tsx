import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Menu,
  X,
  Building2,
  UserCheck,
  Briefcase,
  User,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/application/components/ui/button";
import {
  sidebarVariants,
  sidebarContentVariants,
  transitions,
} from "@/lib/animations";

const navigation = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Contacts", href: "/contacts", icon: UserCheck },
  { name: "Jobs", href: "/jobs", icon: Briefcase },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Campaign", href: "/campaign", icon: Megaphone },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Get currently active nav item for layoutId
  const activeItem = navigation.find(item => location.pathname === item.href);

  return (
    <motion.div
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      variants={prefersReducedMotion ? undefined : sidebarVariants}
      className={cn(
        "flex flex-col bg-card border-r border-border card-shadow-lg",
        prefersReducedMotion && (isCollapsed ? "w-16" : "w-64"),
        "transition-colors",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              key="menu-title"
              initial={prefersReducedMotion ? false : "hidden"}
              animate="visible"
              exit="hidden"
              variants={prefersReducedMotion ? undefined : sidebarContentVariants}
              className="flex items-center space-x-3"
            >
              <span className="text-lg font-bold text-foreground">Menu</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isCollapsed ? (
                <motion.div
                  key="menu"
                  initial={prefersReducedMotion ? false : { rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={transitions.fast}
                >
                  <Menu className="h-4 w-4" />
                </motion.div>
              ) : (
                <motion.div
                  key="x"
                  initial={prefersReducedMotion ? false : { rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={transitions.fast}
                >
                  <X className="h-4 w-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "relative flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                !isActive && "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              {/* Animated background indicator */}
              {isActive && (
                <motion.div
                  layoutId={prefersReducedMotion ? undefined : "nav-indicator"}
                  className="absolute inset-0 bg-primary rounded-lg glow"
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={transitions.spring}
                />
              )}

              {/* Icon */}
              <motion.div
                className={cn(
                  "relative z-10",
                  isActive ? "text-primary-foreground" : "",
                  isCollapsed ? "" : "mr-3"
                )}
                whileHover={prefersReducedMotion ? undefined : { scale: 1.1 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
              >
                <item.icon className="h-5 w-5" />
              </motion.div>

              {/* Text */}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    key={item.name}
                    initial={prefersReducedMotion ? false : "hidden"}
                    animate="visible"
                    exit="hidden"
                    variants={prefersReducedMotion ? undefined : sidebarContentVariants}
                    className={cn(
                      "relative z-10 truncate",
                      isActive ? "text-primary-foreground" : ""
                    )}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={prefersReducedMotion ? false : "hidden"}
            animate="visible"
            exit="hidden"
            variants={prefersReducedMotion ? undefined : sidebarContentVariants}
            className="p-4 border-t border-border"
          >
            <div className="text-xs text-muted-foreground text-center">
              Prospectio v1.0
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
