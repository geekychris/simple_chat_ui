import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts and after each message
  useEffect(() => {
    // Focus on input element
    inputRef.current?.focus();
    
    // Add event listener to focus input when window regains focus
    const handleWindowFocus = () => {
      inputRef.current?.focus();
    };
    
    window.addEventListener('focus', handleWindowFocus);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [messages, loading]);
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user', timestamp: new Date().toISOString() };
    
    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Clear input
    setInput('');
    setLoading(true);
    
    try {
      // Make API call
      const response = await axios.post(`http://localhost:8080/ai/chatjson`, {
        message: userMessage.text
      });
      
      // Add response to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: response.data.text,
          sender: response.data.sender,
          timestamp: response.data.timestamp
        }
      ]);
    } catch (error) {
      console.error('Error fetching response:', error);
      
      // Add error message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Sowry, there was an error processing your request.',
          sender: error,
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
      // Refocus the input field after response is received
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };
  // Implement infinite scroll functionality
  const handleScroll = () => {
    // This is a placeholder for loading previous messages when scrolling up
    // In a real application, you would implement pagination or load more messages
    // when the user scrolls to the top of the container
    if (chatContainerRef.current) {
      const { scrollTop } = chatContainerRef.current;
      if (scrollTop === 0) {
        // Load older messages here if needed
        console.log('Reached top of chat, could load older messages');
      }
    }
  };

  return (
    <div className="app-container">
      <div className="chat-app">
        <h1>Chat Application</h1>
        
        <div 
          className="chat-container" 
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>Enter a question to start chatting!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={index} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
              >
                <div className="message-content">
                  <p>{message.text}</p>
                </div>
                <div className="message-info">
                  <span className="sender">{message.sender === 'user' ? 'You' : 'Bot'}</span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="message bot-message loading-message">
              <div className="message-content">
                <p>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                  <span className="loading-dot">.</span>
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <form className="input-container" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            disabled={loading}
            autoFocus={true}
            ref={inputRef}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;

