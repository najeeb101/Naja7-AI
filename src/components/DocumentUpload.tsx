import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { extractDocumentText, supportedDocumentLabel, validateDocumentFile } from "@/lib/documentText";

interface DocumentUploadProps {
  isSessionReady: boolean;
  onDocumentUploaded: () => void;
}

const DocumentUpload = ({ isSessionReady, onDocumentUploaded }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (!isSessionReady) {
      toast.error("Demo session is still loading. Please try again in a moment.");
      return;
    }

    const file = files[0];

    try {
      validateDocumentFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unsupported file.";
      setUploadError(message);
      toast.error(message);
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const content = await extractDocumentText(file);

      const { data: document, error: insertError } = await supabase
        .from("documents")
        .insert({
          filename: file.name,
          file_type: file.type || file.name.split(".").pop()?.toLowerCase() || "unknown",
          file_size: file.size,
          content,
          analysis_status: "pending",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Document uploaded. Analysis started.");

      const { error: analysisError } = await supabase.functions.invoke("analyze-document", {
        body: {
          documentId: document.id,
          content,
          filename: file.name,
        },
      });

      if (analysisError) {
        console.error("Analysis error:", analysisError);
        toast.error("Document uploaded, but analysis failed.");
      } else {
        toast.success("Document analyzed successfully!");
      }

      onDocumentUploaded();
    } catch (error) {
      console.error("Error uploading document:", error);
      const message = error instanceof Error ? error.message : "Failed to upload document.";
      setUploadError(message);
      toast.error(message);
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
        isDragging ? "border-primary bg-secondary/50" : "border-border"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-muted-foreground">Extracting text and analyzing document...</p>
          </>
        ) : (
          <>
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Upload Your Contract</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: {supportedDocumentLabel} contracts (Max 5MB)
              </p>
            </div>
            {uploadError && (
              <Alert variant="destructive" className="max-w-xl text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            <Button asChild disabled={!isSessionReady}>
              <label className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                {isSessionReady ? "Select File" : "Preparing session"}
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  accept=".txt,.pdf,.docx"
                  disabled={!isSessionReady}
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
