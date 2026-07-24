import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChatWithMessage,
  deleteChatById,
  getAllChats,
  getChatById,
} from "../actions";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CreateChatWithMessageResponse } from "@/type";

export const useGetAllChats = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => await getAllChats(),
  });
};

export const useGetChatById = (chatId: string) => {
  return useQuery({
    queryKey: ["chats", chatId],
    queryFn: async () => await getChatById(chatId),
  });
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createChatWithMessage,
    onSuccess: (res: CreateChatWithMessageResponse) => {
      if (res.success && res.data) {
        queryClient.invalidateQueries({ queryKey: ["chats"] });
        router.push(`/chat/${res.data.id}?autoTrigger=true`);
      }
    },
    onError: (error: Error) => {
      console.error("Create chat error:", error);
      toast.error("Failed to create chat");
    },
  });
};

export const useDeleteChatById = (chatId: string) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return useMutation({
    mutationFn: async () => await deleteChatById(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats", chatId] });
      if (pathname === `/chat/${chatId}`) {
        router.push("/");
      }
    },
    onError: (error: Error) => {
      console.error("Delete chat error:", error);
      toast.error("Failed to delete chat");
    },
  });
};
