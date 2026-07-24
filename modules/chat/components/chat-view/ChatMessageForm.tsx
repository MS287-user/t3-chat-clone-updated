"use client";
import { ChatMessageFormResponse } from "@/type";
import { useAIModels } from "../../hooks/use-ai-models";
import { FormEvent, useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSelector } from "./ModelSelector";
import { useCreateChat } from "../../hooks/use-chats";
import { toast } from "sonner";

export const ChatMessageForm = ({
  initialMessage,
  onMessageChange,
}: ChatMessageFormResponse) => {
  const { data: models, isPending } = useAIModels();
  const [message, setMessage] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>(
    models?.models[0]?.id ?? "",
  );

  console.log(initialMessage);

  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
      onMessageChange();
    }
  }, [initialMessage, onMessageChange]);

  const { mutateAsync, isPending: isChatPending } = useCreateChat();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();

      await mutateAsync({ content: message, model: selectedModel });
      toast.success("Message sent successfully");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-6">
      <form onSubmit={handleSubmit} className="relative">
        {/* Main Input Container */}
        <div className="relative rounded-2xl border border-border shadow-sm   transition-all">
          {/* Textarea */}
          <Textarea
            value={message}
            disabled={isChatPending}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent px-4 py-3 text-base focus-visible:ring-0 focus-visible:ring-offset-0 "
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                const form = e.currentTarget.form;
                if (form) {
                  form.requestSubmit();
                }
                // handleSubmit(
                //   e as unknown as React.SubmitEvent<HTMLFormElement>,
                // );
              }
            }}
          />

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 border-t ">
            {/* Left side tools */}
            <div className="flex items-center gap-1">
              {isPending ? (
                <>
                  <Spinner />
                </>
              ) : (
                <ModelSelector
                  models={models?.models}
                  selectedModelId={selectedModel}
                  onModelSelect={setSelectedModel}
                  className="ml-1"
                />
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!message.trim()}
              size="sm"
              variant={message.trim() ? "default" : "ghost"}
              className="h-8 w-8 p-0 rounded-full "
              aria-label="Send message"
              title={
                message.trim() ? "Send message" : "Enter a message to enable"
              }
            >
              {isChatPending ? (
                <Spinner />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send message</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
