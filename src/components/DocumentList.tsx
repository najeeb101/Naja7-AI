import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DocumentAnalysis from "./DocumentAnalysis";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content: string;
  analysis: string | null;
  created_at: string;
}

interface DocumentListProps {
  refreshTrigger: number;
  onDocumentSelect: (doc: Document | null) => void;
}

const DocumentList = ({ refreshTrigger, onDocumentSelect }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  const handleSelectDocument = (doc: Document) => {
    setSelectedDoc(doc);
    onDocumentSelect(doc);
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      toast.error("Failed to load documents");
    } else {
      setDocuments(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, [refreshTrigger]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      toast.error("Failed to delete document");
    } else {
      toast.success("Document deleted");
      fetchDocuments();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No documents uploaded yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {documents.map((doc) => (
          <Card 
            key={doc.id} 
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleSelectDocument(doc)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{doc.filename}</h3>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {selectedDoc && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">{selectedDoc.filename}</h3>
          <DocumentAnalysis document={selectedDoc} />
        </div>
      )}
    </div>
  );
};

export default DocumentList;
