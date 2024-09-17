import { create } from 'zustand';

export enum MessageRole {
    SYSTEM = "system",
    USER = "user",
    ASSISTANT = "assistant",
    AI = "ai",
    FUNCTION = "function",
    TOOL = "tool",
    CHATBOT = "chatbot",
    ERROR = "error",
}

export type ChatMessage = {
    role: MessageRole;
    content?: string;
};

interface MessagesState {
    messages: ChatMessage[];
    setMessages: (messages: ChatMessage[]) => void;
    appendmessage: (message: ChatMessage) => void;
    prependMessage: (message: ChatMessage) => void;
    appendContentToLastMessage: (content: string) => void;
}

const useMessagesStore = create<MessagesState>((set) => ({
    messages: [],
    setMessages: (_messages) => set(() => ({ messages: _messages })),
    appendmessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    prependMessage: (message) => set((state) => ({ messages: [message, ...state.messages] })),
    appendContentToLastMessage: (content) => set((state) => {
        const lastMessage = state.messages[state.messages.length - 1];
        if (!lastMessage) return state;
        lastMessage.content = `${lastMessage.content || ''}${content}`;
        return { messages: [...state.messages] };
    })
}));

export default useMessagesStore;