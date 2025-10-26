import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";
import ChatInterface from "@/components/ChatInterface";

interface Document {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  content: string;
  analysis: string | null;
  created_at: string;
}

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleDocumentUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Upload & Documents */}
            <div className="lg:col-span-2 space-y-6">
              <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
              <DocumentList 
                refreshTrigger={refreshTrigger} 
                onDocumentSelect={setSelectedDocument}
              />
            </div>

            {/* Right Column: Chat */}
            <div className="lg:col-span-1">
              <ChatInterface documentContext={selectedDocument?.analysis || undefined} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
