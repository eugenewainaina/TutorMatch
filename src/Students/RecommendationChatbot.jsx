import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StructuredMessage from '../components/StructuredMessage';
import { SERVER_URL } from '../config';
import '../components/StructuredMessage.css';
import './RecommendationChatbot.css';

const ChatMessage = ({ message, isUser }) => {
    return (
        <div className={`message-container ${isUser ? 'user-message-container' : 'bot-message-container'}`}>
            <div className={isUser ? 'user-message' : 'bot-message'}>
                {isUser ? <p>{message}</p> : <StructuredMessage message={message} />}
            </div>
        </div>
    );
};

const TypingIndicator = () => {
    return (
        <div className="bot-message-container">
            <div className="bot-message typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    );
};

const ChatInput = React.forwardRef(({ onSend, isLoading }, inputRef) => {
    const [userMessage, setUserMessage] = useState('');

    useEffect(() => {
        inputRef.current?.focus();
    }, [inputRef]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (userMessage.trim() && !isLoading) {
            onSend(userMessage);
            setUserMessage('');
        }
    };

    return (
        <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Ask for recommendations..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                disabled={isLoading}
                required
            />
            <button
                type="submit"
                className={`send-button ${isLoading ? 'disabled' : ''}`}
                disabled={isLoading || !userMessage.trim()}
            >
                {isLoading ? 'Sending...' : 'Send'}
            </button>
        </form>
    );
});

const ChatbotContainer = () => {
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your Tutor recommendation assistant. What are you looking to learn today?", isUser: false }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const chatContainerRef = useRef(null);
    const chatInputRef = useRef(null);

    // Generate sessionId once per component mount
    const sessionIdRef = useRef(uuidv4());

    // Function to send message to backend API
    const sendMessageToBackend = async (message) => {
        try {
            setIsLoading(true);
            const payload = JSON.stringify({
                chatInput: message,
                action: 'sendMessage',
                sessionId: sessionIdRef.current
            })

            const response = await fetch(`${SERVER_URL}/chatbot`, { //${SERVER_URL}/df0a5ecd-dfa1-401d-8766-859c44ce2c1d/chat
                method: 'POST',
                //mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: payload,
            });

            console.log("output: ", payload);

            if (!response.ok) {
                const err = await response.json();

                throw new Error(err.error);
            }

            const data = await response.json();

            console.log('Response from server:', data);

            // Check if the output is already a JSON object or a JSON string
            if (typeof data.output === 'object') {
                return data.output;
            } else {
                // Try to parse it as JSON, but return as is if it's not valid JSON
                try {
                    return JSON.parse(data.output);
                } catch (e) {
                    return data.output;
                }
            }
        } catch (err) {
            setError('Sorry, there was an error connecting to the recommendation service.');

            console.error(err);

            return "I'm having trouble connecting to my recommendation database. Could you try again later?";
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendMessage = async (message) => {
        // Add user message to chat
        setMessages((prevMessages) => [...prevMessages, { text: message, isUser: true }]);

        try {
            // Send to backend and get response
            const botResponse = await sendMessageToBackend(message);

            // Add bot response to chat
            setMessages((prevMessages) => [...prevMessages, { text: botResponse, isUser: false }]);
            // Focus the input after bot replies
            setTimeout(() => {
                chatInputRef.current?.focus();
            }, 0);
        } catch (err) {
            // If there's an error, add error message
            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    text: "Sorry, I couldn't process your request. Please try again.",
                    isUser: false
                }
            ]);
            setTimeout(() => {
                chatInputRef.current?.focus();
            }, 0);
        }
    };

    useEffect(() => {
        // Scroll to the bottom of the chat container whenever messages change
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }


        // createChat({
        //     webhookUrl: `${SERVER_URL}/chatbot`,
        //     initialMessages: [
        //         'Hi there! 👋'
        //     ],
        //     target: '#n8n-chat',
        //     mode: 'fullscreen', // or 'fullscreen'
        // });
    }, [messages]);

    return (
        <div className="chatbot-container">
            <div className="chatbot-header">
                <h2>Recommendation Assistant</h2>
            </div>

            {/* <div id="n8n-chat"></div> */}

            <div ref={chatContainerRef} className="chat-messages">
                {messages.map((msg, index) => (
                    <ChatMessage key={index} message={msg.text} isUser={msg.isUser} />
                ))}
                {isLoading && <TypingIndicator />}
                {error && <div className="error-message">{error}</div>}
            </div>



            <ChatInput ref={chatInputRef} onSend={handleSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default ChatbotContainer;