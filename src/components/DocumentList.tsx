import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
}

const DocumentList = ({ refreshTrigger }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

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
    <>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">{doc.filename}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatFileSize(doc.file_size)} • {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                  {doc.analysis ? (
                    <div className="mt-3 p-3 bg-secondary/50 rounded-md">
                      <p className="text-sm font-medium mb-1">Analysis:</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {doc.analysis}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <p className="text-sm text-muted-foreground">Analyzing...</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedDoc(doc)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(doc.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedDoc?.filename}</DialogTitle>
            <DialogDescription>
              {selectedDoc && formatFileSize(selectedDoc.file_size)} • 
              {selectedDoc && new Date(selectedDoc.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedDoc?.analysis && (
              <div>
                <h4 className="font-semibold mb-2">AI Analysis</h4>
                <div className="p-4 bg-secondary/50 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedDoc.analysis}</p>
                </div>
              </div>
            )}
            <div>
              <h4 className="font-semibold mb-2">Document Content</h4>
              <div className="p-4 bg-muted/50 rounded-md">
                <p className="text-sm whitespace-pre-wrap font-mono">
                  {selectedDoc?.content.substring(0, 2000)}
                  {selectedDoc && selectedDoc.content.length > 2000 && '...'}
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DocumentList;
