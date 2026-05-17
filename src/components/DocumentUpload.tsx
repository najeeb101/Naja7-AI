import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, FileText, Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  extractDocumentText,
  maxDocumentFileSizeLabel,
  supportedDocumentLabel,
  validateDocumentFile,
} from "@/lib/documentText";

interface DocumentUploadProps {
  isSessionReady: boolean;
  onDocumentUploaded: () => void;
}

const DocumentUpload = ({ isSessionReady, onDocumentUploaded }: DocumentUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (isUploading || !isSessionReady) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading || !isSessionReady) return;
    handleFileUpload(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    e.target.value = "";
  };

  const isDisabled = !isSessionReady || isUploading;

  return (
    <Card
      className={`p-8 border-2 border-dashed transition-all ${
        isDragging && !isDisabled ? "border-primary bg-secondary/60 shadow-md" : "border-border bg-card"
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
                Drop a readable contract file here, or choose one from your device.
              </p>
              <p className="text-xs text-muted-foreground">
                Supports {supportedDocumentLabel}. Maximum size: {maxDocumentFileSizeLabel}.
              </p>
            </div>
            {uploadError && (
              <Alert variant="destructive" className="max-w-xl text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
            <Button type="button" disabled={isDisabled} onClick={() => fileInputRef.current?.click()}>
              <FileText className="mr-2 h-4 w-4" />
              {isSessionReady ? "Select Contract" : "Preparing session"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleInputChange}
              accept=".txt,.pdf,.docx"
              disabled={isDisabled}
            />
          </>
        )}
      </div>
    </Card>
  );
};

export default DocumentUpload;
