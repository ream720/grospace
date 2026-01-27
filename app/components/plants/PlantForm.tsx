import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import type { Plant, PlantStatus, GrowSpace } from '../../lib/types';
import { usePlantStore } from '../../stores/plantStore';
import { useAuthStore } from '../../stores/authStore';
import { toDate } from '../../lib/utils/dateUtils';

const plantFormSchema = z.object({
  name: z.string().min(1, 'Plant name is required'),
  variety: z.string().min(1, 'Variety is required'),
  spaceId: z.string().min(1, 'Space selection is required'),
  seedSource: z.string().optional(),
  plantedDate: z.date({
    required_error: 'Planting date is required',
  }),
  expectedHarvestDate: z.date().optional(),
  status: z.enum(['seedling', 'vegetative', 'flowering', 'harvested', 'removed'] as const),
  notes: z.string().optional(),
});

type PlantFormData = z.infer<typeof plantFormSchema>;

interface PlantFormProps {
  plant?: Plant;
  spaces: GrowSpace[];
  onSuccess?: (plant: Plant) => void;
  onCancel?: () => void;
}

export function PlantForm({ plant, spaces, onSuccess, onCancel }: PlantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPlant, updatePlant } = usePlantStore();
  const { user } = useAuthStore();

  const form = useForm<PlantFormData>({
    resolver: zodResolver(plantFormSchema),
    defaultValues: {
      name: plant?.name || '',
      variety: plant?.variety || '',
      spaceId: plant?.spaceId || '',
      seedSource: plant?.seedSource || '',
      plantedDate: plant?.plantedDate ? toDate(plant.plantedDate) : new Date(),
      expectedHarvestDate: plant?.expectedHarvestDate ? toDate(plant.expectedHarvestDate) : undefined,
      status: plant?.status || 'seedling',
      notes: plant?.notes || '',
    },
  });

  // Reset form when plant data changes
  useEffect(() => {
    if (plant) {
      form.reset({
        name: plant.name || '',
        variety: plant.variety || '',
        spaceId: plant.spaceId || '',
        seedSource: plant.seedSource || '',
        plantedDate: plant.plantedDate ? toDate(plant.plantedDate) : new Date(),
        expectedHarvestDate: plant.expectedHarvestDate ? toDate(plant.expectedHarvestDate) : undefined,
        status: plant.status || 'seedling',
        notes: plant.notes || '',
      });
    }
  }, [plant, form]);

  const onSubmit = async (data: PlantFormData) => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (plant) {
        // Update existing plant
        await updatePlant(plant.id, data);
        onSuccess?.(plant);
      } else {
        // Create new plant
        const newPlant = await createPlant({
          ...data,
          userId: user.uid,
        });
        onSuccess?.(newPlant);
      }
    } catch (error) {
      console.error('Failed to save plant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plant Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Tomato #1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="variety"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variety/Cultivar</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Cherry Tomato" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="spaceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grow Space</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a space" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="seedling">Seedling</SelectItem>
                    <SelectItem value="vegetative">Vegetative</SelectItem>
                    <SelectItem value="flowering">Flowering</SelectItem>
                    <SelectItem value="harvested">Harvested</SelectItem>
                    <SelectItem value="removed">Removed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="seedSource"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seed Source (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Local nursery, online store" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="plantedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Planting Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedHarvestDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expected Harvest Date (Optional)</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value && field.value instanceof Date && !isNaN(field.value.getTime()) ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional notes about this plant..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Add any relevant information about this plant.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : plant ? 'Update Plant' : 'Add Plant'}
          </Button>
        </div>
      </form>
    </Form>
  );
}