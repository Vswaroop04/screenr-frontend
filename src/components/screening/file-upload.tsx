"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
  isUploading?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  accept = ".pdf,.doc,.docx",
  multiple = true,
  maxFiles = 50,
  maxSizeMB = 10,
  isUploading = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] => {
      setError(null);
      const validFiles: File[] = [];

      for (const file of files) {
        // Check file type
        const ext = "." + file.name.split(".").pop()?.toLowerCase();
        const acceptedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
        if (!acceptedTypes.some((t) => ext === t || file.type.includes(t.replace(".", "")))) {
          setError(`Invalid file type: ${file.name}`);
          continue;
        }

        // Check file size
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File too large: ${file.name} (max ${maxSizeMB}MB)`);
          continue;
        }

        validFiles.push(file);
      }

      // Check max files
      if (validFiles.length > maxFiles) {
        setError(`Too many files. Maximum ${maxFiles} allowed.`);
        return validFiles.slice(0, maxFiles);
      }

      return validFiles;
    },
    [accept, maxFiles, maxSizeMB]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      const fileArray = Array.from(files);
      const validFiles = validateFiles(fileArray);
      setSelectedFiles(validFiles);
    },
    [validateFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFilesSelected(selectedFiles);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isUploading}
        />
        <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
        <p className="mb-1 text-sm font-medium">
          Drag and drop your resume{multiple ? "s" : ""} here
        </p>
        <p className="text-xs text-muted-foreground">
          or click to browse (PDF, DOC, DOCX - max {maxSizeMB}MB)
        </p>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
          </p>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
