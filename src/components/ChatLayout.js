import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ConversationList from './ConversationList';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import './ChatLayout.css';

const ChatLayout = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // If not authenticated, redirect to login
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const handleLogout = () => {
    logout();
  };
  
  return (
    <div className="chat-layout">
      {/* Toggle sidebar button (mobile only) */}
      <button 
        className="toggle-sidebar-button"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        {isSidebarOpen ? <FiX /> : <FiMenu />}
      </button>
      
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="user-info">
            <div className="user-avatar">
              {currentUser?.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-name">{currentUser?.username}</div>
          </div>
          <button 
            className="logout-button"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <FiLogOut />
          </button>
        </div>
        
        <ConversationList 
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>
      
      {/* Main content area with conversation */}
      <div className="main-content">
        {/* Render the nested route (Chat component) */}
        <Outlet context={{ 
          selectedConversation,
          setSelectedConversation
        }} />
      </div>
    </div>
  );
};

export default ChatLayout;

