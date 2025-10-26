import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DocumentUploadProps {
  onDocumentUploaded: () => void;
}

const DocumentUpload = ({ onDocumentUploaded }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Check file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx|csv|json)$/i)) {
      toast.error("Unsupported file type. Please upload TXT, PDF, DOC, DOCX, CSV, or JSON files.");
      return;
    }

    setIsUploading(true);

    try {
      // Read file content
      const content = await file.text();

      // Save document to database
      const { data: document, error: insertError } = await supabase
        .from('documents')
        .insert({
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          content: content
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Document uploaded successfully!");

      // Trigger analysis
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'analyze-document',
        {
          body: {
            documentId: document.id,
            content: content,
            filename: file.name
          }
        }
      );

      if (analysisError) {
        console.error('Analysis error:', analysisError);
        toast.error("Document uploaded but analysis failed");
      } else {
        toast.success("Document analyzed successfully!");
      }

      onDocumentUploaded();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-all ${
        isDragging ? 'border-primary bg-secondary/50' : 'border-border'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Uploading and analyzing document...</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Document</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: TXT, PDF, DOC, DOCX, CSV, JSON (Max 5MB)
              </p>
            </div>
            <Button asChild>
              <label className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Select File
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept=".txt,.pdf,.doc,.docx,.csv,.json"
                />
              </label>
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default DocumentUpload;
