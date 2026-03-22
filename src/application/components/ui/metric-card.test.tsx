import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MetricCard } from './metric-card';
import { Briefcase } from 'lucide-react';

describe('MetricCard', () => {
  it('should render title and value', () => {
    render(<MetricCard title="Total Jobs" value={42} icon={Briefcase} />);
    expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(
      <MetricCard
        title="Revenue"
        value="$10K"
        icon={Briefcase}
        description="Monthly revenue"
      />
    );
    expect(screen.getByText('Monthly revenue')).toBeInTheDocument();
  });

  it('should render positive trend', () => {
    render(
      <MetricCard
        title="Growth"
        value={100}
        icon={Briefcase}
        trend={{ value: 15, isPositive: true }}
      />
    );
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should render negative trend', () => {
    render(
      <MetricCard
        title="Decline"
        value={50}
        icon={Briefcase}
        trend={{ value: 10, isPositive: false }}
      />
    );
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <MetricCard title="Test" value={0} icon={Briefcase} className="custom-metric" />
    );
    expect(container.innerHTML).toContain('custom-metric');
  });

  it('should render string values', () => {
    render(<MetricCard title="Status" value="Active" icon={Briefcase} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
