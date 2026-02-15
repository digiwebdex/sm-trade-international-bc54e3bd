import { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export interface FileItem {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
  url?: string;
}

interface BulkUploadZoneProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  accept?: string;
  maxFiles?: number;
  disabled?: boolean;
}

const BulkUploadZone = ({ files, onFilesChange, accept = 'image/*', maxFiles = 50, disabled }: BulkUploadZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).slice(0, maxFiles - files.length);
    const items: FileItem[] = arr.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));
    onFilesChange([...files, ...items]);
  }, [files, maxFiles, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length) addFiles(droppedFiles);
  }, [addFiles, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }, [disabled]);

  const removeFile = (index: number) => {
    const updated = [...files];
    URL.revokeObjectURL(updated[index].preview);
    updated.splice(index, 1);
    onFilesChange(updated);
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const progress = files.length > 0 ? Math.round((doneCount / files.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-accent/30',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
          disabled={disabled}
        />
        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-sm font-medium">Drag & drop images here</p>
        <p className="text-xs text-muted-foreground mt-1">or click to browse · up to {maxFiles} files</p>
      </div>

      {/* Progress bar */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{doneCount} of {files.length} uploaded</span>
            {errorCount > 0 && <span className="text-destructive">{errorCount} failed</span>}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[300px] overflow-y-auto">
          {files.map((item, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              {/* Status overlay */}
              <div className={cn(
                'absolute inset-0 flex items-center justify-center',
                item.status === 'uploading' && 'bg-black/40',
                item.status === 'done' && 'bg-green-600/20',
                item.status === 'error' && 'bg-destructive/30',
              )}>
                {item.status === 'uploading' && <Loader2 className="h-5 w-5 text-white animate-spin" />}
                {item.status === 'done' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {item.status === 'error' && <AlertCircle className="h-5 w-5 text-destructive" />}
              </div>
              {/* Remove button */}
              {item.status === 'pending' && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BulkUploadZone;
