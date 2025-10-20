import { Text, View } from "@/components/Themed";
import { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { chatService } from "@/services/chatService";
import { Message } from "@/types/chat";

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamResponse, setStreamResponse] = useState("");
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, streamResponse]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const userMessage: Message = {
        text: message,
        source: "user",
        timestamp: Date.now(),
      };

      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage("");
      await streamChatResponse(userMessage);
    }
  };

  const streamChatResponse = async (message: Message) => {
    setStreamResponse("");
    let fullResponse = "";

    const eventSource = chatService.streamMessage(message.text);
    setIsStreaming(true);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "done") {
        setIsStreaming(false);
        eventSource.close();
        debugger;
        const systemMessage: Message = {
          text: fullResponse,
          source: "system",
          timestamp: Date.now(),
        };

        setMessages((prevMessages) => [...prevMessages, systemMessage]);
        setStreamResponse("");
        return;
      }

      fullResponse += data.reply;
      setStreamResponse(fullResponse);
    };
    eventSource.onerror = (error) => {
      console.error("Streaming error:", error);
      eventSource.close();
      setIsStreaming(false);
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.chatWrapper}>
        <Text style={styles.title}>ChatT</Text>

        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.messageBox,
                msg.source === "user"
                  ? styles.userMessage
                  : styles.systemMessage,
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}

          {isStreaming && streamResponse && (
            <View style={[styles.messageBox, styles.systemMessage]}>
              <Text style={styles.messageText}>{streamResponse}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSendMessage}
            editable={!isStreaming}
            multiline={true}
            autoFocus={true}
            returnKeyType="send"
            placeholder="Digite sua mensagem..."
            placeholderTextColor="gray"
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={isStreaming}
          >
            <Text style={styles.sendButtonText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatWrapper: {
    flex: 1,
    alignSelf: "center",
    width: "50%",
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  messagesContainer: {
    flex: 1,
    width: "100%",
  },
  messagesList: {
    paddingBottom: 10,
  },
  messageBox: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    maxWidth: "80%",
  },
  userMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  systemMessage: {
    backgroundColor: "#f5f5f5",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
