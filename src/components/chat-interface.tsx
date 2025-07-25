"use client";

import { multimodalChat } from "@/ai/flows/multimodal-chat";
import type { MultimodalChatOutput } from "@/ai/schemas/multimodal-chat";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { BrainCircuit, Copy, Loader2, Paperclip, PlusCircle, Send, Share2, Trash2, User, X } from "lucide-react";
import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string;
};

const CHAT_HISTORY_KEY = "lokesh_chatbot_history";

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        setMessages(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load chat history.",
      });
    }
  }, [toast]);

  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
      } else {
        localStorage.removeItem(CHAT_HISTORY_KEY);
      }
    } catch (error) {
        console.error("Failed to save chat history:", error);
    }
  }, [messages]);


  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const handleNewChat = () => {
    setMessages([]);
    setFile(null);
    setFilePreview(null);
    toast({
        title: "New chat started",
        description: "Your conversation history has been cleared.",
      });
  };
  
  const handleClearHistory = () => {
    setMessages([]);
    setFile(null);
    setFilePreview(null);
    toast({
        title: "Chat history cleared",
        description: "Your conversation history has been permanently deleted.",
      });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(selectedFile);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please select an image file.',
            });
        }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !file) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      ...(filePreview && { image: filePreview }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setFile(null);
    setFilePreview(null);
    setIsLoading(true);

    try {
      const response = await multimodalChat({ 
        query: input,
        ...(filePreview && { photoDataUri: filePreview }),
      });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem communicating with the AI. Please try again.",
      });
      // Restore user input on error
      setMessages(messages.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied to clipboard!",
        description: "The response has been copied.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy the text to clipboard.",
      });
    }
  };

  const handleShare = async (content: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'lokesh chatbot Response',
          text: content,
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          variant: "destructive",
          title: "Sharing failed",
          description: "There was an error trying to share the message.",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Sharing not supported",
        description: "Your browser does not support the Web Share API.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b shrink-0">
        <h1 className="text-xl md:text-2xl font-headline font-bold text-primary">
          lokesh chatbot
        </h1>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleNewChat}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Chat
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={messages.length === 0 && !file}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {messages.length === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                    <BrainCircuit className="mx-auto h-12 w-12 mb-4" />
                    <h2 className="text-2xl font-semibold font-headline">Welcome!</h2>
                    <p>Start a conversation by typing a message below.</p>
                </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex items-start gap-3 animate-message-in", message.role === "user" && "justify-end")}
              >
                {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8 shrink-0 border-2 border-primary/50">
                        <AvatarFallback className="bg-primary/20">
                            <BrainCircuit className="h-5 w-5 text-primary"/>
                        </AvatarFallback>
                    </Avatar>
                )}
                <div className={cn("flex flex-col gap-2 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl", message.role === 'user' && 'items-end')}>
                    <Card className={cn(
                        "rounded-2xl",
                        message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card rounded-bl-none'
                    )}>
                        <CardContent className="p-3 text-sm md:text-base">
                            {message.image && (
                                <Image
                                    src={message.image}
                                    width={300}
                                    height={200}
                                    alt="User upload"
                                    className="rounded-lg mb-2"
                                />
                            )}
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        </CardContent>
                    </Card>
                    {message.role === 'assistant' && (
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleCopy(message.content)}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy message</span>
                            </Button>
                             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleShare(message.content)}>
                                <Share2 className="h-4 w-4" />
                                <span className="sr-only">Share message</span>
                            </Button>
                        </div>
                    )}
                </div>
                {message.role === 'user' && (
                    <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-accent text-accent-foreground">
                            <User className="h-5 w-5"/>
                        </AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-message-in">
                <Avatar className="h-8 w-8 shrink-0 border-2 border-primary/50">
                    <AvatarFallback className="bg-primary/20">
                        <BrainCircuit className="h-5 w-5 text-primary"/>
                    </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2 pt-1">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </main>
      <footer className="p-4 border-t shrink-0 bg-background/80 backdrop-blur-sm">
        {filePreview && (
            <div className="relative mb-2 w-fit">
                <Image
                    src={filePreview}
                    alt="File preview"
                    width={80}
                    height={80}
                    className="rounded-lg"
                />
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-muted text-muted-foreground"
                    onClick={() => {
                        setFile(null);
                        setFilePreview(null);
                        if(fileInputRef.current) fileInputRef.current.value = "";
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            disabled={isLoading}
            className="flex-1"
            aria-label="Chat input"
          />
          <Button type="submit" disabled={isLoading || (!input.trim() && !file)} size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </footer>
    </div>
  );
}
