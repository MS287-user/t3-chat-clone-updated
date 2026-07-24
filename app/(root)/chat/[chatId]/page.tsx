import { MessageViewWithForm } from "@/modules/chat/components/messages/MessageViewWithForm";
import React from "react";

const SingleChatPage = async ({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) => {
  const { chatId } = await params;
  return (
    <>
      <MessageViewWithForm chatId={chatId} />
    </>
  );
};

export default SingleChatPage;
