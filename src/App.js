import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';
import { FiPaperclip, FiX, FiDownload, FiFile, FiFileText, FiImage, FiVideo, FiMusic } from 'react-icons/fi';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
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

  // File handling functions
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleSelectedFile(selectedFile);
  };

  const handleSelectedFile = (selectedFile) => {
    if (!selectedFile) return;
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File size exceeds 10MB limit');
      return;
    }
    
    // Set the file state
    setFile(selectedFile);
    
    // Create preview for image files
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
  };

  const clearFileSelection = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  // Function to get file icon based on file type
  const getFileIcon = (fileType) => {
    switch(fileType) {
      case 'image':
        return <FiImage size={24} />;
      case 'video':
        return <FiVideo size={24} />;
      case 'audio':
        return <FiMusic size={24} />;
      case 'document':
        return <FiFileText size={24} />;
      default:
        return <FiFile size={24} />;
    }
  };

  // Function to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    
    // Don't send if there's no input and no file
    if (!input.trim() && !file) return;
    
    const userMessage = { 
      text: input.trim(), 
      sender: 'user', 
      timestamp: new Date().toISOString(),
      fileInfo: file ? {
        originalFileName: file.name,
        size: file.size,
        contentType: file.type,
        fileType: getFileType(file.type)
      } : null
    };
    
    // Add user message to chat
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    
    // Clear input and file
    setInput('');
    setLoading(true);
    
    try {
      let response;
      
      // If there's a file, upload it first
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Upload the file
        const fileResponse = await axios.post(
          '/api/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted);
            }
          }
        );
        
        // Clear the file after upload
        clearFileSelection();
        setUploadProgress(0);
        
        // Make API call with both message and file info
        // Make API call with both message and file info
        response = await axios.post('/api/chat/message', {
          message: input.trim(),
          fileInfo: fileResponse.data
        });
      } else {
        // Make API call with just the message
        response = await axios.post('/api/chat/message', {
          message: input.trim()
        });
      }
      
      // Add response to chat
      if (response.data && typeof response.data === 'object') {
        // Extract response data with fallbacks for missing fields
        const botResponse = {
          text: response.data.text || 'No response text received',
          sender: response.data.sender || 'bot',
          timestamp: response.data.timestamp || new Date().toISOString(),
          fileInfo: response.data.fileInfo || null
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
  
  // Determine file type based on MIME type
  const getFileType = (mimeType) => {
    if (!mimeType) return 'other';
    
    if (mimeType.startsWith('image/')) {
      return 'image';
    } else if (mimeType.startsWith('video/')) {
      return 'video';
    } else if (mimeType.startsWith('audio/')) {
      return 'audio';
    } else if (mimeType.startsWith('application/pdf') 
            || mimeType.startsWith('application/msword')
            || mimeType.startsWith('application/vnd.openxmlformats-officedocument')
            || mimeType.startsWith('text/')) {
      return 'document';
    } else {
      return 'other';
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
        <div className="app-header">
          <img src="/logo192.png" alt="Chat App" className="app-logo" />
          <h1>Chat Application</h1>
        </div>
        <div 
          className={`chat-container ${dragActive ? 'drag-active' : ''}`}
          ref={chatContainerRef}
          onScroll={handleScroll}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
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
                  {message.text && (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {message.fileInfo && (
                    <div className="file-attachment">
                      <div className="file-preview">
                        {message.fileInfo.fileType === 'image' ? (
                          <img 
                            src={message.fileInfo.url.startsWith('/') ? message.fileInfo.url : `/${message.fileInfo.url}`} 
                            className="image-preview"
                            alt="Uploaded file"
                          />
                        ) : (
                          <div className="file-icon">
                            {getFileIcon(message.fileInfo.fileType)}
                          </div>
                        )}
                      </div>
                      <div className="file-info">
                        <div className="file-name">{message.fileInfo.originalFileName}</div>
                        <div className="file-size">{formatFileSize(message.fileInfo.size)}</div>
                      </div>
                      <a 
                        href={message.fileInfo.url.startsWith('/') ? message.fileInfo.url : `/${message.fileInfo.url}`}
                        rel="noopener noreferrer"
                        className="file-download"
                        download
                      >
                        <FiDownload size={18} />
                      </a>
                    </div>
                  )}
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
        
        {/* File upload preview */}
        {file && (
          <div className="file-upload-preview">
            <div className="file-preview-header">
              <span className="file-name">{file.name}</span>
              <button 
                type="button" 
                className="remove-file-btn"
                onClick={clearFileSelection}
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="file-preview-content">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="image-preview" />
              ) : (
                <div className="file-icon">
                  {getFileIcon(getFileType(file.type))}
                </div>
              )}
              <div className="file-info">
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="upload-progress">
                <div 
                  className="upload-progress-bar" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span className="upload-progress-text">{uploadProgress}%</span>
              </div>
            )}
          </div>
        )}
        
        <form className="input-container" onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={file ? "Add a message or send just the file..." : "Type your message here..."}
            disabled={loading}
            autoFocus={true}
            ref={inputRef}
          />
          
          {/* File input with custom button */}
          <label className="file-input-label" htmlFor="file-input">
            <FiPaperclip size={20} />
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
              disabled={loading}
            />
          </label>
          
          <button type="submit" disabled={loading || (!input.trim() && !file)}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
