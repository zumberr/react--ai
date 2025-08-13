import { useRef, useEffect, useMemo } from "react";
import Markdown from "react-markdown";
import styles from "./Chat.module.css";

const WELCOME_MESSAGE_GROUP = [
  {
    role: "assistant",
    content: "Hola , como puedo ayudarte el dia de hoy?",
  },
];

export function Chat({ messages }) {
  const messagesEndRef = useRef(null);
const messagesGroups = useMemo(
() => {
    if (!messages || messages.length === 0) {
    return [];
    }
    
    return messages.reduce((groups, message) => {
    if (groups.length === 0) {
        groups.push([]);
    }
    // Start a new group for user messages
    if (message.role === "user") {
        groups.push([]);
    }
    groups[groups.length - 1].push(message);
    return groups;
    }, []);
},
[messages]
);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "user") {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className={styles.Chat}>
      {[WELCOME_MESSAGE_GROUP, ...messagesGroups].map(
        (messages, groupIndex) => (
          
          <div key={groupIndex} className={styles.Group}>
            {messages.map(({ role, content }, index) => (
              <div key={index} className={styles.Message} data-role={role}>
                <Markdown>{content}</Markdown>
              </div>
            ))}
          </div>
        )
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
