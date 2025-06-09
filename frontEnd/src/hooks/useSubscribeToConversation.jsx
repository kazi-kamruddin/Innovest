import { useEffect } from "react";
import echo from "../config/echo";

function useSubscribeToConversation(conversationId, onNewMessage) {
  useEffect(() => {
    if (!conversationId) return;

    const channel = echo.private(`conversation.${conversationId}`);

    channel.listen("NewMessageEvent", (e) => {
      onNewMessage(e);
    });

    return () => {
      echo.leave(`conversation.${conversationId}`);
    };
  }, [conversationId, onNewMessage]);
}

export default useSubscribeToConversation;
