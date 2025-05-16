import React, { useState, useEffect, useRef } from 'react';
import { FiPlus, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { getConversations, createConversation, deleteConversation, updateConversation } from '../services/apiService';
import './ConversationList.css';

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingConversationId, setEditingConversationId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const inputRef = useRef(null);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await getConversations();
      setConversations(data);

      // Select the first conversation if none is selected
      if (data.length > 0 && (selectedConversationId === null || selectedConversationId === undefined)) {
        onSelectConversation(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConversation = await createConversation('New Conversation');
      setConversations(prev => [newConversation, ...prev]);
      onSelectConversation(newConversation);
    } catch (error) {
      console.error('Failed to create conversation:', error);
      setError('Failed to create new conversation');
    }
  };

  const handleDeleteConversation = async (event, id) => {
    event.stopPropagation(); // Prevent triggering conversation selection

    try {
      await deleteConversation(id);

      // Remove the deleted conversation from state
      const updatedConversations = conversations.filter(
        conversation => conversation.id !== id
      );

      setConversations(updatedConversations);

      // If the deleted conversation was selected, select another one
      if (id === selectedConversationId) {
        if (updatedConversations.length > 0) {
          onSelectConversation(updatedConversations[0]);
        } else {
          onSelectConversation(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      setError('Failed to delete conversation');
    }
  };

  const handleTitleClick = (event, conversationId) => {
    event.stopPropagation();
    setEditingConversationId(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setNewTitle(conversation.title);
    }
  };

  const handleTitleChange = (event) => {
    setNewTitle(event.target.value);
  };

  const handleTitleBlur = async (conversationId) => {
    setEditingConversationId(null);

    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    if (newTitle.trim() && newTitle.trim() !== conversation.title) {
      // Update the title in the local state
      setConversations(prev =>
        prev.map(c =>
          c.id === conversationId ? { ...c, title: newTitle.trim() } : c
        )
      );

       try {
        // Call API to update conversation title on the backend
        const response = await updateConversation(conversationId, newTitle.trim());
        console.log('updateConversation response:', response);
         console.log(`Updated conversation title for id ${conversationId} to ${newTitle.trim()}`);
      } catch (error) {
        console.error('Failed to update conversation title:', error);
        setError('Failed to update conversation title');
      }
    }
    setNewTitle('');
  };

  const handleTitleKeyDown = (event, conversationId) => {
    if (event.key === 'Enter') {
      event.target.blur();
    }
  };

  return (
    <div className="conversation-list">
      <div className="conversation-list-header">
        <h2>Conversations</h2>
        <button
          className="new-conversation-button"
          onClick={handleCreateConversation}
          aria-label="New conversation"
        >
          <FiPlus />
        </button>
      </div>

      {error && <div className="conversation-error">{error}</div>}

      {isLoading ? (
        <div className="conversation-loading">Loading conversations...</div>
      ) : conversations.length > 0 ? (
        <ul className="conversations">
          {conversations.map((conversation) => (
            <li
              key={conversation.id}
              className={`conversation-item ${selectedConversationId === conversation.id ? 'selected' : ''}`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="conversation-icon">
                <FiMessageSquare />
              </div>
              {editingConversationId === conversation.id ? (
                <input
                  type="text"
                  className="conversation-title-input"
                  value={newTitle || conversation.title || ''}
                  onChange={handleTitleChange}
                  onBlur={() => handleTitleBlur(conversation.id)}
                  onKeyDown={e => handleTitleKeyDown(e, conversation.id)}
                  autoFocus
                  ref={inputRef}
                />
              ) : (
                <div
                  className="conversation-title"
                  onClick={e => handleTitleClick(e, conversation.id)}
                >
                  {conversation.title}
                </div>
              )}
              <button
                className="delete-conversation-button"
                onClick={(e) => handleDeleteConversation(e, conversation.id)}
                aria-label="Delete conversation"
              >
                <FiTrash2 />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="no-conversations">
          <p>No conversations yet</p>
          <button
            className="create-first-conversation-button"
            onClick={handleCreateConversation}
          >
            Start a new conversation
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
