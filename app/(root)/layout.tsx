import { Header } from "@/components/Header";
import { ChatStatusProvider } from "@/components/providers/ChatStatusProvider";
import { requireAuth } from "@/modules/authentication/actions";
import { getAllChats } from "@/modules/chat/actions";
import { ChatSidebar } from "@/modules/chat/components/ChatSidebar";
import React from "react";

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await requireAuth();
  const { data: chats } = await getAllChats();

  if (!session.user || !chats) {
    return null;
  }
  return (
    <>
      <div className="flex h-screen overflow-hidden">
        <ChatStatusProvider>
          <ChatSidebar user={session.user} chats={chats} />
        </ChatStatusProvider>
        <main className="flex-1 overflow-hidden">
          <Header />
          {children}
        </main>
      </div>
    </>
  );
};

export default RootLayout;
