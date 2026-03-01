import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GardenStatsCard } from '../../../components/profile/GardenStatsCard';
import type { Plant, GrowSpace } from '../../../lib/types';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  BarChart3: () => <span data-testid="icon-barchart" />,
  Sprout: () => <span data-testid="icon-sprout" />,
  Building2: () => <span data-testid="icon-building" />,
  CheckCircle2: () => <span data-testid="icon-check" />,
  TrendingUp: () => <span data-testid="icon-trending" />,
  Calendar: () => <span data-testid="icon-calendar" />,
}));

describe('GardenStatsCard — Date Calculations', () => {
  const mockSpaces: GrowSpace[] = [
    {
      id: 'space1',
      userId: 'user1',
      name: 'Garden',
      type: 'outdoor-bed',
      plantCount: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const basePlant: Plant = {
    id: 'plant1',
    spaceId: 'space1',
    userId: 'user1',
    name: 'Tomato',
    variety: 'Cherry',
    plantedDate: new Date('2024-01-01'),
    status: 'seedling',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should calculate average days to harvest correctly with native Date objects', () => {
    const plants: Plant[] = [
      {
        ...basePlant,
        id: 'plant1',
        status: 'harvested',
        plantedDate: new Date('2024-01-01'),
        actualHarvestDate: new Date('2024-04-01'), // 91 days
      },
      {
        ...basePlant,
        id: 'plant2',
        status: 'harvested',
        plantedDate: new Date('2024-03-01'),
        actualHarvestDate: new Date('2024-06-01'), // 92 days
      },
    ];

    render(<GardenStatsCard plants={plants} spaces={mockSpaces} />);

    // Average of 91 and 92 = 91.5, rounded to 92
    const avgLabel = screen.getByText('Avg. Days to Harvest');
    expect(avgLabel).toBeInTheDocument();
    // The value should be a number (91 or 92 depending on rounding)
    const avgValue = screen.getByText((content) => {
      const num = parseInt(content, 10);
      return num >= 91 && num <= 92;
    });
    expect(avgValue).toBeInTheDocument();
  });

  it('should display N/A when no plants have been harvested', () => {
    const plants: Plant[] = [
      {
        ...basePlant,
        id: 'plant1',
        status: 'seedling',
        // No actualHarvestDate
      },
    ];

    render(<GardenStatsCard plants={plants} spaces={mockSpaces} />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('should handle harvested plants without actualHarvestDate gracefully', () => {
    const plants: Plant[] = [
      {
        ...basePlant,
        id: 'plant1',
        status: 'harvested',
        // actualHarvestDate is undefined even though status is harvested (edge case)
      },
    ];

    render(<GardenStatsCard plants={plants} spaces={mockSpaces} />);

    // Should still render without crashing, showing N/A for avg days
    expect(screen.getByText('N/A')).toBeInTheDocument();
    expect(screen.getByText('Harvested')).toBeInTheDocument();
    // Multiple stat boxes show '1' (Total Plants, Grow Spaces, Harvested) — confirm at least one exists
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });

  it('should calculate stats correctly with mixed plant statuses', () => {
    const plants: Plant[] = [
      {
        ...basePlant, id: 'plant1', status: 'seedling',
      },
      {
        ...basePlant, id: 'plant2', status: 'vegetative',
      },
      {
        ...basePlant, id: 'plant3', status: 'flowering',
      },
      {
        ...basePlant,
        id: 'plant4',
        status: 'harvested',
        plantedDate: new Date('2024-01-01'),
        actualHarvestDate: new Date('2024-04-10'), // 100 days
      },
      {
        ...basePlant, id: 'plant5', status: 'removed',
      },
    ];

    render(<GardenStatsCard plants={plants} spaces={mockSpaces} />);

    // Total plants: 5
    expect(screen.getByText('5')).toBeInTheDocument();
    // Active (not harvested/removed): 3
    expect(screen.getByText('3')).toBeInTheDocument();
    // Avg days to harvest: 100
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should calculate success rate from harvested vs removed plants', () => {
    const plants: Plant[] = [
      {
        ...basePlant,
        id: 'p1',
        status: 'harvested',
        plantedDate: new Date('2024-01-01'),
        actualHarvestDate: new Date('2024-04-01'),
      },
      {
        ...basePlant,
        id: 'p2',
        status: 'harvested',
        plantedDate: new Date('2024-01-01'),
        actualHarvestDate: new Date('2024-04-01'),
      },
      {
        ...basePlant, id: 'p3', status: 'removed',
      },
    ];

    render(<GardenStatsCard plants={plants} spaces={mockSpaces} />);

    // Success rate: 2 harvested / 3 completed = 67%
    expect(screen.getByText('67%')).toBeInTheDocument();
  });

  it('should show empty state message when no plants exist', () => {
    render(<GardenStatsCard plants={[]} spaces={mockSpaces} />);

    expect(screen.getByText('Start adding plants to see your garden statistics!')).toBeInTheDocument();
  });
});
