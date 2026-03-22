import { TokenResponse } from "@/domain/entities/tokenresponse";
import { toast } from "../../application/hooks/use-toast";
import { ConfigRepository } from "./configRepository";

declare global {
  // eslint-disable-next-line no-var
  var mountChainlitWidget: ((config: { chainlitServer: string , accessToken: string}) => void) | undefined;
}

class ChatbotService {
  private readonly config = new ConfigRepository().getConfig();
  private isLoaded: boolean = false;

  /**
   * Fetch a new authentication token from the API
   * @returns Promise resolving to the TokenResponse
   */
  async getToken(): Promise<TokenResponse> {
      try {
          const response = await fetch(`${(await this.config).chatbotUrl}/rest/v1/auth/token`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'User-Agent': 'Prospectio-front/1.0.0'
              },
          });

          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`Failed to get token: ${response.status} ${response.statusText} - ${errorText}`);
          }

          return await response.json();
      } catch (error) {
          console.error('Error fetching token:', error);
          throw error;
      }
  }  

  /**
   * Load the chainlit widget dynamically with proper error handling and user feedback
   */
  async loadWidget(): Promise<void> {
    if (this.isLoaded) return;

    if (!(await this.config).chatbotUrl) {
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: "Chatbot API URL is not configured.",
      });
      return;
    }

    try {
      await this.loadScript(`${(await this.config).chatbotUrl}/chainlit/copilot/index.js`);
      this.mountWidget();
      this.isLoaded = true;
    
    } catch (error) {
      console.error("Failed to load Chainlit widget:", error);
      toast({
        variant: "destructive",
        title: "Chat widget unavailable",
        description: "Failed to load the chat widget. Please refresh the page to try again.",
      });
    }
  }

  /**
   * Load external script and return a promise
   */
  private async loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Mount the chainlit widget with proper configuration
   */
  private async mountWidget(): Promise<void> {
    if (globalThis.mountChainlitWidget) {
      globalThis.mountChainlitWidget({
        chainlitServer: `${(await this.config).chatbotUrl}/chainlit`,
        accessToken: (await this.getToken()).token
      });
      
      // Apply z-index styles after mounting
      setTimeout(() => {
        this.applyChainlitWidgetZIndex();
      }, 1000);
    }
  }

  /**
   * Apply z-index styles to ensure the Chainlit widget is always on top
   */
  private applyChainlitWidgetZIndex(): void {
    const selectors = [
      '#chainlit-copilot',
      '[id*="chainlit"]',
      '[class*="chainlit"]',
      '.chainlit-widget',
      '.chainlit-copilot',
      '.chainlit-chat'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.zIndex = '9999';
          element.style.position = element.style.position || 'relative';
          
          // Also apply to all child elements
          const children = element.querySelectorAll('*');
          children.forEach(child => {
            if (child instanceof HTMLElement) {
              child.style.zIndex = '9999';
            }
          });
        }
      });
    });
  }
}

export const chatbotService: ChatbotService = new ChatbotService();
