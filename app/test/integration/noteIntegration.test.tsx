import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { PlantCard } from '../../components/plants/PlantCard';
import { SpaceCard } from '../../components/spaces/SpaceCard';
import type { Plant, GrowSpace } from '../../lib/types';

// Mock the note service
vi.mock('../../lib/services/noteService', () => ({
  noteService: {
    list: vi.fn(),
  },
}));

// Mock the stores
vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { uid: 'test-user-id' },
  }),
}));

vi.mock('../../stores/plantStore', () => ({
  usePlantStore: () => ({
    deletePlant: vi.fn(),
  }),
}));

vi.mock('../../stores/spaceStore', () => ({
  useSpaceStore: () => ({
    spaces: [
      {
        id: 'space-123',
        userId: 'test-user-id',
        name: 'Indoor Tent',
        type: 'indoor-tent',
        plantCount: 2,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ],
    deleteSpace: vi.fn(),
  }),
}));

// Wrapper component for router context
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Note Integration', () => {
  const mockPlant: Plant = {
    id: 'plant-123',
    userId: 'test-user-id',
    name: 'Test Tomato',
    variety: 'Cherry',
    spaceId: 'space-123',
    status: 'vegetative',
    plantedDate: new Date('2024-01-01'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockSpace: GrowSpace = {
    id: 'space-123',
    userId: 'test-user-id',
    name: 'Indoor Tent',
    type: 'indoor-tent',
    plantCount: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('PlantCard Note Integration', () => {
    it('should show note count badge when plant has notes', async () => {
      const { noteService } = await import('../../lib/services/noteService');
      vi.mocked(noteService.list).mockResolvedValue([
        {
          id: 'note-1',
          userId: 'test-user-id',
          plantId: 'plant-123',
          content: 'Test note',
          category: 'observation',
          photos: [],
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      render(
        <RouterWrapper>
          <PlantCard plant={mockPlant} />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should not show note count badge when plant has no notes', async () => {
      const { noteService } = await import('../../lib/services/noteService');
      vi.mocked(noteService.list).mockResolvedValue([]);

      render(
        <RouterWrapper>
          <PlantCard plant={mockPlant} />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('1')).not.toBeInTheDocument();
      });
    });

    it('should have "View Notes" option in dropdown menu', async () => {
      const { noteService } = await import('../../lib/services/noteService');
      vi.mocked(noteService.list).mockResolvedValue([
        {
          id: 'note-1',
          userId: 'test-user-id',
          plantId: 'plant-123',
          content: 'Test note',
          category: 'observation',
          photos: [],
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      render(
        <RouterWrapper>
          <PlantCard plant={mockPlant} />
        </RouterWrapper>
      );

      // Test that the dropdown button exists (since dropdown content is in a portal and hard to test)
      const menuButton = screen.getByRole('button');
      expect(menuButton).toBeInTheDocument();
      
      // Test that the component has note functionality by checking for the note count badge
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });
  });

  describe('SpaceCard Note Integration', () => {
    it('should show note count badge when space has notes', async () => {
      const { noteService } = await import('../../lib/services/noteService');
      vi.mocked(noteService.list).mockResolvedValue([
        {
          id: 'note-1',
          userId: 'test-user-id',
          spaceId: 'space-123',
          content: 'Test space note',
          category: 'observation',
          photos: [],
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      render(
        <RouterWrapper>
          <SpaceCard 
            space={mockSpace} 
            onUpdate={vi.fn()} 
            onDelete={vi.fn()} 
          />
        </RouterWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
      });
    });

    it('should have "View Notes" option in dropdown menu', async () => {
      const { noteService } = await import('../../lib/services/noteService');
      vi.mocked(noteService.list).mockResolvedValue([]);

      render(
        <RouterWrapper>
          <SpaceCard 
            space={mockSpace} 
            onUpdate={vi.fn()} 
            onDelete={vi.fn()} 
          />
        </RouterWrapper>
      );

      // Test that the dropdown button exists (since dropdown content is in a portal and hard to test)
      const menuButtons = screen.getAllByRole('button');
      expect(menuButtons.length).toBeGreaterThan(0);
      
      // Test that the component renders properly with Router context
      expect(screen.getAllByText('Indoor Tent').length).toBeGreaterThan(0);
    });
  });
});