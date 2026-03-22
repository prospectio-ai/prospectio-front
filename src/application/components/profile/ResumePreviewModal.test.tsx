import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResumePreviewModal } from './ResumePreviewModal';
import type { Profile } from '@/domain/entities/profile';

const mockProfile: Profile = {
  job_title: 'Senior Developer',
  location: 'Paris, France',
  bio: 'An experienced full-stack developer.',
  work_experience: [
    {
      company: 'Acme Corp',
      position: 'Lead Developer',
      start_date: '2020-01',
      end_date: '',
      description: 'Led the frontend team.',
    },
    {
      company: 'StartupXYZ',
      position: 'Junior Developer',
      start_date: '2018-01',
      end_date: '2020-01',
    },
  ],
  technos: ['React', 'TypeScript', 'Python'],
};

describe('ResumePreviewModal', () => {
  it('should render nothing when extractedProfile is null', () => {
    const { container } = render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={null}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render profile information', () => {
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={mockProfile}
      />
    );
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Paris, France')).toBeInTheDocument();
    expect(screen.getByText('An experienced full-stack developer.')).toBeInTheDocument();
  });

  it('should render work experience', () => {
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={mockProfile}
      />
    );
    expect(screen.getByText('Lead Developer')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Led the frontend team.')).toBeInTheDocument();
    expect(screen.getByText('Junior Developer')).toBeInTheDocument();
    expect(screen.getByText('Work Experience (2)')).toBeInTheDocument();
  });

  it('should render technologies as badges', () => {
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={mockProfile}
      />
    );
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('Skills (3)')).toBeInTheDocument();
  });

  it('should render "Not found" when job_title is missing', () => {
    const profile: Profile = { ...mockProfile, job_title: undefined };
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={profile}
      />
    );
    expect(screen.getByText('Not found')).toBeInTheDocument();
  });

  it('should render "No work experience extracted" when empty', () => {
    const profile: Profile = { ...mockProfile, work_experience: [] };
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={profile}
      />
    );
    expect(screen.getByText('No work experience extracted')).toBeInTheDocument();
  });

  it('should render "No skills extracted" when technos is empty', () => {
    const profile: Profile = { ...mockProfile, technos: [] };
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={profile}
      />
    );
    expect(screen.getByText('No skills extracted')).toBeInTheDocument();
  });

  it('should call onApply when Apply button is clicked', async () => {
    const user = userEvent.setup();
    const onApply = vi.fn();
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={onApply}
        extractedProfile={mockProfile}
      />
    );

    const applyButton = screen.getByText('Apply to Profile');
    await user.click(applyButton);
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when Cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={onClose}
        onApply={vi.fn()}
        extractedProfile={mockProfile}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should show "Applying..." when isApplying is true', () => {
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={mockProfile}
        isApplying={true}
      />
    );
    expect(screen.getByText('Applying...')).toBeInTheDocument();
  });

  it('should render "Present" for work experience without end_date', () => {
    render(
      <ResumePreviewModal
        isOpen={true}
        onClose={vi.fn()}
        onApply={vi.fn()}
        extractedProfile={mockProfile}
      />
    );
    expect(screen.getByText(/Present/)).toBeInTheDocument();
  });
});
