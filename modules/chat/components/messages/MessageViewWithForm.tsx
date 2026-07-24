"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useGetChatById } from "../../hooks/use-chats";
import { useAIModels } from "../../hooks/use-ai-models";
import { Spinner } from "@/components/ui/spinner";
import { Message as MessageType } from "@/type";
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationDownload,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { ModelSelector } from "../chat-view/ModelSelector";
import { RotateCcwIcon, StopCircleIcon } from "lucide-react";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessagePart, type UIMessage } from "ai";
import { toast } from "sonner";

type ChatRole = "user" | "assistant" | "system";

type MessagePartShape = {
  type: string;
  text?: string;
  [key: string]: unknown;
};

function parseMessageToUI(msg: MessageType) {
  const basePart = { type: "text", text: msg.content };

  try {
    const parts = JSON.parse(msg.content);
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase() as ChatRole,
      parts: Array.isArray(parts) ? parts : [basePart],
      createdAt: msg.createdAt,
    };
  } catch {
    return {
      id: msg.id,
      role: msg.messageRole.toLowerCase() as ChatRole,
      parts: [basePart],
      createdAt: msg.createdAt,
    };
  }
}

function MessagePart({
  part,
  messageId,
  partIndex,
  role,
  isStreaming,
}: {
  part: MessagePartShape;
  messageId: string;
  partIndex: number;
  role: UIMessage["role"];
  isStreaming: boolean;
}) {
  const key = `${messageId}-${partIndex}`;

  if (part.type === "text") {
    return (
      <Message from={role} key={key}>
        <MessageContent>
          <MessageResponse>{part.text}</MessageResponse>
        </MessageContent>
      </Message>
    );
  }

  if (part.type === "reasoning") {
    return (
      <Reasoning
        className="max-w-2xl px-4 py-4 border border-muted rounded-md bg-muted/50"
        key={key}
        isStreaming={isStreaming}
      >
        <ReasoningTrigger />
        <ReasoningContent className="mt-2 italic font-light text-muted-foreground">
          {part.text ?? ""}
        </ReasoningContent>
      </Reasoning>
    );
  }

  if (part.type === "step-start" && partIndex > 0) {
    return (
      <div key={key} className="my-4 text-gray-500">
        <hr className="border-gray-300" />
      </div>
    );
  }

  return null;
}

export const MessageViewWithForm = ({ chatId }: { chatId: string }) => {
  const { data: chatData, isPending } = useGetChatById(chatId);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  if (!chatData?.success || !chatData?.data?.messages) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Chat not found
      </div>
    );
  }

  const rawMessages = chatData.data?.messages ?? [];

  const initialMessages: UIMessage[] = rawMessages
    .filter((m) => m.id && m.content.trim())
    .map(parseMessageToUI);

  return (
    <ChatView
      chatId={chatId}
      initialMessages={initialMessages}
      initialModel={chatData.data.model}
    />
  );
};

//
const ChatView = ({
  chatId,
  initialMessages,
  initialModel,
}: {
  chatId: string;
  initialMessages: UIMessage[];
  initialModel: string | null;
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldAutoTrigger = searchParams.get("autoTrigger") === "true";
  const hasAutoTriggered = useRef(false);

  const [selectedModel, setSelectedModel] = useState<string | null>(
    initialModel,
  );
  const [input, setInput] = useState("");
  const { data: models, isPending: isModelPending } = useAIModels();

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/chat" }),
    [],
  );

  const { messages, status, sendMessage, regenerate, stop, error } = useChat({
    id: chatId,
    messages: initialMessages,
    transport: transport,
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error(error.message);
    },
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!shouldAutoTrigger) return;
    if (hasAutoTriggered.current) return;
    if (!selectedModel) return;
    if (messages.length === 0) return;
    if (messages.at(-1)?.role !== "user") return;

    hasAutoTriggered.current = true;

    regenerate({
      body: {
        chatId,
        model: selectedModel,
        skipUserMessage: true,
      },
    }).catch((error) => {
      console.error("Auto-trigger failed:", error);
      toast.error("Failed to generate response");
    });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("autoTrigger");
    const query = params.toString();
    router.replace(`/chat/${chatId}${query ? `?${query}` : ""}`, {
      scroll: false,
    });
  }, [
    shouldAutoTrigger,
    selectedModel,
    messages,
    chatId,
    regenerate,
    router,
    searchParams,
  ]);

  const handleSubmit = async (message: PromptInputMessage) => {
    const text = message.text;

    if (!text) return;
    if (!selectedModel) {
      toast.error("Please select a model first");
    }
    if (isBusy) return;

    setInput("");

    try {
      await sendMessage(
        { text: text },
        { body: { chatId, model: selectedModel, skipUserMessage: false } },
      );
    } catch (error) {
      console.error("Send message failed:", error);
      toast.error("Failed to send message");
    }
  };

  const liveIds = useMemo(() => new Set(messages.map((m) => m.id)), [messages]);

  const allMessages = useMemo(() => {
    if (!initialMessages || initialMessages.length === 0) return messages;
    if (!messages || messages.length === 0) return initialMessages;

    const filteredInitial = initialMessages.filter((m) => !liveIds.has(m.id));

    return [...filteredInitial, ...messages].sort(
      (a: any, b: any) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
  }, [initialMessages, messages, liveIds]);

  return (
    <div className="max-w-4xl mx-auto p-6 relative size-full h-[calc(100vh-4rem)]">
      <div className="flex flex-col h-full">
        {/* Messages */}
        <Conversation className="h-full">
          <ConversationContent>
            {allMessages.length === 0 ? (
              <ConversationEmptyState
                title="Start the conversation"
                description="Send a message to get started."
              />
            ) : (
              allMessages.map((message) => (
                <Fragment key={message.id}>
                  {message.parts.map((part, i) => (
                    <MessagePart
                      key={`${message.id}-${i}`}
                      part={part}
                      messageId={message.id}
                      partIndex={i}
                      role={message.role}
                      isStreaming={
                        isBusy &&
                        message === messages.at(-1) &&
                        i === message.parts.length - 1
                      }
                    />
                  ))}
                </Fragment>
              ))
            )}

            {status === "submitted" && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner />
                <span className="text-sm">AI is thinking...</span>
              </div>
            )}

            {error && (
              <div className="text-sm text-destructive">
                {error.message || "Something went wrong."}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Input */}
        <PromptInput onSubmit={handleSubmit} className="mt-4">
          <PromptInputBody>
            <PromptInputTextarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={false}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputTools className="flex items-center gap-2 w-full">
              <div className="flex-1">
                {isModelPending ? (
                  <Spinner />
                ) : (
                  <ModelSelector
                    models={models?.models}
                    selectedModelId={selectedModel}
                    onModelSelect={setSelectedModel}
                    className=""
                  />
                )}
              </div>

              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};
