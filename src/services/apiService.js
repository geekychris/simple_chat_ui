import axios from './axiosConfig';

// Chat service functions
export const sendMessage = async (message, conversationId = null, fileInfo = null) => {
  try {
    const requestData = {
      message,
      conversationId,
      fileInfo
    };
    const response = await axios.post('/chat/message', {message, conversationId, fileInfo});
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Conversation service functions
export const getConversations = async () => {
  try {
    const response = await axios.get('/chat/conversations');
    return response.data;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

export const getConversation = async (id) => {
  try {
    const response = await axios.get(`/chat/conversations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching conversation ${id}:`, error);
    throw error;
  }
};

export const createConversation = async (title = 'New Conversation') => {
  try {
    const response = await axios.post('/chat/conversations', { title });
    return response.data;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

export const deleteConversation = async (id) => {
  try {
    await axios.delete(`/chat/conversations/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting conversation ${id}:`, error);
    throw error;
  }
};

export const updateConversation = async (id, title) => {
  try {
    const response = await axios.put(`/chat/conversations/${id}`, { title });
    return response.data;
  } catch (error) {
    console.error(`Error updating conversation ${id}:`, error);
    throw error;
  }
};

// File service functions
export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

