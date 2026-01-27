import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { Plant, GrowSpace } from '../../lib/types';
import { usePlantStore } from '../../stores/plantStore';

const moveFormSchema = z.object({
  newSpaceId: z.string().min(1, 'Please select a space'),
});

type MoveFormData = z.infer<typeof moveFormSchema>;

interface MoveDialogProps {
  plant: Plant;
  spaces: GrowSpace[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function MoveDialog({ plant, spaces, onSuccess, onCancel }: MoveDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { movePlant } = usePlantStore();

  const form = useForm<MoveFormData>({
    resolver: zodResolver(moveFormSchema),
    defaultValues: {
      newSpaceId: '',
    },
  });

  // Filter out the current space
  const availableSpaces = spaces.filter(space => space.id !== plant.spaceId);
  const currentSpace = spaces.find(space => space.id === plant.spaceId);

  const onSubmit = async (data: MoveFormData) => {
    setIsSubmitting(true);
    try {
      await movePlant(plant.id, data.newSpaceId);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to move plant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Move Plant</DialogTitle>
          <DialogDescription>
            Move "{plant.name}" from {currentSpace?.name} to a different space.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="newSpaceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Move to Space</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination space" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableSpaces.map((space) => (
                        <SelectItem key={space.id} value={space.id}>
                          <div className="flex flex-col">
                            <span>{space.name}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {space.type.replace('-', ' ')} • {space.plantCount} plants
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || availableSpaces.length === 0}>
                {isSubmitting ? 'Moving...' : 'Move Plant'}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {availableSpaces.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No other spaces available. Create another space to move this plant.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}