import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BarChart3, FileCode } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface DocumentAnalysisProps {
  document: {
    filename: string;
    content: string;
    analysis: string | null;
    file_size: number;
  };
}

const DocumentAnalysis = ({ document }: DocumentAnalysisProps) => {
  // Calculate stats
  const words = document.content.split(/\s+/).filter(word => word.length > 0).length;
  const characters = document.content.length;
  const approxPages = Math.max(1, Math.floor(document.content.split('\n').length / 40) + 1);

  return (
    <div className="space-y-4">
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
            {document.analysis ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {document.analysis}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Analysis is being generated...
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6 text-center bg-gradient-to-br from-purple-500 to-purple-700 text-white shadow-lg">
              <div className="text-4xl font-bold mb-2">{approxPages}</div>
              <div className="text-sm opacity-90">📄 Pages</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-pink-500 to-red-500 text-white shadow-lg">
              <div className="text-4xl font-bold mb-2">{words.toLocaleString()}</div>
              <div className="text-sm opacity-90">📝 Words</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg">
              <div className="text-4xl font-bold mb-2">{characters.toLocaleString()}</div>
              <div className="text-sm opacity-90">🔤 Characters</div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <Card className="p-6 bg-primary/5 border-primary/20">
            <Textarea
              value={document.content}
              readOnly
              className="min-h-[300px] font-mono text-sm resize-none"
            />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentAnalysis;
