import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Briefcase, MapPin, DollarSign, Calendar, ExternalLink, Star, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/application/components/ui/card';
import { Input } from '@/application/components/ui/input';
import { Badge } from '@/application/components/ui/badge';
import { Button } from '@/application/components/ui/button';
import { Separator } from '@/application/components/ui/separator';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Job } from '@/domain/entities/job';

export default function Jobs() {
  const backendApi = new BackendApiService();
  const [search, setSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(12);

  const { data: jobsData, isLoading, error } = useQuery({
    queryKey: ['jobs', offset, limit],
    queryFn: () => backendApi.getLeads('jobs', offset, limit),
  });

  const jobs = (jobsData as Job[]) || [];

  const filteredJobs = jobs.filter((job: Job) =>
    job.job_title?.toLowerCase().includes(search.toLowerCase()) ||
    job.location?.toLowerCase().includes(search.toLowerCase()) ||
    job.sectors?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getSeniorityColor = (seniority?: string) => {
    switch (seniority?.toLowerCase()) {
      case 'junior': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'mid-level': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'senior': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg animate-pulse" />
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
          <p className="text-muted-foreground">Error loading jobs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Job Opportunities</h1>
        <p className="text-muted-foreground">
          Discover relevant job openings tailored to your profile
        </p>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search jobs by title, location, or sectors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Jobs List */}
      <div className="space-y-6">
        {filteredJobs.map((job: Job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-1">
                      { job.job_title ? job.job_title[0].toUpperCase() + job.job_title.slice(1) : 'Untitled Position'}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-4 text-sm">
                      {job.company_name && (
                        <span className="flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {job.company_name ? job.company_name[0].toUpperCase() + job.company_name.slice(1) : ''}
                        </span>
                      )}
                      {job.location && (
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location ? job.location[0].toUpperCase() + job.location.slice(1) : ''}
                        </span>
                      )}
                      {job.date_creation && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(job.date_creation)}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
                {job.compatibility_score && (
                  <Badge className="bg-gradient-primary text-white">
                    <Star className="h-3 w-3 mr-1" />
                    {job.compatibility_score}% match
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Job Details */}
              <div className="flex flex-wrap gap-2">
                {job.job_seniority && (
                  <Badge className={getSeniorityColor(job.job_seniority)}>
                    {job.job_seniority}
                  </Badge>
                )}
                {job.job_type && (
                  <Badge variant="outline">
                    {job.job_type}
                  </Badge>
                )}
                {job.salary && (
                  <Badge variant="outline" className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {job.salary}
                  </Badge>
                )}
              </div>

              {/* Description */}
              {job.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {job.description}
                  </p>
                </div>
              )}

              {/* Sectors */}
              {job.sectors && (
                <div>
                  <h4 className="font-medium mb-2">Sectors</h4>
                  <div className="flex flex-wrap gap-1">
                    {job.sectors.split(',').map((sector, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {sector.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                {job.apply_url && job.apply_url.length > 0 && (
                  <Button asChild className="bg-gradient-primary text-white">
                    <a href={job.apply_url[0]} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {jobs.length >= 3 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            variant="outline"
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - 3))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() => setOffset(offset + 3)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Empty State */}
      {filteredJobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No jobs found</h3>
          <p className="text-muted-foreground">
            {search ? "Try adjusting your search terms" : "No job opportunities available"}
          </p>
        </div>
      )}
    </div>
  );
}