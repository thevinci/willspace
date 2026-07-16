import { useState, type FormEvent } from "react";
import { Bot, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSetRightSidebar } from "@/context/right-sidebar-context";

type ChatMessage = {
  author: "assistant" | "user";
  text: string;
};

export function ChatSideContent() {
  const { setRightSidebarContent } = useSetRightSidebar();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      author: "assistant",
      text: "Hi, I'm the willspace assistant. What can I help you explore?",
    },
  ]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      { author: "user", text: trimmedMessage },
      {
        author: "assistant",
        text: "Chat is ready for a connected assistant. Your message has been saved in this conversation.",
      },
    ]);
    setMessage("");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between gap-3 border-b p-5">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bot className="h-4 w-4" />
            willspace assistant
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask about people, places, and spaces in your network.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close assistant chat"
          onClick={() => setRightSidebarContent(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((chatMessage, index) => (
          <div
            key={`${chatMessage.author}-${index}`}
            className={
              chatMessage.author === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground"
                : "max-w-[85%] rounded-lg bg-muted px-3 py-2 text-sm"
            }
          >
            {chatMessage.text}
          </div>
        ))}
      </div>
      <form className="border-t p-5" onSubmit={sendMessage}>
        <div className="flex items-end gap-2">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Message the assistant"
            aria-label="Message the assistant"
            rows={1}
            className="min-h-10 py-2"
          />
          <Button
            type="submit"
            size="icon"
            aria-label="Send message"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
