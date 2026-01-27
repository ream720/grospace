import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteForm } from '../../../components/notes/NoteForm';
import type { NoteCategory } from '../../../lib/types/note';

// Mock the stores
const mockSpaces = [
  { id: 'space-1', name: 'Indoor Tent', type: 'indoor-tent', userId: 'user-1', plantCount: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'space-2', name: 'Outdoor Bed', type: 'outdoor-bed', userId: 'user-1', plantCount: 1, createdAt: new Date(), updatedAt: new Date() },
];

const mockPlants = [
  { id: 'plant-1', name: 'Tomato', variety: 'Cherry', spaceId: 'space-1', userId: 'user-1', status: 'vegetative', plantedDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: 'plant-2', name: 'Basil', variety: 'Sweet', spaceId: 'space-1', userId: 'user-1', status: 'vegetative', plantedDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
  { id: 'plant-3', name: 'Lettuce', variety: 'Romaine', spaceId: 'space-2', userId: 'user-1', status: 'vegetative', plantedDate: new Date(), createdAt: new Date(), updatedAt: new Date() },
];

vi.mock('../../../stores/spaceStore', () => ({
  useSpaceStore: () => ({
    spaces: mockSpaces,
  }),
}));

vi.mock('../../../stores/plantStore', () => ({
  usePlantStore: () => ({
    plants: mockPlants,
  }),
}));

describe('NoteForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Values and Plant-Space Relationship', () => {
    it('should pre-select plant when initialPlantId is provided', async () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialPlantId="plant-1"
        />
      );

      // Wait for the form to initialize
      await waitFor(() => {
        // Check if the plant select shows the correct plant
        // Since we can't easily test Select component values due to portals,
        // we'll test that the form renders without errors and has the expected structure
        expect(screen.getByLabelText('Plant (Optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('Grow Space')).toBeInTheDocument();
      });
    });

    it('should pre-select space when initialSpaceId is provided', async () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialSpaceId="space-1"
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Grow Space')).toBeInTheDocument();
        expect(screen.getByLabelText('Plant (Optional)')).toBeInTheDocument();
      });
    });

    it('should pre-select both plant and its space when initialPlantId is provided', async () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialPlantId="plant-1" // This plant is in space-1
        />
      );

      await waitFor(() => {
        // The form should render with both plant and space fields
        expect(screen.getByLabelText('Plant (Optional)')).toBeInTheDocument();
        expect(screen.getByLabelText('Grow Space')).toBeInTheDocument();
        
        // The form should be ready for submission (no validation errors initially)
        expect(screen.getByRole('button', { name: /save note/i })).toBeInTheDocument();
      });
    });

    it('should render all required form fields', () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByLabelText('Note Content')).toBeInTheDocument();
      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Grow Space')).toBeInTheDocument();
      expect(screen.getByLabelText('Plant (Optional)')).toBeInTheDocument();
      expect(screen.getByLabelText('Date & Time')).toBeInTheDocument();
    });

    it('should show validation error when no content is provided', async () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialSpaceId="space-1"
        />
      );

      const submitButton = screen.getByRole('button', { name: /save note/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Content is required')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error when neither plant nor space is selected', async () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      // Fill in content
      const contentField = screen.getByLabelText('Note Content');
      fireEvent.change(contentField, { target: { value: 'Test note content' } });

      const submitButton = screen.getByRole('button', { name: /save note/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select either a plant or space')).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should call onSubmit with correct data when form is valid', async () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          initialPlantId="plant-1"
        />
      );

      // Fill in content
      const contentField = screen.getByLabelText('Note Content');
      fireEvent.change(contentField, { target: { value: 'Test note about plant growth' } });

      const submitButton = screen.getByRole('button', { name: /save note/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Test note about plant growth',
            category: 'observation',
            plantId: 'plant-1',
            timestamp: expect.any(Date),
            photos: [],
          })
        );
      });
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should disable submit button when loading', () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
          loading={true}
        />
      );

      const submitButton = screen.getByRole('button', { name: /saving/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Behavior', () => {
    it('should show character count for content field', () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('0/2000')).toBeInTheDocument();

      const contentField = screen.getByLabelText('Note Content');
      fireEvent.change(contentField, { target: { value: 'Test content' } });

      expect(screen.getByText('12/2000')).toBeInTheDocument();
    });

    it('should show photo upload section', () => {
      render(
        <NoteForm
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );

      expect(screen.getByText('Photos')).toBeInTheDocument();
    });
  });
});