import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { PhotoUpload } from './PhotoUpload';
import { NOTE_CATEGORIES, type NoteCategory } from '../../lib/types/note';
import { useSpaceStore } from '../../stores/spaceStore';
import { usePlantStore } from '../../stores/plantStore';

const noteFormSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  category: z.enum(['observation', 'feeding', 'pruning', 'issue', 'milestone', 'general'] as const),
  plantId: z.string().optional(),
  spaceId: z.string().optional(),
  timestamp: z.string().optional(),
}).refine(data => (data.plantId && data.plantId !== 'none') || (data.spaceId && data.spaceId !== 'none'), {
  message: 'Please select either a plant or space',
  path: ['plantId'],
});

type NoteFormData = z.infer<typeof noteFormSchema>;

interface NoteFormProps {
  onSubmit: (data: {
    content: string;
    category: NoteCategory;
    plantId?: string;
    spaceId?: string;
    timestamp?: Date;
    photos: File[];
  }) => Promise<void>;
  onCancel: () => void;
  initialPlantId?: string;
  initialSpaceId?: string;
  loading?: boolean;
}

export function NoteForm({ 
  onSubmit, 
  onCancel, 
  initialPlantId, 
  initialSpaceId,
  loading = false 
}: NoteFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const { spaces } = useSpaceStore();
  const { plants } = usePlantStore();

  const form = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      content: '',
      category: 'observation',
      plantId: initialPlantId || 'none',
      spaceId: initialSpaceId || 'none',
      timestamp: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    },
  });

  // Reset form values when initial props change and handle plant-space relationship
  React.useEffect(() => {
    let effectiveSpaceId = initialSpaceId || 'none';
    
    // If we have an initialPlantId, try to get its space
    if (initialPlantId && initialPlantId !== 'none' && plants.length > 0) {
      const plant = plants.find(p => p.id === initialPlantId);
      
      if (plant && plant.spaceId && spaces.length > 0) {
        // Verify the space exists in the spaces array
        const spaceExists = spaces.find(s => s.id === plant.spaceId);
        
        if (spaceExists) {
          effectiveSpaceId = plant.spaceId;
        }
      }
    }

    form.reset({
      content: '',
      category: 'observation',
      plantId: initialPlantId || 'none',
      spaceId: effectiveSpaceId,
      timestamp: new Date().toISOString().slice(0, 16),
    });

    // Ensure Select component displays the correct value by setting it again after render
    // This handles timing issues with controlled Select components
    setTimeout(() => {
      if (effectiveSpaceId !== 'none') {
        form.setValue('spaceId', effectiveSpaceId);
      }
    }, 100);
  }, [initialPlantId, initialSpaceId, plants, spaces, form]);

  const selectedPlantId = form.watch('plantId');
  const selectedSpaceId = form.watch('spaceId');

  // Filter plants based on selected space
  const availablePlants = selectedSpaceId && selectedSpaceId !== 'none'
    ? plants.filter(plant => plant.spaceId === selectedSpaceId)
    : plants;

  const handleSubmit = async (data: NoteFormData) => {
    try {
      await onSubmit({
        content: data.content,
        category: data.category,
        plantId: data.plantId && data.plantId !== 'none' ? data.plantId : undefined,
        spaceId: data.spaceId && data.spaceId !== 'none' ? data.spaceId : undefined,
        timestamp: data.timestamp ? new Date(data.timestamp) : undefined,
        photos,
      });
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  // When space changes, clear plant selection if plant is not in the new space
  React.useEffect(() => {
    if (selectedSpaceId && selectedSpaceId !== 'none' && selectedPlantId && selectedPlantId !== 'none') {
      const plant = plants.find(p => p.id === selectedPlantId);
      if (plant && plant.spaceId !== selectedSpaceId) {
        form.setValue('plantId', 'none');
      }
    }
  }, [selectedSpaceId, selectedPlantId, plants, form]);

  // When plant changes manually (not initial load), automatically set the space to that plant's space
  React.useEffect(() => {
    if (selectedPlantId && selectedPlantId !== 'none' && selectedPlantId !== initialPlantId) {
      const plant = plants.find(p => p.id === selectedPlantId);
      if (plant && plant.spaceId) {
        form.setValue('spaceId', plant.spaceId);
      }
    }
  }, [selectedPlantId, plants, form, initialPlantId]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Content */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter your observation, note, or comment..."
                  className="min-h-[120px] resize-none"
                  {...field}
                />
              </FormControl>
              <div className="text-sm text-muted-foreground text-right">
                {field.value.length}/2000
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {NOTE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Space Selection */}
        <FormField
          control={form.control}
          name="spaceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grow Space</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a grow space" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No specific space</SelectItem>
                  {spaces.map((space) => (
                    <SelectItem key={space.id} value={space.id}>
                      {space.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Plant Selection */}
        <FormField
          control={form.control}
          name="plantId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plant (Optional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a plant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No specific plant</SelectItem>
                  {availablePlants.map((plant) => (
                    <SelectItem key={plant.id} value={plant.id}>
                      {plant.name} ({plant.variety})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Timestamp */}
        <FormField
          control={form.control}
          name="timestamp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date & Time</FormLabel>
              <FormControl>
                <Input
                  type="datetime-local"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Photo Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Photos</label>
          <PhotoUpload
            photos={photos}
            onPhotosChange={setPhotos}
            disabled={loading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </form>
    </Form>
  );
}