"use client";

import React, { useContext, useState } from "react";

const ChatDeleteIdContext = React.createContext<string>("");
const ChatDeleteIdUpdateContext = React.createContext<(chatId: string) => void>(
  () => {},
);

export function useChatDeleteIdContext() {
  return useContext(ChatDeleteIdContext);
}
export function useChatDeleteIdUpdateContext() {
  return useContext(ChatDeleteIdUpdateContext);
}

export const ChatStatusProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [deletedChatId, setDeletedChatId] = useState<string>("");

  const deletedChatIdUpdate = (chatId: string) => {
    setDeletedChatId(chatId);
  };

  return (
    <>
      <ChatDeleteIdContext.Provider value={deletedChatId}>
        <ChatDeleteIdUpdateContext.Provider value={deletedChatIdUpdate}>
          {children}
        </ChatDeleteIdUpdateContext.Provider>
      </ChatDeleteIdContext.Provider>
    </>
  );
};
