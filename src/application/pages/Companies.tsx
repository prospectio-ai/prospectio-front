import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Building2, MapPin, Users, DollarSign, ExternalLink, Zap } from 'lucide-react';
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
import { ShimmerSkeleton, SkeletonGrid } from '@/application/components/ui/shimmer-skeleton';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Company } from '@/domain/entities/company';

export default function Companies() {
  const backendApi = new BackendApiService();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit] = useState(12);


  const { data: companiesData, isLoading, error } = useQuery({
    queryKey: ['companies', offset, limit],
    queryFn: () => backendApi.getLeads('companies', offset, limit),
  });

  const companies = (companiesData as Company[]) || [];

  const filteredCompanies = companies.filter((company: Company) =>
    company.name?.toLowerCase().includes(search.toLowerCase()) ||
    company.industry?.toLowerCase().includes(search.toLowerCase()) ||
    company.location?.toLowerCase().includes(search.toLowerCase())
  );

  if (error) {
    return (
      <AnimatedPage>
        <div className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Error loading companies</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const loadingSkeleton = (
    <div className="space-y-6">
      <ShimmerSkeleton className="h-10 w-full" rounded="md" />
      <SkeletonGrid count={6} columns={3} />
    </div>
  );

  return (
    <AnimatedPage>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <FadeIn className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Companies</h1>
          <p className="text-muted-foreground">
            Discover potential partner companies and opportunities
          </p>
        </FadeIn>

        <ContentFade
          isLoading={isLoading}
          skeleton={loadingSkeleton}
          contentKey={`companies-${offset}`}
        >
          {/* Search */}
          <FadeIn delay={0.1} className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 z-10" />
            <AnimatedInput
              placeholder="Search companies by name, industry, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </FadeIn>

          {/* Companies Grid */}
          <AnimatedGrid columns={3} gap="md">
            {filteredCompanies.map((company: Company) => (
              <AnimatedGridItem key={company.id}>
                <AnimatedCard>
                  <AnimatedCardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <AnimatedCardTitle className="text-lg">
                            {company.name ? company.name[0].toUpperCase() + company.name.slice(1) : ''}
                          </AnimatedCardTitle>
                          <AnimatedCardDescription className="text-sm">
                            {company.industry}
                          </AnimatedCardDescription>
                        </div>
                      </div>
                      {company.compatibility && (
                        <Badge variant="secondary" className="bg-gradient-primary text-white">
                          <Zap className="h-3 w-3 mr-1" />
                          {company.compatibility}
                        </Badge>
                      )}
                    </div>
                  </AnimatedCardHeader>

                  <AnimatedCardContent className="space-y-4">
                    {/* Location & Size */}
                    <div className="space-y-2">
                      {company.location && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          {company.location}
                        </div>
                      )}
                      {company.size && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-2" />
                          {company.size}
                        </div>
                      )}
                      {company.revenue && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-2" />
                          {company.revenue}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {company.description && (
                      <p className="text-sm text-muted-foreground">
                        {company.description}
                      </p>
                    )}

                    {/* Opportunities */}
                    {company.opportunities && company.opportunities.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Opportunities:</p>
                        <div className="flex flex-wrap gap-1">
                          {company.opportunities.slice(0, 3).map((opportunity) => (
                            <Badge key={opportunity} variant="outline" className="text-xs">
                              {opportunity}
                            </Badge>
                          ))}
                          {company.opportunities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{company.opportunities.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {company.website && (
                        <AnimatedButton variant="outline" size="sm" asChild>
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        </AnimatedButton>
                      )}
                    </div>
                  </AnimatedCardContent>
                </AnimatedCard>
              </AnimatedGridItem>
            ))}
          </AnimatedGrid>

          {/* Pagination */}
          {(companies.length >= limit || offset > 0) && (
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
                disabled={companies.length < limit}
                onClick={() => setOffset(offset + limit)}
              >
                Next
              </AnimatedButton>
            </FadeIn>
          )}

          {/* Empty State */}
          {filteredCompanies.length === 0 && !isLoading && (
            <FadeIn className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No companies found</h3>
              <p className="text-muted-foreground">
                {search ? "Try adjusting your search terms" : "No companies available"}
              </p>
            </FadeIn>
          )}
        </ContentFade>
      </div>
    </AnimatedPage>
  );
}
