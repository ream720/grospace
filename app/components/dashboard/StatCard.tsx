import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

interface StatCardProps {
    title: string;
    value: number | string;
    description: string;
    icon: LucideIcon;
    isLoading?: boolean;
    iconClassName?: string;
    trend?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    isLoading,
    iconClassName = "text-muted-foreground",
    trend
}: StatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${iconClassName}`} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className="h-8 w-16 mb-1" />
                ) : (
                    <div className="flex flex-col">
                        <div className="text-2xl font-bold">{value}</div>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                            {trend && (
                                <span className="text-green-600 font-medium mr-2">
                                    {trend}
                                </span>
                            )}
                            {description}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
