import { useState } from "react";
import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentList from "@/components/DocumentList";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDocumentUploaded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">Document Analysis</h2>
            <p className="text-muted-foreground">
              Upload your documents and let AI analyze them for you
            </p>
          </div>
          
          <div className="space-y-8">
            <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />
            <div>
              <h3 className="text-2xl font-semibold mb-4">Your Documents</h3>
              <DocumentList refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
