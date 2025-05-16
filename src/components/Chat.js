import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { sendMessage, getConversation } from '../services/apiService';
import { FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import './Chat.css';

const Chat = () => {
  const { selectedConversation, setSelectedConversation } = useOutletContext();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Load conversation messages when conversation changes with cleanup
  useEffect(() => {
    let isSubscribed = true;

    const loadConversationMessages = async (conversationId) => {
      try {
        setLoading(true);
        setError(null);
        const conversation = await getConversation(conversationId);
        console.log('Conversation data:', conversation);
        if (isSubscribed && conversation) {
          setSelectedConversation(prevState => {
            console.log('Previous state:', prevState); // Added console log
            console.log('New messages:', conversation.messages); // Added console log
            return {
              ...prevState,
              messages: conversation.messages || []
            };
          });
        }
      } catch (error) {
        if (isSubscribed) {
          console.error('Failed to load conversation messages:', error);
          setError('Failed to load conversation messages. Please try again.');
        }
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    if (selectedConversation?.id) {
      loadConversationMessages(selectedConversation.id);
    }

    // Cleanup function
    return () => {
      isSubscribed = false;
    };
  }, [selectedConversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'inherit';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    console.log('selectedConversation updated:', selectedConversation);
  }, [selectedConversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = React.useCallback(async (e) => {
    e.preventDefault();
    
    if (!input.trim() || !selectedConversation) return;
    
    // Save input to local variable and clear input field immediately for better UX
    const currentInput = input;
    setInput('');
    
    try {
      setLoading(true);
      setError(null);
      
      // Optimistically add user message to UI
      const userMessage = {
        message: currentInput,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      
      // Add user message to conversation
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), userMessage]
      }));
      
      // Send to backend
      console.log('Sending message to backend:', currentInput);
      const response = await sendMessage(currentInput, selectedConversation.id);
      console.log('Received response from backend:', {
        response,
        type: typeof response,
        structure: JSON.stringify(response, null, 2)
      });
      
      // Add bot response - ensure it has the correct structure
      if (response) {
        // Ensure response has the required structure
        const botMessage = {
          message: response.message || response.text || 'No response received',
          sender: 'bot',
          timestamp: response.timestamp || new Date().toISOString()
        };
        
        console.log('Formatted bot message:', botMessage);
        
        // Update conversation with the bot response
        setSelectedConversation(prev => ({
          ...prev,
          messages: [...(prev.messages || []), botMessage]
        }));
      }
      
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
      
      // Show error to user
      setSelectedConversation(prev => ({
        ...prev,
        messages: [...(prev.messages || []), {
          message: 'Sorry, there was an error sending your message. Please try again.',
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isError: true
        }]
      }));
    } finally {
      setLoading(false);
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current.focus();
        }, 0);
      }
    }
  }, [input, selectedConversation, setSelectedConversation]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setNewTitle(selectedConversation.title);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (newTitle.trim() && newTitle !== selectedConversation.title) {
        // Update the title
        setSelectedConversation(prev => ({
            ...prev,
            title: newTitle.trim()
        }));
      // Here you would typically call an API to save the updated title
      // For example: updateConversationTitle(selectedConversation.id, newTitle.trim());
    } else {
        // Revert to old title if new title is empty or same as old title
        setNewTitle(selectedConversation.title);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleBlur();
    }
  };

  if (!selectedConversation) {
    return (
      <div className="chat-placeholder">
        <div className="placeholder-content">
          <h2>Select a conversation or create a new one</h2>
          <p>Choose an existing conversation from the sidebar or start a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        {isEditingTitle ? (
          <input
            type="text"
            value={newTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="title-input"
            autoFocus
          />
        ) : (
          <h2 onClick={handleTitleClick} className="title-text">
            {selectedConversation.title}
          </h2>
        )}
      </div>
      
      <div className="messages-container" ref={chatContainerRef}>
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        
        {!selectedConversation.messages || selectedConversation.messages.length === 0 ? (
          <div className="empty-chat">
            <p>Start a new conversation...</p>
          </div>
        ) : (
          selectedConversation.messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'} ${message.isError ? 'error-message' : ''}`}
            >
              <div className="message-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom link handling for security
                    a: ({node, ...props}) => (
                      <a 
                        {...props} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      />
                    ),
                    // Ensure code blocks are properly styled
                    code: ({node, inline, ...props}) => (
                      <code 
                        {...props} 
                        className={inline ? 'inline-code' : 'code-block'}
                      />
                    )
                  }}
                >
                  {message.message}
                </ReactMarkdown>
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
      
      <form className="input-container" onSubmit={handleSendMessage}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Markdown supported)"
          disabled={loading}
          rows={1}
          className="message-textarea"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          className="send-button"
        >
          <FiSend />
        </button>
      </form>
    </div>
  );
};

Chat.propTypes = {
  // These come from useOutletContext
  selectedConversation: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    messages: PropTypes.arrayOf(PropTypes.shape({
      message: PropTypes.string.isRequired,
      sender: PropTypes.oneOf(['user', 'bot']).isRequired,
      timestamp: PropTypes.string.isRequired,
      isError: PropTypes.bool
    }))
  }),
  setSelectedConversation: PropTypes.func
};

export default Chat;

