import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Calendar, MapPin, Leaf, Image as ImageIcon } from 'lucide-react';
import type { Note } from '../../lib/types/note';
import { formatDistanceToNow, format } from 'date-fns';

interface NoteCardProps {
  note: Note;
  spaceName?: string;
  plantName?: string;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  showActions?: boolean;
}

export function NoteCard({ 
  note, 
  spaceName, 
  plantName, 
  onEdit, 
  onDelete,
  showActions = true 
}: NoteCardProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'observation': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'feeding': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pruning': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'issue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'milestone': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageDialog(true);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(note.id);
    }
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getCategoryColor(note.category)}>
                  {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
                </Badge>
                
                {spaceName && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{spaceName}</span>
                  </div>
                )}
                
                {plantName && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Leaf className="w-3 h-3" />
                    <span>{plantName}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{format(note.timestamp, 'MMM d, yyyy h:mm a')}</span>
                <span>•</span>
                <span>{formatDistanceToNow(note.timestamp, { addSuffix: true })}</span>
              </div>
            </div>
            
            {showActions && (onEdit || onDelete) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="More actions">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Note Content */}
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-wrap">{note.content}</p>
          </div>
          
          {/* Photos */}
          {note.photos.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="w-4 h-4" />
                <span>Photos ({note.photos.length})</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {note.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(photo)}
                    className="aspect-square rounded-lg overflow-hidden bg-muted border hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={photo}
                      alt={`Note photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Photo</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              src={selectedImage}
              alt="Note photo"
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
              {note.photos.length > 0 && (
                <span className="block mt-2 font-medium">
                  This will also delete {note.photos.length} associated photo(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}