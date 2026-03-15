import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { HarvestDialog } from '../../../components/plants/HarvestDialog';
import type { Plant } from '../../../lib/types';

const {
  mockHarvestPlant,
  mockToastSuccess,
  mockToastWarning,
  mockToastError,
} = vi.hoisted(() => ({
  mockHarvestPlant: vi.fn(),
  mockToastSuccess: vi.fn(),
  mockToastWarning: vi.fn(),
  mockToastError: vi.fn(),
}));

vi.mock('../../../stores/plantStore', () => ({
  usePlantStore: () => ({
    harvestPlant: mockHarvestPlant,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    warning: mockToastWarning,
    error: mockToastError,
  },
}));

const mockPlant: Plant = {
  id: 'plant-1',
  userId: 'user-1',
  spaceId: 'space-1',
  name: 'Test Tomato',
  variety: 'Roma',
  status: 'vegetative',
  plantedDate: new Date('2024-01-01'),
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('HarvestDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockHarvestPlant.mockResolvedValue({ noteCreated: true });
  });

  it('defaults linked harvest note toggle to checked', () => {
    render(<HarvestDialog plant={mockPlant} />);

    const toggle = screen.getByLabelText('Create linked harvest note');
    expect(toggle).toBeChecked();
    expect(screen.getByLabelText('Harvest Note (Optional)')).toBeInTheDocument();
  });

  it('shows and hides harvest note textarea when toggled', () => {
    render(<HarvestDialog plant={mockPlant} />);

    const toggle = screen.getByLabelText('Create linked harvest note');
    expect(screen.getByLabelText('Harvest Note (Optional)')).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    expect(screen.queryByLabelText('Harvest Note (Optional)')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toBeChecked();
    expect(screen.getByLabelText('Harvest Note (Optional)')).toBeInTheDocument();
  });

  it('submits harvest with linked-note options and timestamp', async () => {
    render(<HarvestDialog plant={mockPlant} />);

    fireEvent.change(screen.getByLabelText('Harvest Note (Optional)'), {
      target: { value: 'Great yield and good flavor.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Record Harvest' }));

    await waitFor(() => {
      expect(mockHarvestPlant).toHaveBeenCalledTimes(1);
    });

    const [plantId, harvestDate, options] = mockHarvestPlant.mock.calls[0];
    expect(plantId).toBe('plant-1');
    expect(harvestDate).toBeInstanceOf(Date);
    expect(options).toEqual({
      createLinkedNote: true,
      noteContent: 'Great yield and good flavor.',
      noteTimestamp: harvestDate,
    });
    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Harvest and linked note recorded successfully.'
    );
  });

  it('shows warning toast when harvest succeeds but linked note save fails', async () => {
    mockHarvestPlant.mockResolvedValueOnce({
      noteCreated: false,
      noteError: 'note write failed',
    });

    const onSuccess = vi.fn();
    render(<HarvestDialog plant={mockPlant} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: 'Record Harvest' }));

    await waitFor(() => {
      expect(mockToastWarning).toHaveBeenCalledWith(
        'Harvest recorded, but the linked note could not be saved.'
      );
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows error toast and does not call success callback on harvest failure', async () => {
    mockHarvestPlant.mockRejectedValueOnce(new Error('Harvest failed'));

    const onSuccess = vi.fn();
    render(<HarvestDialog plant={mockPlant} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: 'Record Harvest' }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Harvest failed');
    });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
