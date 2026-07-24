"use server";

import prisma from "@/lib/db";
import { MessageRole, MessageType } from "@/lib/generated/prisma/enums";
import { currentUser } from "@/modules/authentication/actions";
import { CreateChatWithMessageResponse } from "@/type";
import { revalidatePath, updateTag } from "next/cache";

export const createChatWithMessage = async ({
  content,
  model,
}: {
  content: string;
  model: string;
}): Promise<CreateChatWithMessageResponse> => {
  try {
    const { success: isLoggedIn, data: user } = await currentUser();

    if (!isLoggedIn || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");

    const chat = await prisma.chat.create({
      data: {
        title: title,
        model: model,
        userId: user?.id,
        messages: {
          create: {
            content: content,
            model: model,
            messageRole: MessageRole.USER,
            messageType: MessageType.NORMAL,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return {
        success: false,
        error: "Something went wrong, chat not created",
      };
    }

    revalidatePath("/", "page");

    return {
      success: true,
      data: chat,
    };
  } catch (error) {
    console.error("Error creating chat:", error);
    return { success: false, error: "Failed to create chat" };
  }
};

export const getAllChats = async () => {
  try {
    const { success: isLoggedIn, data: user } = await currentUser();

    if (!isLoggedIn || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const chats = await prisma.chat.findMany({
      where: {
        userId: user.id,
      },
      include: {
        messages: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!chats) {
      return {
        success: false,
        error: "Something went wrong unable to get chats",
      };
    }

    return {
      success: true,
      data: chats,
    };
  } catch (error) {
    console.error("Error fetching chats:", error);
    return { success: false, error: "Failed to fetch chats" };
  }
};

export const getChatById = async (chatId: string) => {
  try {
    const { success: isLoggedIn, data: user } = await currentUser();

    if (!isLoggedIn || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
        userId: user.id,
      },
      include: {
        messages: true,
      },
    });

    if (!chat) {
      return {
        success: false,
        error: "Something went wrong unable to get chat",
      };
    }

    return {
      success: true,
      data: chat,
    };
  } catch (error) {
    console.error("Error fetching chat:", error);
    return { success: false, error: "Failed to fetch chat" };
  }
};

export const deleteChatById = async (chatId: string) => {
  try {
    const { success: isLoggedIn, data: user } = await currentUser();

    if (!isLoggedIn || !user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const deleteChat = await prisma.chat.delete({
      where: {
        id: chatId,
        userId: user.id,
      },
    });

    if (!deleteChat) {
      return {
        success: false,
        error: "Something went wrong unable to delete chat",
      };
    }

    updateTag(chatId ?? "chats");

    return {
      success: true,
      deletedChatId: deleteChat.id,
    };
  } catch (error) {
    console.error("Error deleting chat:", error);
    return { success: false, error: "Failed to delete chat" };
  }
};
