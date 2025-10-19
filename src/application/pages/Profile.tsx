import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, User, MapPin, Briefcase, Calendar, Edit3, Save, X, Code2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/application/components/ui/card';
import { Input } from '@/application/components/ui/input';
import { Textarea } from '@/application/components/ui/textarea';
import { Button } from '@/application/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/application/components/ui/avatar';
import { Badge } from '@/application/components/ui/badge';
import { useToast } from '@/application/hooks/use-toast';
import { BackendApiService } from '@/infrastructure/services/backendApiService';
import { Profile as ProfileType, WorkExperience } from '@/domain/entities/profile';
import { useLogto, type IdTokenClaims } from '@logto/react';

export default function Profile() {
  const backendApi = new BackendApiService();
  const [isEditing, setIsEditing] = useState(false);
  const [newTechno, setNewTechno] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => backendApi.getProfile(),
  });

  const profile = profileData?.data;

  const { register, handleSubmit, setValue, watch, reset } = useForm<ProfileType>({
    defaultValues: profile || {
      job_title: '',
      location: '',
      bio: '',
      work_experience: [],
      technos: []
    }
  });

  const watchedExperience = watch('work_experience') || [];
  const watchedTechnos = watch('technos') || [];

  const updateProfileMutation = useMutation({
    mutationFn: (profileData: ProfileType) => backendApi.upsertProfile(profileData),
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ProfileType) => {
    updateProfileMutation.mutate(data);
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: ''
    };
    setValue('work_experience', [...watchedExperience, newExperience]);
  };

  const removeExperience = (index: number) => {
    const updated = watchedExperience.filter((_, i) => i !== index);
    setValue('work_experience', updated);
  };

  const updateExperience = (index: number, field: keyof WorkExperience, value: string) => {
    const updated = [...watchedExperience];
    updated[index] = { ...updated[index], [field]: value };
    setValue('work_experience', updated);
  };

  const addTechno = () => {
    if (newTechno.trim() && !watchedTechnos.includes(newTechno.trim())) {
      setValue('technos', [...watchedTechnos, newTechno.trim()]);
      setNewTechno('');
    }
  };

  const removeTechno = (technoToRemove: string) => {
    const updated = watchedTechnos.filter(techno => techno !== technoToRemove);
    setValue('technos', updated);
  };

  const handleTechnoKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechno();
    }
  };

  const handleEdit = () => {
    if (profile) {
      reset(profile);
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    reset(profile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded-lg animate-pulse" />
          <div className="h-96 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your professional information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={handleEdit} className="bg-gradient-primary text-white">
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit(onSubmit)}
              disabled={updateProfileMutation.isPending}
              className="bg-gradient-primary text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="bg-gradient-primary text-white text-xl">
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">Basic Information</CardTitle>
                <CardDescription>
                  Your professional identity and contact details
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Title</label>
                {isEditing ? (
                  <Input
                    {...register('job_title')}
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                ) : (
                  <div className="flex items-center text-sm">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    {profile?.job_title || 'Not specified'}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                {isEditing ? (
                  <Input
                    {...register('location')}
                    placeholder="e.g., FR, Paris"
                  />
                ) : (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    {profile?.location || 'Not specified'}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Professional Bio</label>
              {isEditing ? (
                <Textarea
                  {...register('bio')}
                  placeholder="Tell us about your professional background, skills, and interests..."
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile?.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Experience */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Work Experience</CardTitle>
                <CardDescription>
                  Your professional background and career history
                </CardDescription>
              </div>
              {isEditing && (
                <Button type="button" onClick={addExperience} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-6">
                {watchedExperience.map((exp, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Experience {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExperience(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Company name"
                        value={exp.company}
                        onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      />
                      <Input
                        placeholder="Position/Role"
                        value={exp.position}
                        onChange={(e) => updateExperience(index, 'position', e.target.value)}
                      />
                      <Input
                        placeholder="Start date (YYYY-MM)"
                        value={exp.start_date}
                        onChange={(e) => updateExperience(index, 'start_date', e.target.value)}
                      />
                      <Input
                        placeholder="End date (YYYY-MM) or leave empty for current"
                        value={exp.end_date || ''}
                        onChange={(e) => updateExperience(index, 'end_date', e.target.value)}
                      />
                    </div>
                    
                    <Textarea
                      placeholder="Description of responsibilities and achievements..."
                      value={exp.description || ''}
                      onChange={(e) => updateExperience(index, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                ))}
                
                {watchedExperience.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2" />
                    <p>No work experience added yet</p>
                    <p className="text-sm">Click "Add Experience" to get started</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {profile?.work_experience && profile.work_experience.length > 0 ? (
                  profile.work_experience.map((exp, index) => (
                    <div key={index} className="flex space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{exp.position}</h4>
                          <span className="text-muted-foreground">at</span>
                          <span className="font-medium">{exp.company}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {exp.start_date} - {exp.end_date || 'Present'}
                          </div>
                        </div>
                        {exp.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="h-8 w-8 mx-auto mb-2" />
                    <p>No work experience added yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Technologies */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Skills</CardTitle>
                <CardDescription>
                  Programming languages, frameworks, and tools you work with
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python, AWS...)"
                    value={newTechno}
                    onChange={(e) => setNewTechno(e.target.value)}
                    onKeyPress={handleTechnoKeyPress}
                    className="flex-1"
                  />
                  <Button type="button" onClick={addTechno} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {watchedTechnos.map((techno, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {techno}
                      <button
                        type="button"
                        onClick={() => removeTechno(techno)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {watchedTechnos.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Code2 className="h-8 w-8 mx-auto mb-2" />
                    <p>No technologies added yet</p>
                    <p className="text-sm">Add your skills above</p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {profile?.technos && profile.technos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.technos.map((techno, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Code2 className="h-3 w-3" />
                        {techno}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Code2 className="h-8 w-8 mx-auto mb-2" />
                    <p>No technologies added yet</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}