import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlantCard } from '../../../components/plants/PlantCard';
import type { Plant } from '../../../lib/types';

// Mock the plant store
vi.mock('../../../stores/plantStore', () => ({
  usePlantStore: () => ({
    deletePlant: vi.fn(),
  }),
}));

// Mock date-fns to avoid timezone issues in tests
vi.mock('date-fns', () => ({
  format: vi.fn((date, formatStr) => {
    if (formatStr === 'MMM d, yyyy') return 'Jan 1, 2024';
    return '2024-01-01';
  }),
  formatDistanceToNow: vi.fn(() => '30 days'),
}));

const mockPlant: Plant = {
  id: 'plant-1',
  spaceId: 'space-1',
  userId: 'user-1',
  name: 'Test Tomato',
  variety: 'Cherry Tomato',
  seedSource: 'Local Nursery',
  plantedDate: new Date('2024-01-01'),
  expectedHarvestDate: new Date('2024-06-01'),
  status: 'vegetative',
  notes: 'Growing well',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('PlantCard - Core Functionality', () => {
  const mockOnEdit = vi.fn();
  const mockOnMove = vi.fn();
  const mockOnHarvest = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render plant information correctly', () => {
    render(
      <PlantCard
        plant={mockPlant}
        onEdit={mockOnEdit}
        onMove={mockOnMove}
        onHarvest={mockOnHarvest}
      />
    );

    expect(screen.getByText('Test Tomato')).toBeInTheDocument();
    expect(screen.getByText('Cherry Tomato')).toBeInTheDocument();
    expect(screen.getByText('Vegetative')).toBeInTheDocument();
    expect(screen.getByText('Local Nursery')).toBeInTheDocument();
    expect(screen.getByText('Growing well')).toBeInTheDocument();
  });

  it('should display correct status badge colors', () => {
    render(
      <PlantCard
        plant={mockPlant}
        onEdit={mockOnEdit}
        onMove={mockOnMove}
        onHarvest={mockOnHarvest}
      />
    );

    const statusBadge = screen.getByText('Vegetative');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should handle different plant statuses', () => {
    const harvestedPlant = { ...mockPlant, status: 'harvested' as const };
    
    render(
      <PlantCard
        plant={harvestedPlant}
        onEdit={mockOnEdit}
        onMove={mockOnMove}
        onHarvest={mockOnHarvest}
      />
    );

    const statusBadge = screen.getByText('Harvested');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-orange-100', 'text-orange-800');
  });

  it('should handle plants with missing optional fields', () => {
    const minimalPlant: Plant = {
      id: 'plant-2',
      spaceId: 'space-1',
      userId: 'user-1',
      name: 'Minimal Plant',
      variety: 'Unknown Variety',
      plantedDate: new Date('2024-01-01'),
      status: 'seedling',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    render(
      <PlantCard
        plant={minimalPlant}
        onEdit={mockOnEdit}
        onMove={mockOnMove}
        onHarvest={mockOnHarvest}
      />
    );

    expect(screen.getByText('Minimal Plant')).toBeInTheDocument();
    expect(screen.getByText('Unknown Variety')).toBeInTheDocument();
    expect(screen.getByText('Seedling')).toBeInTheDocument();
    
    // Should not show optional fields
    expect(screen.queryByText('Local Nursery')).not.toBeInTheDocument();
    expect(screen.queryByText('Growing well')).not.toBeInTheDocument();
  });

  it('should handle invalid dates gracefully', () => {
    const plantWithInvalidDate = {
      ...mockPlant,
      plantedDate: 'invalid-date' as any,
      expectedHarvestDate: null as any,
    };

    // Should not throw an error
    expect(() => {
      render(
        <PlantCard
          plant={plantWithInvalidDate}
          onEdit={mockOnEdit}
          onMove={mockOnMove}
          onHarvest={mockOnHarvest}
        />
      );
    }).not.toThrow();

    expect(screen.getByText('Test Tomato')).toBeInTheDocument();
  });

  it('should show all status badge variants correctly', () => {
    const statuses = [
      { status: 'seedling' as const, label: 'Seedling', classes: ['bg-green-100', 'text-green-800'] },
      { status: 'vegetative' as const, label: 'Vegetative', classes: ['bg-blue-100', 'text-blue-800'] },
      { status: 'flowering' as const, label: 'Flowering', classes: ['bg-purple-100', 'text-purple-800'] },
      { status: 'harvested' as const, label: 'Harvested', classes: ['bg-orange-100', 'text-orange-800'] },
      { status: 'removed' as const, label: 'Removed', classes: ['bg-gray-100', 'text-gray-800'] },
    ];

    statuses.forEach(({ status, label, classes }) => {
      const testPlant = { ...mockPlant, status };
      const { unmount } = render(
        <PlantCard
          plant={testPlant}
          onEdit={mockOnEdit}
          onMove={mockOnMove}
          onHarvest={mockOnHarvest}
        />
      );

      const statusBadge = screen.getByText(label);
      expect(statusBadge).toBeInTheDocument();
      classes.forEach(className => {
        expect(statusBadge).toHaveClass(className);
      });

      unmount();
    });
  });
});