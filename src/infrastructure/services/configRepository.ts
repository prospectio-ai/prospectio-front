import { toast } from "@/application/hooks/use-toast";
import { AppConfig } from "@/domain/entities/appConfig";

export class ConfigRepository {
  private config: AppConfig | null = null;
  private loading: boolean = false;

  async getConfig(): Promise<AppConfig> {
    if (this.config) {
      return this.config;
    }

    if (this.loading) {
      // Attendre que le chargement en cours se termine
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.config!;
    }

    this.loading = true;
    try {
      const response = await fetch('/config.json');
      if (!response.ok) {
        throw new Error(`Failed to load config: ${response.status}`);
      }
      
      this.config = await response.json();
      return this.config;
    } catch (error) {
      // Fallback config pour le développement
      console.error('Config loading failed, using fallback:', error);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "App is not configured.",
      });
      this.config = {
        chatbotUrl: "http://localhost:3000",
        backendUrl: "http://localhost:8000",
        logtoUrl: "http://localhost:3002",
        logtoAppId: "fallback",
        redirectUrl: "http://localhost:5173/callback",
        signOutUrl: "http://localhost:5173",
      };
      return this.config;
    } finally {
      this.loading = false;
    }
  }

  isLoaded(): boolean {
    return this.config !== null;
  }
}