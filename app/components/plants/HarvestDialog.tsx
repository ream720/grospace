import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Textarea } from '../ui/textarea';
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
import { toDate } from '../../lib/utils/dateUtils';

const harvestFormSchema = z.object({
  harvestDate: z.date(),
  createLinkedNote: z.boolean(),
  noteContent: z.string(),
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
  const plantedDate = toDate(plant.plantedDate);

  const form = useForm<HarvestFormData>({
    resolver: zodResolver(harvestFormSchema),
    defaultValues: {
      harvestDate: new Date(),
      createLinkedNote: true,
      noteContent: '',
    },
  });
  const createLinkedNote = form.watch('createLinkedNote');

  const onSubmit = async (data: HarvestFormData) => {
    setIsSubmitting(true);
    try {
      const result = await harvestPlant(plant.id, data.harvestDate, {
        createLinkedNote: data.createLinkedNote,
        noteContent: data.noteContent,
        noteTimestamp: data.harvestDate,
      });

      if (data.createLinkedNote && result.noteError) {
        toast.warning(
          'Harvest recorded, but the linked note could not be saved.'
        );
      } else if (data.createLinkedNote && result.noteCreated) {
        toast.success('Harvest and linked note recorded successfully.');
      } else {
        toast.success('Harvest recorded successfully.');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Failed to record harvest:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to record harvest'
      );
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
                          date > new Date() || (plantedDate ? date < plantedDate : false)
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
              name="createLinkedNote"
              render={({ field }) => (
                <FormItem className="space-y-2 rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <input
                      id="createLinkedNote"
                      type="checkbox"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                      className="h-4 w-4"
                    />
                    <FormLabel htmlFor="createLinkedNote" className="mb-0 cursor-pointer">
                      Create linked harvest note
                    </FormLabel>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Adds a milestone note in Events tied to this plant and space context.
                  </p>
                </FormItem>
              )}
            />

            {createLinkedNote && (
              <FormField
                control={form.control}
                name="noteContent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="harvestNote">Harvest Note (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        id="harvestNote"
                        {...field}
                        rows={4}
                        placeholder="Capture success, yield, lessons learned, or next-cycle adjustments."
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      If left blank, we&apos;ll save: &quot;Harvest recorded for {plant.name}.&quot;
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Once marked as harvested, this plant will be moved to completed status. 
                You can still edit the plant details later if needed.
              </p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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
