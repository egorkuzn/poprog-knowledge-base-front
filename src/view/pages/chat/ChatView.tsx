import {useEffect, useMemo, useRef, useState} from "react";
import type {FormEvent} from "react";
import type {KeyboardEvent} from "react";
import BodyView from "../BodyView";
import "../../../styles/pages/Chat.scss";
import {assistantChat, getAssistantChatHistory} from "../../../api/knowledgeBaseApi";
import type {AiAssistantChatRole, ChatHistoryMessageResponse} from "../../../api/types";
import arrowRightAltIcon from "../../../assets/home/icons/arrow-right-alt.svg";
import arrowTopIcon from "../../../assets/home/icons/arrow-top.svg";

interface ChatMessage {
    id: string
    role: "assistant" | "user" | "system"
    text: string
    createdAt: string
}

const chatStorageKey = "assistant_chat_id";
const maxTextareaLines = 10;

function formatMessageTime(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
    }

    return parsedDate.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}

function mapHistoryMessage(message: ChatHistoryMessageResponse): ChatMessage {
    return {
        id: `history-${message.id}`,
        role: message.role,
        text: message.content,
        createdAt: formatMessageTime(message.createdAt)
    };
}

export function ChatView() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);
    const [chatError, setChatError] = useState("");
    const [showScrollDown, setShowScrollDown] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const isNearBottomRef = useRef(true);

    const updateScrollState = () => {
        const container = scrollContainerRef.current;
        if (!container) {
            return;
        }

        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        isNearBottomRef.current = distanceToBottom < 56;
        setShowScrollDown(distanceToBottom > 120);
    };

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        const container = scrollContainerRef.current;
        if (!container) {
            return;
        }

        container.scrollTo({top: container.scrollHeight, behavior});
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (!textarea) {
            return;
        }

        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight || "22");
        const paddingTop = parseFloat(computedStyle.paddingTop || "0");
        const paddingBottom = parseFloat(computedStyle.paddingBottom || "0");
        const borderTop = parseFloat(computedStyle.borderTopWidth || "0");
        const borderBottom = parseFloat(computedStyle.borderBottomWidth || "0");
        const maxHeight = (lineHeight * maxTextareaLines) + paddingTop + paddingBottom + borderTop + borderBottom;

        textarea.style.height = "auto";
        const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${nextHeight}px`;
        textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    };

    useEffect(() => {
        adjustTextareaHeight();
    }, [draft]);

    useEffect(() => {
        updateScrollState();
    }, [isLoadingHistory]);

    useEffect(() => {
        if (isNearBottomRef.current) {
            scrollToBottom("auto");
            return;
        }

        updateScrollState();
    }, [messages]);

    useEffect(() => {
        let isMounted = true;
        const storedChatId = localStorage.getItem(chatStorageKey);

        setChatId(storedChatId);

        if (!storedChatId) {
            setIsLoadingHistory(false);
            return () => {
                isMounted = false;
            };
        }

        getAssistantChatHistory(storedChatId)
            .then((history) => {
                if (!isMounted) {
                    return;
                }

                setMessages(history.messages.map(mapHistoryMessage));
                setIsLoadingHistory(false);
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                localStorage.removeItem(chatStorageKey);
                setChatId(null);
                setMessages([]);
                setChatError("Не удалось загрузить историю диалога. Можно продолжить с нового чата.");
                setIsLoadingHistory(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const canSend = draft.trim().length > 0 && !isSending;

    const chatContent = useMemo(() => {
        if (isLoadingHistory) {
            return <p className="chat-status">Загружаем историю диалога...</p>;
        }

        if (chatError.length > 0) {
            return <p className="chat-status chat-status-error">{chatError}</p>;
        }

        if (messages.length === 0) {
            return <p className="chat-status">История пока пустая. Напишите первое сообщение.</p>;
        }

        return (
            <div className="chat-messages">
                {messages.map((message) => (
                    <article className={`chat-message chat-message-${message.role}`} key={message.id}>
                        <p>{message.text}</p>
                        <span>{message.createdAt}</span>
                    </article>
                ))}
            </div>
        );
    }, [chatError, isLoadingHistory, messages]);

    const sendCurrentMessage = async () => {
        const text = draft.trim();
        if (text.length === 0 || isSending) {
            return;
        }

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            text,
            createdAt: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
        };

        setMessages((current) => [...current, userMessage]);
        setChatError("");
        setDraft("");
        if (textareaRef.current) {
            textareaRef.current.style.height = "";
            textareaRef.current.style.overflowY = "hidden";
        }
        setIsSending(true);

        try {
            const response = await assistantChat({
                chatId,
                messages: [
                    {
                        role: "user" as AiAssistantChatRole,
                        content: text
                    }
                ]
            });

            localStorage.setItem(chatStorageKey, response.chatId);
            setChatId(response.chatId);

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                text: response.content,
                createdAt: new Date().toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"})
            };

            setMessages((current) => [...current, assistantMessage]);
        } catch (error) {
            setChatError(error instanceof Error ? `Ошибка отправки: ${error.message}` : "Ошибка отправки сообщения.");
        } finally {
            setIsSending(false);
        }
    };

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await sendCurrentMessage();
    };

    const onInputKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await sendCurrentMessage();
        }
    };

    return BodyView(
        <main className="chat-page">
            <section className="chat-shell">
                <header className="chat-header">
                    <h1>Чат с ИИ агентом</h1>
                    <p>Чат подключен к API. История диалога сохраняется между сессиями по `chatId`.</p>
                </header>

                <div className="chat-scroll-area" onScroll={updateScrollState} ref={scrollContainerRef}>
                    {chatContent}
                </div>

                {showScrollDown && (
                    <button aria-label="Прокрутить вниз" className="chat-scroll-down" onClick={() => scrollToBottom()} type="button">
                        <img alt="" aria-hidden="true" src={arrowTopIcon}/>
                    </button>
                )}

                <form className="chat-form" onSubmit={onSubmit}>
                    <div className="chat-input-shell">
                        <textarea
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={onInputKeyDown}
                            placeholder="Введите сообщение..."
                            rows={1}
                            ref={textareaRef}
                            value={draft}
                        />
                        <button aria-label="Отправить сообщение" className="chat-send-button" disabled={!canSend} type="submit">
                            <img alt="" aria-hidden="true" src={arrowRightAltIcon}/>
                        </button>
                    </div>
                </form>
            </section>
        </main>
    );
}
