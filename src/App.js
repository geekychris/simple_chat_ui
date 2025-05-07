import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
      // Ensure we have valid response data
      if (response.data && typeof response.data === 'object') {
        // Extract response data with fallbacks for missing fields
        const botResponse = {
          text: response.data.text || 'No response text received',
          sender: response.data.sender || 'bot',
          timestamp: response.data.timestamp || new Date().toISOString()
        };
        
        setMessages((prevMessages) => [
          ...prevMessages,
          botResponse
        ]);
      } else {
        // Handle unexpected response format
        console.error('Unexpected response format:', response);
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            text: 'Received an invalid response format from the server.',
            sender: 'bot',
            timestamp: new Date().toISOString(),
            isError: true
          }
        ]);
      }
    } catch (error) {
      // Log the error details for debugging
      console.error('Error fetching response:', error);
      
      // Create a user-friendly error message
      let errorMessage = 'Sorry, there was an error processing your request.';
      
      // Add more specific error info if available
      if (error.response) {
        // Server responded with an error status
        errorMessage += ` Server returned: ${error.response.status} ${error.response.statusText}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage += ' No response received from the server. Please check your connection.';
      } else {
        // Something else caused the error
        errorMessage += ' ' + (error.message || 'Unknown error occurred.');
      }
      
      // Add error message to chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: errorMessage,
          sender: 'bot',
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
                <div className="message-content markdown-wrapper">
                  <div className="markdown-body">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="message-info">
                  <span className="sender">{message.sender === 'user' ? 'You' : 'Bot'}</span>
                  <span className="timestamp">
                    {message.timestamp ? 
                      (() => {
                        try {
                          return new Date(message.timestamp).toLocaleTimeString();
                        } catch (e) {
                          console.warn('Invalid timestamp format:', message.timestamp);
                          return 'Unknown time';
                        }
                      })() 
                      : 'Unknown time'}
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

