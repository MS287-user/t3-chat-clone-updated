import { currentUser } from "@/modules/authentication/actions";
import { ChatMessageView } from "@/modules/chat/components/chat-view/ChatMessageView";

export default async function Home() {
  const { success: isLoggedIn, data: user } = await currentUser();

  if (!isLoggedIn || !user) {
    return null;
  }
  return (
    <>
      <ChatMessageView user={user} />
    </>
  );
}
