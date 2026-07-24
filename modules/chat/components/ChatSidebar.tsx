"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { UserButton } from "@/modules/authentication/components/UserButton";
import { PlusIcon, SearchIcon, EllipsisIcon, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useMemo } from "react";
import { isToday, isYesterday, isWithinInterval, subDays } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Chat, ChatSidebarResponse } from "@/type";
import { usePathname } from "next/navigation";
import { DeleteChatModel } from "./DeleteChatModel";
import { useChatDeleteIdContext } from "@/components/providers/ChatStatusProvider";

type ChatGroupKey = "today" | "yesterday" | "lastWeek" | "older";

function groupChatsByDate(chats: Chat[]) {
  const groups: Record<ChatGroupKey, Chat[]> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    older: [],
  };
  const now = new Date();

  // if (!chats || !Array.isArray(chats)) return groups;

  chats.forEach((chat) => {
    const date = new Date(chat.createdAt);

    if (isToday(date)) {
      groups.today.push(chat);
    } else if (isYesterday(date)) {
      groups.yesterday.push(chat);
    } else if (isWithinInterval(date, { start: subDays(now, 7), end: now })) {
      groups.lastWeek.push(chat);
    } else {
      groups.older.push(chat);
    }
  });

  return groups;
}

const DATE_GROUPS: Array<{ key: ChatGroupKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "lastWeek", label: "Last 7 Days" },
  { key: "older", label: "Older" },
];

function ChatItem({
  chat,
  isActive,
  isChatDeleted,
  onDelete,
}: {
  chat: Chat;
  isActive: any;
  isChatDeleted: boolean;
  onDelete: any;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Link
      href={`/chat/${chat.id}`}
      aria-disabled={isChatDeleted}
      tabIndex={isChatDeleted ? -1 : undefined}
      className={cn(
        "flex items-center justify-between rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors",
        isActive && "bg-sidebar-accent",
        isChatDeleted && "cursor-not-allowed pointer-events-none opacity-50",
      )}
    >
      <span className="truncate flex-1">{chat.title}</span>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-disabled={isChatDeleted}
            tabIndex={isChatDeleted ? -1 : undefined}
            variant="ghost"
            size="icon"
            disabled={isChatDeleted}
            className={cn(
              "h-6 w-6 cursor-pointer shrink-0 hover:bg-sidebar-accent-foreground/10",
              isChatDeleted && "cursor-not-allowed pointer-events-none",
            )}
            onClick={(e) => e.preventDefault()}
          >
            <EllipsisIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className={cn("text-red-500 cursor-pointer")}
            onClick={(e) => {
              setOpen(false);
              onDelete(e, chat.id);
            }}
            disabled={isChatDeleted}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  );
}

function ChatGroup({
  label,
  chats,
  activeChatId,
  onDelete,
}: {
  label: any;
  chats: Chat[];
  activeChatId: any;
  onDelete: any;
}) {
  if (chats.length === 0) return null;
  const deletedChatId = useChatDeleteIdContext();

  return (
    <div className="mb-4">
      <div className="mb-2 px-2 text-xs font-semibold text-muted-foreground">
        {label}
      </div>
      {chats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={chat.id === activeChatId}
          isChatDeleted={chat.id === deletedChatId}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export const ChatSidebar = ({ user, chats }: ChatSidebarResponse) => {
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const activeChatId = pathname?.startsWith("/chat/")
    ? pathname.split("/")[2]
    : null;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const filteredChats = useMemo(() => {
    if (!searchQuery) return chats;
    const query = searchQuery.toLowerCase();

    return chats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(query) ||
        chat.messages.some((message) =>
          message.content.toLowerCase().includes(query),
        ),
    );
  }, [searchQuery, chats]);

  const groupedChats = useMemo(() => {
    const result = groupChatsByDate(filteredChats);
    return result;
  }, [filteredChats]);

  const handleDelete = (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedChatId(chatId);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
        {/* Header */}
        <div className="flex items-center border-b border-sidebar-border px-4 py-3">
          <Image src="/logo.svg" alt="Logo" width={100} height={100} />
        </div>

        <div className="p-4">
          <Button asChild className="w-full">
            <Link href="/">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Chat
            </Link>
          </Button>
        </div>

        <div className="px-4 pb-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search your threads..."
              className="pl-9 pr-8 bg-sidebar-accent border-sidebar-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {filteredChats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              {searchQuery ? "No chats found" : "No chats yet"}
            </div>
          ) : (
            DATE_GROUPS.map((group) => (
              <ChatGroup
                key={group.key}
                label={group.label}
                activeChatId={activeChatId}
                chats={groupedChats[group.key]}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center gap-3 border-t bg-sidebar-border">
          <UserButton user={user} />
          <span className="flex-1 text-sm text-sidebar-foreground truncate">
            {user.email}
          </span>
        </div>

        <DeleteChatModel
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          chatId={selectedChatId}
        />
      </div>
    </>
  );
};
