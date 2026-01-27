import { describe, it, expect } from 'vitest';
import { SpaceService, PlantService } from '../../lib/services';
import type { GrowSpace, Plant } from '../../lib/types';

// Simple integration tests to verify service structure and methods exist
describe('Services Integration', () => {
  describe('SpaceService', () => {
    it('should have all required methods', () => {
      const service = new SpaceService();
      
      expect(typeof service.createSpace).toBe('function');
      expect(typeof service.getUserSpaces).toBe('function');
      expect(typeof service.updateSpace).toBe('function');
      expect(typeof service.deleteSpace).toBe('function');
      expect(typeof service.updatePlantCount).toBe('function');
      expect(typeof service.subscribeToUserSpaces).toBe('function');
      expect(typeof service.getSpacesByType).toBe('function');
      
      // Base service methods
      expect(typeof service.create).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.list).toBe('function');
      expect(typeof service.subscribe).toBe('function');
    });

    it('should validate space creation data', async () => {
      const service = new SpaceService();
      
      // Test empty name validation
      const result = await service.createSpace({
        userId: 'test-user',
        name: '',
        type: 'outdoor-bed',
      });
      
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toBe('Space name is required');
    });

    it('should validate space type', async () => {
      const service = new SpaceService();
      
      const result = await service.createSpace({
        userId: 'test-user',
        name: 'Test Space',
        type: 'invalid-type' as any,
      });
      
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toBe('Invalid space type');
    });
  });

  describe('PlantService', () => {
    it('should have all required methods', () => {
      const service = new PlantService();
      
      expect(typeof service.createPlant).toBe('function');
      expect(typeof service.getSpacePlants).toBe('function');
      expect(typeof service.getUserPlants).toBe('function');
      expect(typeof service.getPlantsByStatus).toBe('function');
      expect(typeof service.updatePlant).toBe('function');
      expect(typeof service.movePlant).toBe('function');
      expect(typeof service.harvestPlant).toBe('function');
      expect(typeof service.removePlant).toBe('function');
      expect(typeof service.subscribeToSpacePlants).toBe('function');
      expect(typeof service.subscribeToUserPlants).toBe('function');
      
      // Base service methods
      expect(typeof service.create).toBe('function');
      expect(typeof service.getById).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.delete).toBe('function');
      expect(typeof service.list).toBe('function');
      expect(typeof service.subscribe).toBe('function');
    });

    it('should validate plant creation data', async () => {
      const service = new PlantService();
      
      // Test empty name validation
      const result = await service.createPlant({
        spaceId: 'test-space',
        userId: 'test-user',
        name: '',
        variety: 'Test Variety',
        plantedDate: new Date(),
      });
      
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toBe('Plant name is required');
    });

    it('should validate plant status', async () => {
      const service = new PlantService();
      
      const result = await service.getPlantsByStatus('test-user', 'invalid-status' as any);
      
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('VALIDATION_ERROR');
      expect(result.error?.message).toBe('Invalid plant status');
    });
  });

  describe('Error Handling', () => {
    it('should handle Firebase errors correctly', () => {
      const service = new SpaceService();
      
      // Test permission denied error
      const permissionError = {
        code: 'permission-denied',
        message: 'Permission denied',
      };
      
      const result = service['handleError'](permissionError);
      
      expect(result.code).toBe('PERMISSION_DENIED');
      expect(result.message).toBe('You do not have permission to perform this action');
    });

    it('should handle generic errors', () => {
      const service = new SpaceService();
      
      const genericError = new Error('Generic error');
      const result = service['handleError'](genericError);
      
      expect(result.code).toBe('UNKNOWN_ERROR');
      expect(result.message).toBe('Generic error');
    });
  });
});