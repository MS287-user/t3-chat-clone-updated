import Modal from "./delete-model/modal";
import { useDeleteChatById } from "../hooks/use-chats";
import { toast } from "sonner";
import { useChatDeleteIdUpdateContext } from "@/components/providers/ChatStatusProvider";

export const DeleteChatModel = ({
  isModalOpen,
  setIsModalOpen,
  chatId,
}: any) => {
  const { mutateAsync, isPending } = useDeleteChatById(chatId);
  const setDeletedChatId = useChatDeleteIdUpdateContext();

  const handleDelete = async () => {
    try {
      const { deletedChatId, success, error } = await mutateAsync();

      if (!deletedChatId || !success) {
        toast.error(error);
        setIsModalOpen(false);
        return;
      }

      setDeletedChatId(chatId);
      toast.success("Chat deleted successfully");

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to delete Chat:", error);
      toast.error("Failed to delete Chat");
    }
  };

  return (
    <Modal
      title="Delete Chat"
      description="Are you sure you want to delete this Chat? This action cannot be undone."
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        Once deleted, all requests and data in this Chat will be permanently
        removed.
      </p>
    </Modal>
  );
};
