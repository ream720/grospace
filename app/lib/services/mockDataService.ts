import type { Plant, GrowSpace, Task, PlantStatus, SpaceType, TaskStatus, TaskPriority } from '../types';
import type { Note, NoteCategory } from '../types/note';
import { subDays, subMonths, addDays } from 'date-fns';

/**
 * Mock Data Generator Service
 *
 * Generates realistic garden data for development and testing purposes.
 * This service will be removed before production release.
 */

// Helper to get random item from array
function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// Helper to get random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate unique ID
function generateId(): string {
  return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const PLANT_NAMES = [
  'Northern Lights', 'Blue Dream', 'OG Kush', 'Sour Diesel', 'Girl Scout Cookies',
  'White Widow', 'Gorilla Glue', 'Jack Herer', 'Green Crack', 'Purple Haze',
  'Amnesia Haze', 'AK-47', 'Trainwreck', 'Pineapple Express', 'Strawberry Cough'
];

const VARIETIES = [
  'Indica', 'Sativa', 'Hybrid', 'Autoflower Indica', 'Autoflower Sativa', 'Autoflower Hybrid'
];

const SEED_SOURCES = [
  'Local dispensary', 'Online seed bank', 'Friend\'s garden', 'Clone from mother',
  'ILGM', 'Seedsman', 'Crop King Seeds', 'Homegrown Cannabis Co'
];

const SPACE_NAMES = [
  'Main Tent', 'Veg Room', 'Flower Tent', 'Clone Cabinet', 'Outdoor Garden',
  'Greenhouse #1', 'Balcony Grow', 'Basement Setup'
];

const SPACE_TYPES: SpaceType[] = ['indoor-tent', 'outdoor-bed', 'greenhouse', 'hydroponic', 'container'];

const NOTE_CONTENTS = {
  observation: [
    'Plant looking healthy, new growth visible',
    'Leaves showing slight yellowing at tips',
    'Strong stem development, topped yesterday',
    'Pistils starting to show, entering flower soon',
    'Trichomes turning milky, almost ready for harvest'
  ],
  feeding: [
    'Fed with 1/2 strength veg nutrients',
    'Full strength bloom nutrients applied',
    'Added cal-mag supplement today',
    'Flushing with plain water for 2 weeks',
    'Foliar feeding with seaweed extract'
  ],
  pruning: [
    'Removed lower fan leaves for airflow',
    'Topped main cola for bushier growth',
    'LST training - tied down main branches',
    'Defoliated heavy fan leaves in week 3 flower',
    'Lollipopped bottom third of plant'
  ],
  issue: [
    'Found spider mites, treating with neem oil',
    'pH was off, adjusted to 6.5',
    'Some heat stress, raised lights 6 inches',
    'Root rot starting, added beneficial bacteria',
    'Nutrient lockout, flushing and resetting'
  ],
  milestone: [
    'First true leaves emerged!',
    'Switched to 12/12 light cycle',
    'Week 1 of flower complete',
    'Harvest day! Cut and hung to dry',
    'Curing complete, final weight logged'
  ],
  general: [
    'Reorganized tent layout',
    'Installed new carbon filter',
    'Calibrated pH meter',
    'Ordered new grow lights',
    'Deep cleaned the entire grow space'
  ]
};

const TASK_TITLES = [
  'Water plants', 'Check pH levels', 'Apply nutrients', 'Inspect for pests',
  'Adjust lighting', 'Prune dead leaves', 'Check humidity', 'Empty runoff tray',
  'Calibrate meters', 'Clean filters', 'Take photos for log', 'Check trichomes'
];

export interface MockDataResult {
  spaces: GrowSpace[];
  plants: Plant[];
  notes: Note[];
  tasks: Task[];
}

/**
 * Generate a complete year of mock garden data
 */
export function generateMockData(userId: string): MockDataResult {
  const now = new Date();
  const oneYearAgo = subMonths(now, 12);

  // Generate 3-5 spaces
  const numSpaces = 3 + Math.floor(Math.random() * 3);
  const spaces: GrowSpace[] = [];

  for (let i = 0; i < numSpaces; i++) {
    const createdAt = randomDate(oneYearAgo, subMonths(now, 6));
    spaces.push({
      id: generateId(),
      userId,
      name: SPACE_NAMES[i] || `Space ${i + 1}`,
      type: randomItem(SPACE_TYPES),
      description: `A well-maintained ${SPACE_TYPES[i % SPACE_TYPES.length]} grow space`,
      plantCount: 0, // Will be updated after plants are generated
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Generate 25-40 plants across spaces
  const numPlants = 25 + Math.floor(Math.random() * 16);
  const plants: Plant[] = [];
  const statuses: PlantStatus[] = ['seedling', 'vegetative', 'flowering', 'harvested', 'removed'];

  for (let i = 0; i < numPlants; i++) {
    const space = randomItem(spaces);
    const status = randomItem(statuses);
    const plantedDate = randomDate(oneYearAgo, subMonths(now, 1));

    // Calculate harvest date for harvested plants (60-120 days after planting)
    const harvestDays = 60 + Math.floor(Math.random() * 60);
    const expectedHarvestDate = addDays(plantedDate, harvestDays);
    const actualHarvestDate = status === 'harvested'
      ? addDays(plantedDate, harvestDays + Math.floor(Math.random() * 14) - 7)
      : undefined;

    plants.push({
      id: generateId(),
      userId,
      spaceId: space.id,
      name: randomItem(PLANT_NAMES),
      variety: randomItem(VARIETIES),
      seedSource: randomItem(SEED_SOURCES),
      plantedDate,
      expectedHarvestDate,
      actualHarvestDate,
      status,
      notes: status === 'harvested' ? 'Great yield, dense buds!' : undefined,
      createdAt: plantedDate,
      updatedAt: actualHarvestDate || now,
    });

    space.plantCount++;
  }

  // Generate notes for plants (2-5 per plant)
  const notes: Note[] = [];
  const noteCategories: NoteCategory[] = ['observation', 'feeding', 'pruning', 'issue', 'milestone', 'general'];

  plants.forEach(plant => {
    const numNotes = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numNotes; i++) {
      const category = randomItem(noteCategories);
      const noteContent = randomItem(NOTE_CONTENTS[category]);
      const noteDate = randomDate(plant.plantedDate, plant.actualHarvestDate || now);

      notes.push({
        id: generateId(),
        userId,
        plantId: plant.id,
        spaceId: plant.spaceId,
        content: noteContent,
        category,
        photos: [],
        timestamp: noteDate,
        createdAt: noteDate,
        updatedAt: noteDate,
      });
    }
  });

  // Generate tasks (some completed, some pending)
  const tasks: Task[] = [];
  const priorities: TaskPriority[] = ['low', 'medium', 'high'];

  // Generate 30-50 tasks
  const numTasks = 30 + Math.floor(Math.random() * 21);
  for (let i = 0; i < numTasks; i++) {
    const plant = randomItem(plants);
    const status: TaskStatus = Math.random() > 0.3 ? 'completed' : 'pending';
    const createdAt = randomDate(subMonths(now, 6), subDays(now, 7));
    const dueDate = addDays(createdAt, Math.floor(Math.random() * 14));
    const completedAt = status === 'completed' ? addDays(dueDate, Math.floor(Math.random() * 3) - 1) : undefined;

    tasks.push({
      id: generateId(),
      userId,
      plantId: plant.id,
      spaceId: plant.spaceId,
      title: randomItem(TASK_TITLES),
      description: `Task for ${plant.name}`,
      dueDate,
      priority: randomItem(priorities),
      status,
      completedAt,
      createdAt,
      updatedAt: completedAt || createdAt,
    });
  }

  return { spaces, plants, notes, tasks };
}

export const mockDataService = {
  generateMockData,
};
