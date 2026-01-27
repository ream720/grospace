// Export base service and types
export { BaseService } from './baseService';
export type { ServiceError, ServiceResult, QueryFilters } from './baseService';

// Export space service
export { SpaceService, spaceService } from './spaceService';
export type { CreateSpaceData, UpdateSpaceData } from './spaceService';

// Export plant service
export { PlantService, plantService } from './plantService';
export type { CreatePlantData, UpdatePlantData, MovePlantData } from './plantService';