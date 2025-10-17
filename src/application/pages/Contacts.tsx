import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, UserCheck, Mail, Phone, ExternalLink, Building2, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/application/components/ui/card';
import { Input } from '@/application/components/ui/input';
import { Badge } from '@/application/components/ui/badge';
import { Button } from '@/application/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/application/components/ui/avatar';
import { useToast } from '@/application/hooks/use-toast';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Contact } from '@/domain/entities/contact';

export default function Contacts() {
  const backendApi = new BackendApiService();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

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

  const { data: prospectMessage, isLoading: isGeneratingMessage, error: generatingMessageError } = useQuery({
    queryKey: ['generateMessage', selectedContactId],
    queryFn: () => backendApi.generateMessage(selectedContactId),
    enabled: !!selectedContactId
  });

  /**
   * Handles the effect when prospect message is generated
   */
  useEffect(() => {
    if (prospectMessage && !isGeneratingMessage && selectedContactId) {
      const contact = contacts.find(c => c.id === selectedContactId);
      const subject = encodeURIComponent(prospectMessage.subject || '');
      const body = encodeURIComponent(prospectMessage.message || '');
      contact.email.forEach(email => {
        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
        window.location.href = mailtoUrl;
      });
      setSelectedContactId(null);
    }
  }, [prospectMessage, selectedContactId, contacts]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Error loading contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Contacts</h1>
        <p className="text-muted-foreground">
          Connect with key decision makers and industry professionals
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search contacts by name, email, or title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContacts.map((contact: Contact, index: number) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={contact.name} />
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {contact.name ? contact.name[0].toUpperCase() + contact.name.slice(1) : 'Unknown Name'}
                  </CardTitle>
                  <CardDescription className="truncate">
                    {contact.title ? contact.title[0].toUpperCase() + contact.title.slice(1) : 'No title'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Contact Info */}
              <div className="space-y-2">
                {contact.email && contact.email.length > 0 && (
                  <div className="space-y-1">
                    {contact.email.map((email: string, emailIndex: number) => (
                      <div key={emailIndex} className="flex items-center text-sm">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-foreground">{email}</span>
                      </div>
                    ))}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-foreground">{contact.phone}</span>
                  </div>
                )}
              </div>

              {/* Company & Job References */}
              <div className="space-y-2">
                {contact.company_name && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Building2 className="h-4 w-4 mr-2" />
                    <Badge variant="outline" className="text-xs">
                      Company: {contact.company_name ? contact.company_name[0].toUpperCase() + contact.company_name.slice(1) : ''}
                    </Badge>
                  </div>
                )}
                {contact.job_title && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <Badge variant="outline" className="text-xs">
                      Job Title: {contact.job_title ? contact.job_title[0].toUpperCase() + contact.job_title.slice(1) : ''}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {contact.email && (
                  <Button 
                    className='bg-gradient-primary text-white flex-1' 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEmailClick(contact)}
                    disabled={isGeneratingMessage && selectedContactId === contact.id}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {isGeneratingMessage && selectedContactId === contact.id ? 'Generating...' : 'Email'}
                  </Button>
                )}
                {contact.profile_url && (
                  <Button className='bg-gradient-primary text-white flex-1' variant="outline" size="sm" asChild>
                    <a href={contact.profile_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Profile
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {contacts.length >= 10 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 10))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setOffset(offset + 10)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredContacts.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No contacts found</h3>
          <p className="text-muted-foreground">
            {search ? "Try adjusting your search terms" : "No contacts available"}
          </p>
        </div>
      )}
    </div>
  );
}