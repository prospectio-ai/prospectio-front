import { Contact } from '@/domain/entities/contact';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/application/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/application/components/ui/avatar';
import { Badge } from '@/application/components/ui/badge';
import { AnimatedButton } from '@/application/components/ui/animated-button';
import { ScrollArea } from '@/application/components/ui/scroll-area';
import { Separator } from '@/application/components/ui/separator';
import {
  Mail,
  Phone,
  ExternalLink,
  Building2,
  Briefcase,
  User,
  FileText,
} from 'lucide-react';

interface ContactDetailSheetProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailClick: (contact: Contact) => void;
  isGeneratingMessage: boolean;
}

/**
 * ContactDetailSheet - Slide-out panel displaying detailed contact information
 * including the full biography and all contact details
 */
export function ContactDetailSheet({
  contact,
  open,
  onOpenChange,
  onEmailClick,
  isGeneratingMessage,
}: Readonly<ContactDetailSheetProps>) {
  if (!contact) return null;

  const getInitials = (name?: string) => {
    if (!name) return 'UN';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatName = (name?: string) => {
    if (!name) return 'Unknown Name';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatTitle = (title?: string) => {
    if (!title) return null;
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  /**
   * Renders the full_bio with preserved paragraph breaks
   * Handles newlines and creates proper spacing between paragraphs
   */
  const renderBio = (bio: string) => {
    const paragraphs = bio.split(/\n\n|\n/).filter((p) => p.trim());
    return paragraphs.map((paragraph) => (
      <p key={paragraph.trim().slice(0, 50)} className="text-sm text-foreground/90 leading-relaxed">
        {paragraph.trim()}
      </p>
    ));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg overflow-hidden flex flex-col"
      >
        <SheetHeader className="flex-shrink-0 pb-4">
          {/* Contact Header with Avatar */}
          <div className="flex items-start gap-4 pt-2">
            <Avatar className="h-16 w-16 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src="" alt={contact.name} />
              <AvatarFallback className="bg-gradient-primary text-white text-lg font-semibold">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold truncate">
                {formatName(contact.name)}
              </SheetTitle>
              {contact.title && (
                <SheetDescription className="text-sm mt-1 truncate">
                  {formatTitle(contact.title)}
                </SheetDescription>
              )}
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Contact Information Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                Contact Information
              </h3>

              <div className="space-y-2.5 pl-1">
                {contact.email && contact.email.length > 0 && (
                  <div className="space-y-1.5">
                    {contact.email.map((email: string) => (
                      <div
                        key={email}
                        className="flex items-center text-sm group"
                      >
                        <Mail className="h-4 w-4 mr-2.5 text-primary/70" />
                        <a
                          href={`mailto:${email}`}
                          className="text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline"
                        >
                          {email}
                        </a>
                      </div>
                    ))}
                  </div>
                )}

                {contact.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2.5 text-primary/70" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}

                {contact.profile_url && (() => {
                  const profileUrls = contact.profile_url.split(',').map(url => url.trim()).filter(Boolean);
                  return (
                    <div className="flex items-start text-sm">
                      <ExternalLink className="h-4 w-4 mr-2.5 mt-0.5 text-primary/70 flex-shrink-0" />
                      <div className="flex flex-col gap-1">
                        {profileUrls.map((url, urlIdx) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-foreground hover:text-primary transition-colors underline-offset-2 hover:underline truncate max-w-[250px]"
                            title={url}
                          >
                            {url.includes('linkedin.com') && 'LinkedIn Profile'}
                            {!url.includes('linkedin.com') && profileUrls.length > 1 && `Profile ${urlIdx + 1}`}
                            {!url.includes('linkedin.com') && profileUrls.length <= 1 && 'Profile'}
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Company & Job References Section */}
            {(contact.company_name || contact.job_title) && (
              <>
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-3.5 w-3.5" />
                    Professional Details
                  </h3>

                  <div className="space-y-2 pl-1">
                    {contact.company_name && (
                      <div className="flex items-center text-sm text-foreground">
                        <Building2 className="h-4 w-4 mr-2.5 text-primary/70" />
                        <Badge
                          variant="secondary"
                          className="font-normal px-2.5 py-0.5"
                        >
                          {formatTitle(contact.company_name)}
                        </Badge>
                      </div>
                    )}

                    {contact.job_title && (
                      <div className="flex items-center text-sm text-foreground">
                        <Briefcase className="h-4 w-4 mr-2.5 text-primary/70" />
                        <Badge
                          variant="outline"
                          className="font-normal px-2.5 py-0.5"
                        >
                          {formatTitle(contact.job_title)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/60" />
              </>
            )}

            {/* Biography Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" />
                About
              </h3>

              <div className="pl-1">
                {contact.full_bio ? (
                  <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
                    {renderBio(contact.full_bio)}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic py-3">
                    No biography available for this contact.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex-shrink-0 pt-4 border-t border-border/60">
          <div className="flex gap-3">
            {contact.email && contact.email.length > 0 && (
              <AnimatedButton
                className="flex-1 bg-gradient-primary text-white"
                variant="outline"
                size="default"
                animationStyle="glow"
                onClick={() => onEmailClick(contact)}
                disabled={isGeneratingMessage}
              >
                <Mail className="h-4 w-4 mr-2" />
                {isGeneratingMessage ? 'Generating...' : 'Send Email'}
              </AnimatedButton>
            )}

            {contact.profile_url && (() => {
              const profileUrls = contact.profile_url.split(',').map(url => url.trim()).filter(Boolean);
              const firstUrl = profileUrls[0];
              return (
                <AnimatedButton
                  className="flex-1"
                  variant="outline"
                  size="default"
                  asChild
                >
                  <a
                    href={firstUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile{profileUrls.length > 1 ? 's' : ''}
                  </a>
                </AnimatedButton>
              );
            })()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
