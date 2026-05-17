import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, BarChart3, FileArchive, FileCode, FileText, Loader2, Scale } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DocumentAnalysisProps {
  document: {
    filename: string;
    content: string | null;
    analysis: string | null;
    analysis_status: "pending" | "completed" | "failed";
    analysis_error: string | null;
    file_size: number;
  };
}

const DocumentAnalysis = ({ document }: DocumentAnalysisProps) => {
  const content = document.content ?? "";
  const words = content.split(/\s+/).filter((word) => word.length > 0).length;
  const characters = content.length;
  const approxPages = Math.max(1, Math.ceil(words / 450));
  const fileSize =
    document.file_size < 1024 * 1024
      ? `${(document.file_size / 1024).toFixed(1)} KB`
      : `${(document.file_size / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="space-y-4">
      <Alert>
        <Scale className="h-4 w-4" />
        <AlertTitle>Portfolio demo disclaimer</AlertTitle>
        <AlertDescription>
          This analysis helps scan contract text, but it is not legal advice.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="analysis" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4">
          <Card className="p-6 bg-primary/5 border-primary/20">
            {document.analysis_status === "pending" ? (
              <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analysis is being generated...
              </div>
            ) : document.analysis_status === "failed" ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Analysis failed</AlertTitle>
                <AlertDescription>
                  {document.analysis_error || "The AI service could not analyze this document."}
                </AlertDescription>
              </Alert>
            ) : document.analysis ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{document.analysis}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No analysis has been saved for this document yet.
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-5 text-center bg-primary text-primary-foreground shadow-sm">
              <div className="text-4xl font-bold mb-2">{approxPages}</div>
              <div className="text-sm opacity-90">Estimated pages</div>
            </Card>
            <Card className="p-5 text-center bg-foreground text-background shadow-sm">
              <div className="text-4xl font-bold mb-2">{words.toLocaleString()}</div>
              <div className="text-sm opacity-90">Words</div>
            </Card>
            <Card className="p-5 text-center bg-accent text-accent-foreground shadow-sm">
              <div className="text-4xl font-bold mb-2">{characters.toLocaleString()}</div>
              <div className="text-sm opacity-90">Characters</div>
            </Card>
            <Card className="p-5 text-center bg-card shadow-sm">
              <FileArchive className="mx-auto mb-2 h-7 w-7 text-primary" />
              <div className="text-3xl font-bold mb-2">{fileSize}</div>
              <div className="text-sm text-muted-foreground">File size</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <Textarea value={content} readOnly className="min-h-[300px] font-mono text-sm resize-none" />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentAnalysis;
