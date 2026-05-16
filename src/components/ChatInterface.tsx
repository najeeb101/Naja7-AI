import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Loader2, MessageCircle, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  document: {
    id: string;
    filename: string;
    analysis_status: "pending" | "completed" | "failed";
  } | null;
}

const ChatInterface = ({ document }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [document?.id]);

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!document) {
      toast.error("Select a document before asking questions.");
      return;
    }

    if (document.analysis_status !== "completed") {
      toast.error("Wait for analysis to finish before chatting with this document.");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    const { data, error } = await supabase.functions.invoke("chat-document", {
      body: {
        documentId: document.id,
        question: userMessage,
      },
    });

    if (error) {
      console.error("Chat error:", error);
      toast.error("Could not answer that question.");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't answer that question right now. Please try again in a moment.",
        },
      ]);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data?.answer || "I could not find a clear answer in this document.",
        },
      ]);
    }

    setIsLoading(false);
  };

  const canChat = Boolean(document && document.analysis_status === "completed");

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <div className="min-w-0">
          <h3 className="font-semibold">Chat with AI</h3>
          {document && <p className="truncate text-xs text-muted-foreground">{document.filename}</p>}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              {document ? (
                <>
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    {document.analysis_status === "completed"
                      ? "Ask questions about this contract."
                      : "Analysis must finish before chat is available."}
                  </p>
                </>
              ) : (
                <>
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select an analyzed document to ask questions.</p>
                </>
              )}
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={canChat ? "Ask questions about the document..." : "Select an analyzed document first"}
            className="flex-1"
            disabled={!canChat || isLoading}
          />
          <Button onClick={handleSend} size="icon" disabled={!input.trim() || !canChat || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
