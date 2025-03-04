import { useState, useEffect } from "react";
import { Assistant } from "./assistants/zpiapi";
import { Loader } from "./components/Loader/Loader";
import { Chat } from "./components/Chat/Chat";
import { Controls } from "./components/Controls/Controls";
import { ModelSelector } from "./components/ModelSelector/ModelSelector";
import styles from "./App.module.css";

function App() {
  const [assistant] = useState(new Assistant());
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState("");
  const [isLoadingModels, setIsLoadingModels] = useState(true);

  useEffect(() => {
    async function loadModels() {
      setIsLoadingModels(true);
      try {
        const availableModels = await assistant.getAvailableModels();
        setModels(availableModels);
        setCurrentModel(assistant.getModel());
      } catch (error) {
        console.error("Failed to load models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    }

    loadModels();
  }, [assistant]);

  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: `${message.content}${content}` }
          : message
      )
    );
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  function handleModelChange(modelId) {
    assistant.setModel(modelId);
    setCurrentModel(modelId);
    
    // Add system message about model change
    addMessage({
      content: `Model changed to ${modelId}`,
      role: "system",
    });
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);
    try {
      const result = await assistant.chatStream(content, messages);
      let isFirstChunk = false;

      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true);
        }

        updateLastMessageContent(chunk);
      }

      setIsStreaming(false);
    } catch (error) {
      console.error("Chat error:", error);
      addMessage({
        content: "Sorry, I couldn't process your request. Please try again!",
        role: "system",
      });
      setIsLoading(false);
      setIsStreaming(false);
    }
  }

  return (
    <div className={styles.App}>
      {(isLoading || isLoadingModels) && <Loader />}
      <header className={styles.Header}>
        <img className={styles.Logo} src="/chat-bot.png" alt="AI Chatbot Logo" />
        <h2 className={styles.Title}>AI Chatbot</h2>
        <ModelSelector 
          models={models} 
          currentModel={currentModel} 
          onChange={handleModelChange}
          isDisabled={isLoading || isStreaming}
        />
      </header>
      <div className={styles.ChatContainer}>
        <Chat messages={messages} />
      </div>
      <Controls
        isDisabled={isLoading || isStreaming}
        onSend={handleContentSend}
      />
    </div>
  );
}

export default App;