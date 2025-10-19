import { Bell, Search, User } from "lucide-react";
import { ThemeToggle } from "@/application/components/ui/theme-toggle";
import { Button } from "@/application/components/ui/button";
import { Input } from "@/application/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/application/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/application/components/ui/avatar";
import { IdTokenClaims, useLogto } from '@logto/react';
import { useEffect, useState } from "react";
import { CallbackConfig } from "@/domain/entities/callbackConfig";
import { ConfigRepository } from "@/infrastructure/services/configRepository";

interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const configRepository = new ConfigRepository();


export function Header({ title, description, children }: HeaderProps) {
  const { isAuthenticated, signIn, signOut, getIdTokenClaims, isLoading } = useLogto();
  const [user, setUser] = useState<IdTokenClaims>();
  const [config, setConfig] = useState<CallbackConfig | null>(null);

  useEffect(() => {
    (async () => {
      const appConfig = await configRepository.getConfig();
      setConfig({
        redirectUrl: appConfig.redirectUrl,
        signOutUrl: appConfig.signOutUrl,
      });
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const claims = await getIdTokenClaims();
        console.log('User claims:', claims);
        setUser(claims);
      }

      if (!isAuthenticated && !isLoading && config) {
        await signIn(config?.redirectUrl);
      }
    })();
  }, [getIdTokenClaims, isAuthenticated, isLoading, config]);

  return config === null ? null : (
    <header className="bg-card border-b border-border card-shadow">
      <div className="px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
                <img 
                  src="/logo/prospectio.png" 
                  alt="Prospectio Logo" 
                  className="w-20 h-20"
                />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads, tasks..."
                className="pl-10 w-80"
              />
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-[10px] flex items-center justify-center text-destructive-foreground">
                3
              </span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user?.username ? user.username.substring(0, 2).toUpperCase() : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuSeparator />
                {isAuthenticated && (
                  <DropdownMenuItem onClick={() => signOut(config?.signOutUrl)}>
                    Log out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Additional header content */}
        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}
      </div>
    </header>
  );
}