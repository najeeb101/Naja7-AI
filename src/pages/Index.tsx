import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";
import ChatInterface from "@/components/ChatInterface";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAnonymousSession } from "@/hooks/use-anonymous-session";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content: string | null;
  analysis: string | null;
  analysis_status: "pending" | "completed" | "failed";
  analysis_error: string | null;
  created_at: string;
}

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const { isAuthReady, authError } = useAnonymousSession();
  const canUseDemo = isAuthReady && !authError;

  const handleDocumentUploaded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          {authError && (
            <Alert variant="destructive" className="mb-6">
              <ShieldAlert className="h-4 w-4" />
              <AlertTitle>Demo session unavailable</AlertTitle>
              <AlertDescription>
                Anonymous access is required for uploads. Check Supabase anonymous auth settings.
              </AlertDescription>
            </Alert>
          )}

          {!isAuthReady && (
            <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border bg-card p-4 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Preparing your private demo session...
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <DocumentUpload isSessionReady={canUseDemo} onDocumentUploaded={handleDocumentUploaded} />
              <DocumentList
                isSessionReady={canUseDemo}
                refreshTrigger={refreshTrigger}
                onDocumentSelect={setSelectedDocument}
              />
            </div>

            <div className="lg:col-span-1">
              <ChatInterface document={selectedDocument} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
