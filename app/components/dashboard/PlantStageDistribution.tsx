import { useMemo } from 'react';
import { Sprout, Leaf, Flower, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import type { Plant, PlantStatus } from '../../lib/types';

interface PlantStageDistributionProps {
  plants: Plant[];
  isLoading?: boolean;
}

const STAGE_CONFIG: Record<PlantStatus, { label: string; icon: any; color: string; bg: string }> = {
  seedling: { label: 'Seedling', icon: Sprout, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  vegetative: { label: 'Vegetative', icon: Leaf, color: 'text-green-600', bg: 'bg-green-600' },
  flowering: { label: 'Flowering', icon: Flower, color: 'text-pink-500', bg: 'bg-pink-500' },
  harvested: { label: 'Harvested', icon: CheckCircle2, color: 'text-orange-500', bg: 'bg-orange-500' },
  removed: { label: 'Removed', icon: CheckCircle2, color: 'text-gray-400', bg: 'bg-gray-400' }, // Typically filtered out but good to have
};

export function PlantStageDistribution({ plants, isLoading }: PlantStageDistributionProps) {
  const stats = useMemo(() => {
    const counts = {
      seedling: 0,
      vegetative: 0,
      flowering: 0,
      harvested: 0,
      removed: 0,
    };

    plants.forEach((plant) => {
      if (counts[plant.status] !== undefined) {
        counts[plant.status]++;
      }
    });

    // Filter out removed for the percentage calculation base, or keep them?
    // Let's keep them out of the main "Active" visual, but maybe show Harvested.
    // Actually, usually users want to see Active plants distribution.
    const activeTotal = counts.seedling + counts.vegetative + counts.flowering;

    return { counts, activeTotal };
  }, [plants]);

  const stages: PlantStatus[] = ['seedling', 'vegetative', 'flowering'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plant Stages</CardTitle>
          <CardDescription>Distribution of active plants</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {/* Skeleton loader would go here */}
           <div className="h-4 bg-muted rounded w-full animate-pulse" />
           <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
           <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plant Stages</CardTitle>
        <CardDescription>Distribution of active plants</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.activeTotal === 0 ? (
           <div className="text-center py-8 text-muted-foreground">
             <p>No active plants</p>
           </div>
        ) : (
          <div className="space-y-5">
            {stages.map((stage) => {
              const count = stats.counts[stage];
              const percentage = stats.activeTotal > 0 ? (count / stats.activeTotal) * 100 : 0;
              const config = STAGE_CONFIG[stage];
              const Icon = config.icon;

              if (count === 0) return null;

              return (
                <div key={stage} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {count} ({Math.round(percentage)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" indicatorClassName={config.bg} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
