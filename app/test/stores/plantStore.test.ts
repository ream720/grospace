import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlantStore } from '../../stores/plantStore';
import { useAuthStore } from '../../stores/authStore';
import { plantService } from '../../lib/services/plantService';
import type { Plant } from '../../lib/types';

// Mock the plant service
vi.mock('../../lib/services/plantService', () => ({
  plantService: {
    getUserPlants: vi.fn(),
    getPlantsBySpace: vi.fn(),
    createPlant: vi.fn(),
    updatePlant: vi.fn(),
    deletePlant: vi.fn(),
    movePlant: vi.fn(),
    harvestPlant: vi.fn(),
  },
}));

// Mock the auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: {
    getState: vi.fn(),
  },
}));

const mockPlant: Plant = {
  id: 'plant-1',
  spaceId: 'space-1',
  userId: 'user-1',
  name: 'Test Plant',
  variety: 'Test Variety',
  plantedDate: new Date('2024-01-01'),
  status: 'seedling',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('Plant Store', () => {
  beforeEach(() => {
    // Reset store state
    usePlantStore.setState({
      plants: [],
      selectedPlant: null,
      loading: false,
      error: null,
    });

    // Mock auth user
    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: { uid: 'user-1' },
    } as any);
  });

  it('should load plants successfully', async () => {
    vi.mocked(plantService.getUserPlants).mockResolvedValue({
      data: [mockPlant],
      error: null,
    });

    const { loadPlants } = usePlantStore.getState();
    await loadPlants();

    const state = usePlantStore.getState();
    expect(state.plants).toEqual([mockPlant]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe(null);
  });

  it('should handle load plants error', async () => {
    vi.mocked(plantService.getUserPlants).mockResolvedValue({
      data: null,
      error: { message: 'Failed to load plants' },
    });

    const { loadPlants } = usePlantStore.getState();
    await loadPlants();

    const state = usePlantStore.getState();
    expect(state.plants).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load plants');
  });

  it('should create plant successfully', async () => {
    const newPlant = { ...mockPlant, id: 'plant-2', name: 'New Plant' };
    vi.mocked(plantService.createPlant).mockResolvedValue({
      data: newPlant,
      error: null,
    });

    const { createPlant } = usePlantStore.getState();
    const result = await createPlant({
      spaceId: 'space-1',
      userId: 'user-1',
      name: 'New Plant',
      variety: 'Test Variety',
      plantedDate: new Date('2024-01-01'),
      status: 'seedling',
    });

    expect(result).toEqual(newPlant);
    const state = usePlantStore.getState();
    expect(state.plants).toContain(newPlant);
  });

  it('should update plant successfully', async () => {
    // Set initial state with a plant
    usePlantStore.setState({ plants: [mockPlant] });

    const updatedPlant = { ...mockPlant, name: 'Updated Plant' };
    vi.mocked(plantService.updatePlant).mockResolvedValue({
      data: updatedPlant,
      error: null,
    });

    const { updatePlant } = usePlantStore.getState();
    await updatePlant('plant-1', { name: 'Updated Plant' });

    const state = usePlantStore.getState();
    expect(state.plants[0]).toEqual(updatedPlant);
  });

  it('should delete plant successfully', async () => {
    // Set initial state with a plant
    usePlantStore.setState({ plants: [mockPlant] });

    vi.mocked(plantService.deletePlant).mockResolvedValue({
      data: null,
      error: null,
    });

    const { deletePlant } = usePlantStore.getState();
    await deletePlant('plant-1');

    const state = usePlantStore.getState();
    expect(state.plants).toEqual([]);
  });

  it('should move plant to new space', async () => {
    // Set initial state with a plant
    usePlantStore.setState({ plants: [mockPlant] });

    const movedPlant = { ...mockPlant, spaceId: 'space-2' };
    vi.mocked(plantService.movePlant).mockResolvedValue({
      data: movedPlant,
      error: null,
    });

    const { movePlant } = usePlantStore.getState();
    await movePlant('plant-1', 'space-2');

    const state = usePlantStore.getState();
    expect(state.plants[0].spaceId).toBe('space-2');
  });

  it('should harvest plant', async () => {
    // Set initial state with a plant
    usePlantStore.setState({ plants: [mockPlant] });

    const harvestDate = new Date('2024-06-01');
    const harvestedPlant = { 
      ...mockPlant, 
      status: 'harvested' as const,
      actualHarvestDate: harvestDate 
    };
    vi.mocked(plantService.harvestPlant).mockResolvedValue({
      data: harvestedPlant,
      error: null,
    });

    const { harvestPlant } = usePlantStore.getState();
    await harvestPlant('plant-1', harvestDate);

    const state = usePlantStore.getState();
    expect(state.plants[0].status).toBe('harvested');
    expect(state.plants[0].actualHarvestDate).toEqual(harvestDate);
  });

  it('should filter plants by space', () => {
    const plant1 = { ...mockPlant, id: 'plant-1', spaceId: 'space-1' };
    const plant2 = { ...mockPlant, id: 'plant-2', spaceId: 'space-2' };
    
    usePlantStore.setState({ plants: [plant1, plant2] });

    const { getPlantsBySpace } = usePlantStore.getState();
    const space1Plants = getPlantsBySpace('space-1');
    
    expect(space1Plants).toEqual([plant1]);
    expect(space1Plants).not.toContain(plant2);
  });

  it('should select plant', () => {
    const { selectPlant } = usePlantStore.getState();
    selectPlant(mockPlant);

    const state = usePlantStore.getState();
    expect(state.selectedPlant).toEqual(mockPlant);
  });

  it('should handle authentication error', async () => {
    vi.mocked(useAuthStore.getState).mockReturnValue({
      user: null,
    } as any);

    const { loadPlants } = usePlantStore.getState();
    await loadPlants();

    const state = usePlantStore.getState();
    expect(state.error).toBe('User not authenticated');
    expect(state.loading).toBe(false);
  });
});