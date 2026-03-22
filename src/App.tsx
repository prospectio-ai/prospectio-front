import { Toaster } from "@/application/components/ui/toaster";
import { Toaster as Sonner } from "@/application/components/ui/sonner";
import { TooltipProvider } from "@/application/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/application/hooks/use-theme";
import { Layout } from "@/application/components/layout/layout";
import  ChainlitWidget from "@/application/components/chainlit/chainlitWidget";
import Companies from "./application/pages/Companies";
import Contacts from "./application/pages/Contacts";
import Jobs from "./application/pages/Jobs";
import Profile from "./application/pages/Profile";
import ProspectCampaign from "./application/pages/ProspectCampaign";
import NotFound from "./application/pages/NotFound";
import { LogtoProvider, LogtoConfig, useLogto } from '@logto/react';
import Callback from "./application/pages/Callback";
import { useEffect, useState } from "react";
import { ConfigRepository } from "./infrastructure/services/configRepository";

const queryClient = new QueryClient();
const configRepository = new ConfigRepository();

const App = () => {
  const [config, setConfig] = useState<LogtoConfig | null>(null);

  useEffect(() => {
    const loadConfig = async (): Promise<void> => {
      const appConfig = await configRepository.getConfig();
      setConfig({
        endpoint: appConfig.logtoUrl,
        appId: appConfig.logtoAppId,
      });
    };
    loadConfig();
  }, []);

  return config === null ? null : (
    <LogtoProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="prospectio-ui-theme">
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Profile />} />
                <Route path="profile" element={<Profile />} />
                <Route path="jobs" element={<Jobs />} />
                <Route path="companies" element={<Companies />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="campaign" element={<ProspectCampaign />} />
                <Route path="callback" element={<Callback />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </ThemeProvider>
        <ChainlitWidget/>
      </QueryClientProvider>
    </LogtoProvider>
  );
}

export default App;
