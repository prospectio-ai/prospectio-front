import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactDetailSheet } from './ContactDetailSheet';
import type { Contact } from '@/domain/entities/contact';

const mockContact: Contact = {
  id: '1',
  name: 'john doe',
  email: ['john@test.com', 'john2@test.com'],
  title: 'senior developer',
  phone: '+33 1 23 45 67 89',
  company_name: 'techCo',
  job_title: 'frontend developer',
  profile_url: 'https://linkedin.com/in/johndoe',
  full_bio: 'John is an experienced developer.\n\nHe loves React.',
};

describe('ContactDetailSheet', () => {
  it('should render nothing when contact is null', () => {
    const { container } = render(
      <ContactDetailSheet
        contact={null}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(container.innerHTML).toBe('');
  });

  it('should render contact name formatted correctly', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render contact title', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('Senior developer')).toBeInTheDocument();
  });

  it('should render all email addresses', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
    expect(screen.getByText('john2@test.com')).toBeInTheDocument();
  });

  it('should render phone number', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('+33 1 23 45 67 89')).toBeInTheDocument();
  });

  it('should render company and job badges', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('TechCo')).toBeInTheDocument();
    expect(screen.getByText('Frontend developer')).toBeInTheDocument();
  });

  it('should render biography paragraphs', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('John is an experienced developer.')).toBeInTheDocument();
    expect(screen.getByText('He loves React.')).toBeInTheDocument();
  });

  it('should show "No biography available" when full_bio is null', () => {
    const contactNoBio: Contact = { ...mockContact, full_bio: null };
    render(
      <ContactDetailSheet
        contact={contactNoBio}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('No biography available for this contact.')).toBeInTheDocument();
  });

  it('should show "Generating..." when isGeneratingMessage is true', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={true}
      />
    );
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });

  it('should call onEmailClick when Send Email is clicked', async () => {
    const user = userEvent.setup();
    const onEmailClick = vi.fn();
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={onEmailClick}
        isGeneratingMessage={false}
      />
    );

    const sendButton = screen.getByText('Send Email');
    await user.click(sendButton);
    expect(onEmailClick).toHaveBeenCalledWith(mockContact);
  });

  it('should render initials in avatar', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should render LinkedIn profile link', () => {
    render(
      <ContactDetailSheet
        contact={mockContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('LinkedIn Profile')).toBeInTheDocument();
  });

  it('should handle contact with no name', () => {
    const noNameContact: Contact = { ...mockContact, name: undefined };
    render(
      <ContactDetailSheet
        contact={noNameContact}
        open={true}
        onOpenChange={vi.fn()}
        onEmailClick={vi.fn()}
        isGeneratingMessage={false}
      />
    );
    expect(screen.getByText('Unknown Name')).toBeInTheDocument();
    expect(screen.getByText('UN')).toBeInTheDocument();
  });
});
