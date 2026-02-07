import { Link } from 'react-router';
import { Building2, Sprout, CheckSquare, StickyNote, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

export function QuickActions() {
  const actions = [
    {
      label: 'Add Plant',
      icon: Plus,
      to: '/plants/new', // Assuming this route exists or similar
      variant: 'default' as const,
    },
    {
      label: 'Manage Spaces',
      icon: Building2,
      to: '/spaces',
      variant: 'outline' as const,
    },
    {
      label: 'All Plants',
      icon: Sprout,
      to: '/plants',
      variant: 'outline' as const,
    },
    {
      label: 'Tasks',
      icon: CheckSquare,
      to: '/tasks',
      variant: 'outline' as const,
    },
    {
      label: 'Notes',
      icon: StickyNote,
      to: '/notes',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {actions.map((action) => (
          <Link key={action.label} to={action.to}>
            <Button
              variant={action.variant}
              className="w-full justify-start h-auto py-3"
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
