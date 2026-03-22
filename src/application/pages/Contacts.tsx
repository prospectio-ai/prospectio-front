import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserCheck, Mail, Phone, ExternalLink, Building2, Briefcase, ChevronRight } from 'lucide-react';
import { AnimatedPage } from '@/application/components/layout/animated-page';
import { AnimatedGrid, AnimatedGridItem } from '@/application/components/animated/animated-grid';
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
import { Badge } from '@/application/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/application/components/ui/avatar';
import { ShimmerSkeleton, SkeletonGrid } from '@/application/components/ui/shimmer-skeleton';
import { useToast } from '@/application/hooks/use-toast';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Contact } from '@/domain/entities/contact';
import { ContactDetailSheet } from '@/application/components/contacts/ContactDetailSheet';

export default function Contacts() {
  const backendApi = new BackendApiService();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: contactsData, isLoading, error } = useQuery({
    queryKey: ['contacts', offset, limit],
    queryFn: () => backendApi.getLeads('contacts', offset, limit),
  });

  const contacts = (contactsData as Contact[]) || [];

  const filteredContacts = contacts.filter((contact: Contact) =>
    contact.name?.toLowerCase().includes(search.toLowerCase()) ||
    contact.email?.some((email: string) =>
      email.toLowerCase().includes(search.toLowerCase())
    ) ||
    contact.title?.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name?: string) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleEmailClick = (contact: Contact) => {
    if (!contact.id) {
      toast({
        title: "Error",
        description: "Contact ID is missing.",
        variant: "destructive",
      });
      return;
    }
    setSelectedContactId(contact.id);
  };

  const handleContactClick = (contact: Contact) => {
    setDetailContact(contact);
    setIsDetailOpen(true);
  };

  const handleDetailEmailClick = (contact: Contact) => {
    setIsDetailOpen(false);
    handleEmailClick(contact);
  };

  const { isLoading: isGeneratingMessage } = useQuery({
    queryKey: ['generateMessage', selectedContactId],
    queryFn: async () => {
      const prospectMessage = await backendApi.generateMessage(selectedContactId);
      const contact = contacts.find(c => c.id === selectedContactId);
      const subject = encodeURIComponent(prospectMessage.subject || '');
      const body = encodeURIComponent(prospectMessage.message || '');
      contact?.email?.forEach(email => {
        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
        globalThis.location.href = mailtoUrl;
      });
      setSelectedContactId(null);

      return prospectMessage;
    },
    enabled: !!selectedContactId
  });

  if (error) {
    return (
      <AnimatedPage>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Error loading contacts</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const loadingSkeleton = (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-10 w-full" rounded="md" />
      <SkeletonGrid count={9} columns={3} />
    </div>
  );

  return (
    <AnimatedPage>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Contacts</h1>
          <p className="text-muted-foreground">
            Connect with key decision makers and industry professionals
          </p>
        </FadeIn>

        <ContentFade
          isLoading={isLoading}
          skeleton={loadingSkeleton}
          contentKey={`contacts-${offset}`}
        >
          {/* Search */}
          <FadeIn delay={0.1} className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <AnimatedInput
              placeholder="Search contacts by name, email, or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </FadeIn>

          {/* Contacts Grid */}
          <AnimatedGrid columns={3} gap="md">
            {filteredContacts.map((contact: Contact, index: number) => (
              <AnimatedGridItem key={contact.id || index}>
                <AnimatedCard
                  onClick={() => handleContactClick(contact)}
                  className="group"
                >
                  <AnimatedCardHeader className="pb-3">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12 flex-shrink-0">
                        <AvatarImage src="" alt={contact.name} />
                        <AvatarFallback className="bg-gradient-primary text-white">
                          {getInitials(contact.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <AnimatedCardTitle className="text-lg truncate">
                            {contact.name ? contact.name[0].toUpperCase() + contact.name.slice(1) : 'Unknown Name'}
                          </AnimatedCardTitle>
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2" />
                        </div>
                        <AnimatedCardDescription className="truncate">
                          {contact.title ? contact.title[0].toUpperCase() + contact.title.slice(1) : 'No title'}
                        </AnimatedCardDescription>
                      </div>
                    </div>
                  </AnimatedCardHeader>

                  <AnimatedCardContent className="space-y-4">
                    {/* Short Description - AI-generated summary */}
                    {contact.short_description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {contact.short_description}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2">
                      {contact.email && contact.email.length > 0 && (
                        <div className="space-y-1">
                          {contact.email.slice(0, 1).map((email: string) => (
                            <div key={email} className="flex items-center text-sm">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                              <span className="text-foreground truncate">{email}</span>
                            </div>
                          ))}
                          {contact.email.length > 1 && (
                            <span className="text-xs text-muted-foreground ml-6">
                              +{contact.email.length - 1} more
                            </span>
                          )}
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                          <span className="text-foreground">{contact.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Company & Job References */}
                    <div className="flex flex-wrap gap-1.5">
                      {contact.company_name && (
                        <Badge variant="secondary" className="text-xs font-normal">
                          <Building2 className="h-3 w-3 mr-1" />
                          {contact.company_name.length > 20
                            ? contact.company_name.slice(0, 20) + '...'
                            : contact.company_name.charAt(0).toUpperCase() + contact.company_name.slice(1)}
                        </Badge>
                      )}
                      {contact.job_title && (
                        <Badge variant="outline" className="text-xs font-normal">
                          <Briefcase className="h-3 w-3 mr-1" />
                          {contact.job_title.length > 20
                            ? contact.job_title.slice(0, 20) + '...'
                            : contact.job_title.charAt(0).toUpperCase() + contact.job_title.slice(1)}
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {contact.email && (
                        <AnimatedButton
                          className='bg-gradient-primary text-white flex-1'
                          variant="outline"
                          size="sm"
                          animationStyle="glow"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEmailClick(contact);
                          }}
                          disabled={isGeneratingMessage && selectedContactId === contact.id}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          {isGeneratingMessage && selectedContactId === contact.id ? 'Generating...' : 'Email'}
                        </AnimatedButton>
                      )}
                      {contact.profile_url && (() => {
                        const profileUrls = contact.profile_url.split(',').map(url => url.trim()).filter(Boolean);
                        const firstUrl = profileUrls[0];
                        return (
                          <AnimatedButton
                            className='flex-1'
                            variant="outline"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                            asChild
                          >
                            <a href={firstUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Profile{profileUrls.length > 1 ? ` (+${profileUrls.length - 1})` : ''}
                            </a>
                          </AnimatedButton>
                        );
                      })()}
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>

          {/* Pagination */}
          {(contacts.length >= limit || offset > 0) && (
            <FadeIn delay={0.3} className="flex justify-center mt-8 gap-2">
              <AnimatedButton
                variant="outline"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - limit))}
              >
                Previous
              </AnimatedButton>
              <AnimatedButton
                variant="outline"
                disabled={contacts.length < limit}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </AnimatedButton>
            </FadeIn>
          )}

          {/* Empty State */}
          {filteredContacts.length === 0 && !isLoading && (
            <FadeIn className="text-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search terms" : "No contacts available"}
              </p>
            </FadeIn>
          )}
        </ContentFade>

        {/* Contact Detail Sheet */}
        <ContactDetailSheet
          contact={detailContact}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onEmailClick={handleDetailEmailClick}
          isGeneratingMessage={isGeneratingMessage && selectedContactId === detailContact?.id}
        />
      </div>
    </AnimatedPage>
  );
}
