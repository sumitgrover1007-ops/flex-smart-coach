import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Send, 
  MessageSquare, 
  Sparkles, 
  Target,
  Apple,
  Dumbbell,
  ClipboardCheck
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const CHAT_URL = "https://ackkovwsssatfksugfiy.supabase.co/functions/v1/fitness-chat";

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hi! I'm your AI fitness coach. I can help with daily check-ins, meal reviews, calorie estimates when there are enough details, workout planning, form corrections, and recovery guidance. What would you like to track today?",
      role: "assistant",
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { text: "Help me with today's check-in", icon: ClipboardCheck, category: "check-in" },
    { text: "Create a workout plan for me", icon: Dumbbell, category: "workout" },
    { text: "Give me nutrition advice", icon: Apple, category: "nutrition" },
    { text: "How do I do a proper squat?", icon: Target, category: "form" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessages: Message[]) => {
    const apiMessages = userMessages.map(m => ({
      role: m.role,
      content: m.content
    }));

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFja2tvdndzc3NhdGZrc3VnZml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTA3NjgsImV4cCI6MjA3MjkyNjc2OH0.ZfOphDOlEmbFlcZCG5QBpqGPMz8hKK1mHXvL-ZaDJq0`,
      },
      body: JSON.stringify({ messages: apiMessages }),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a moment.");
      }
      if (resp.status === 402) {
        throw new Error("Usage limit reached. Please add credits to continue.");
      }
      throw new Error("Failed to get response from AI");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last.id.startsWith("stream-")) {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return [...prev, {
                id: `stream-${Date.now()}`,
                content: assistantContent,
                role: "assistant",
                timestamp: new Date()
              }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && last.id.startsWith("stream-")) {
                return prev.map((m, i) => 
                  i === prev.length - 1 ? { ...m, content: assistantContent } : m
                );
              }
              return prev;
            });
          }
        } catch { /* ignore */ }
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      role: "user",
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setNewMessage("");
    setIsStreaming(true);

    try {
      await streamChat(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to get response");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setNewMessage(question);
  };

  return (
    <section className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-foreground">AI Fitness Coach</h1>
              <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                <span className="w-2 h-2 bg-success rounded-full mr-1 animate-pulse"></span>
                Online
              </Badge>
            </div>
          </div>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Get personalized workout plans, nutrition advice, form corrections, and more from your AI-powered fitness coach.
          </p>
        </div>

        {/* Chat Card */}
        <Card className="bg-gradient-card border-0 shadow-soft">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {/* Messages */}
            <div className="space-y-4 mb-6 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-2 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex justify-start">
                  <div className="bg-muted text-foreground rounded-2xl p-4 max-w-[80%]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="mb-4 pb-4 border-b border-border/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Quick Questions</h4>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, index) => {
                  const Icon = question.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2 h-auto py-2"
                      onClick={() => handleQuickQuestion(question.text)}
                      disabled={isStreaming}
                    >
                      <Icon className="w-3 h-3 text-primary" />
                      <span className="text-xs">{question.text}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Ask me anything about fitness..."
                className="flex-1"
                disabled={isStreaming}
              />
              <Button 
                onClick={handleSendMessage}
                variant="default"
                size="icon"
                disabled={!newMessage.trim() || isStreaming}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AIChat;
