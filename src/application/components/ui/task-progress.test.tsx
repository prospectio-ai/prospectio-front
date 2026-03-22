import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TaskProgress } from './task-progress';
import type { Task } from '@/domain/entities/task';

function createTask(overrides: Partial<Task> = {}): Task {
  return {
    task_id: 'task-1',
    message: 'Processing data...',
    status: 'in_progress',
    task_type: 'insert_leads',
    ...overrides,
  };
}

describe('TaskProgress', () => {
  it('should render task message', () => {
    render(<TaskProgress task={createTask()} />);
    expect(screen.getByText('Processing data...')).toBeInTheDocument();
  });

  it('should render status label for in_progress', () => {
    render(<TaskProgress task={createTask({ status: 'in_progress' })} />);
    expect(screen.getByText('Processing')).toBeInTheDocument();
  });

  it('should render status label for completed', () => {
    render(<TaskProgress task={createTask({ status: 'completed' })} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render status label for failed', () => {
    render(<TaskProgress task={createTask({ status: 'failed' })} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should render status label for pending', () => {
    render(<TaskProgress task={createTask({ status: 'pending' })} />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should render custom task label', () => {
    render(<TaskProgress task={createTask()} taskLabel="Custom Label" />);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('should render default task type label for insert_leads', () => {
    render(<TaskProgress task={createTask({ task_type: 'insert_leads' })} />);
    expect(screen.getByText('Searching Opportunities')).toBeInTheDocument();
  });

  it('should render default task type label for generate_campaign', () => {
    render(<TaskProgress task={createTask({ task_type: 'generate_campaign' })} />);
    expect(screen.getByText('Generating Campaign')).toBeInTheDocument();
  });

  it('should render progress percentage when progress is available', () => {
    const task = createTask({
      status: 'in_progress',
      progress: { current: 5, total: 10, percentage: 50 },
    });
    render(<TaskProgress task={task} />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('should render items counter when progress is available', () => {
    const task = createTask({
      status: 'in_progress',
      progress: { current: 5, total: 10, percentage: 50 },
    });
    render(<TaskProgress task={task} showItemsCounter />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('/ 10')).toBeInTheDocument();
  });

  it('should render error details for failed tasks', () => {
    const task = createTask({
      status: 'failed',
      error_details: 'Something went wrong',
    });
    render(<TaskProgress task={task} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error Details')).toBeInTheDocument();
  });

  it('should handle unknown status', () => {
    const task = createTask({ status: 'unknown' as any });
    render(<TaskProgress task={task} />);
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <TaskProgress task={createTask()} className="custom-progress" />
    );
    expect(container.innerHTML).toContain('custom-progress');
  });
});
