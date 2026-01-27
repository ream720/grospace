import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import type { Plant } from '../../lib/types';
import { usePlantStore } from '../../stores/plantStore';

const harvestFormSchema = z.object({
  harvestDate: z.date({
    required_error: 'Harvest date is required',
  }),
});

type HarvestFormData = z.infer<typeof harvestFormSchema>;

interface HarvestDialogProps {
  plant: Plant;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function HarvestDialog({ plant, onSuccess, onCancel }: HarvestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { harvestPlant } = usePlantStore();

  const form = useForm<HarvestFormData>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues: {
      harvestDate: new Date(),
    },
  });

  const onSubmit = async (data: HarvestFormData) => {
    setIsSubmitting(true);
    try {
      await harvestPlant(plant.id, data.harvestDate);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to record harvest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onCancel?.()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Harvest</DialogTitle>
          <DialogDescription>
            Record the harvest date for "{plant.name}". This will mark the plant as harvested.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="harvestDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Harvest Date</FormLabel>
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
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick harvest date</span>
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
                          date > new Date() || date < plant.plantedDate
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Once marked as harvested, this plant will be moved to completed status. 
                You can still edit the plant details later if needed.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Recording...' : 'Record Harvest'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}