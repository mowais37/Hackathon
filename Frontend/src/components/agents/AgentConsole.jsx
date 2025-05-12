// components/agents/AgentConsole.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import { formatDate } from '../../utils/formatDate';

const AgentConsole = ({ id }) => {
  const agentContext = useContext(AgentContext);
  const { current, loading, queryAgent, queryLoading, queryError } = agentContext;
  
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Auto-focus input field
  useEffect(() => {
    if (!loading && current) {
      inputRef.current?.focus();
    }
  }, [loading, current]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim() || !current) return;
    
    // Add user message to conversation
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    
    // Simulate typing indicator
    setIsTyping(true);
    
    try {
      // Call the API to query the agent
      const response = await queryAgent(id, prompt);
      console.log('response', response)
      // Add a short delay to make the response feel more natural
      setTimeout(() => {
        // Add agent response to conversation
        const agentMessage = {
          id: Date.now() + 1,
          role: 'agent',
          content: response?.response || 'No response from agent',
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
      }, 500);
    } catch (error) {
      console.error('Error querying agent:', error);
      
      // Add error message to conversation
      const errorMessage = {
        id: Date.now() + 1,
        role: 'system',
        content: `Error: ${error.message || 'Failed to get response from agent'}`,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };
  
  // Get status class
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'inactive':
        return 'status-inactive';
      case 'error':
        return 'status-error';
      default:
        return '';
    }
  };
  
  // if (loading) {
  //   return (
  //     <div className="loading-container">
  //       <div className="loader"></div>
  //       <p>Loading agent...</p>
  //     </div>
  //   );
  // }
  
  if (!current) {
    return (
      <div className="not-found-container">
        <h2>Agent Not Found</h2>
        <p>The agent you're trying to chat with doesn't exist or has been removed.</p>
        <Link to="/agents" className="btn btn-primary">
          Back to Agents
        </Link>
      </div>
    );
  }
  
  return (
    <div className="agent-console-container">
      <div className="agent-console-header">
        <div className="agent-info">
          <Link to={`/agents/${id}`} className="back-link">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h2>{current.name}</h2>
          <div className={`agent-status ${getStatusClass(current.status || 'inactive')}`}>
            {current.status || 'Inactive'}
          </div>
        </div>
        
        <div className="agent-type">
          <span className="type-badge">{current.type}</span>
        </div>
      </div>
      
      <div className="chat-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <div className="empty-chat-content">
              <i className="fas fa-robot fa-4x"></i>
              <h3>Start a conversation with {current.name}</h3>
              <p>{current.description}</p>
              <div className="suggestions">
                <h4>Try asking:</h4>
                {current.type === 'github' && (
                  <div className="suggestion-list">
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("What are the open PRs in the repository?")}
                    >
                      What are the open PRs in the repository?
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Summarize the latest pull request")}
                    >
                      Summarize the latest pull request
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Show me open issues with 'bug' label")}
                    >
                      Show me open issues with 'bug' label
                    </button>
                  </div>
                )}
                
                {current.type === 'slack' && (
                  <div className="suggestion-list">
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Send a message to #general saying 'Hello team!'")}
                    >
                      Send a message to #general
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("What are the latest messages in the channel?")}
                    >
                      What are the latest messages?
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Create a poll in #random for lunch options")}
                    >
                      Create a poll in #random
                    </button>
                  </div>
                )}
                
                {current.type === 'jira' && (
                  <div className="suggestion-list">
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Show me all open bugs")}
                    >
                      Show me all open bugs
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Create a new task for implementing login page")}
                    >
                      Create a new task
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("What's the status of PROJECT-123?")}
                    >
                      Check ticket status
                    </button>
                  </div>
                )}
                
                {current.type === 'shopify' && (
                  <div className="suggestion-list">
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("How many products are in stock?")}
                    >
                      Check inventory
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Show me recent orders")}
                    >
                      Show recent orders
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Update price of 'Blue T-shirt' to $24.99")}
                    >
                      Update product price
                    </button>
                  </div>
                )}
                
                {(current.type === 'default' || current.type === 'custom') && (
                  <div className="suggestion-list">
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Hello! What can you do?")}
                    >
                      Hello! What can you do?
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("What tools do you have access to?")}
                    >
                      What tools do you have access to?
                    </button>
                    <button 
                      className="suggestion-btn"
                      onClick={() => setPrompt("Help me with a task")}
                    >
                      Help me with a task
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`message-item message-${message.role}`}
              >
                {message.role === 'agent' && (
                  <div className="message-avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                
                {message.role === 'system' && (
                  <div className="message-avatar system">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                )}
                
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">
                    {formatDate(message.timestamp, true)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message-item message-agent typing">
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef}></div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message..."
            disabled={!current.isActive || isTyping}
            ref={inputRef}
          />
          <button 
            type="button" 
            className="voice-input-btn"
            disabled={!current.isActive || isTyping}
          >
            <i className="fas fa-microphone"></i>
          </button>
        </div>
        <button 
          type="submit" 
          className="send-btn"
          disabled={!prompt.trim() || !current.isActive || isTyping}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
      
      {!current.isActive && (
        <div className="agent-inactive-warning">
          <i className="fas fa-exclamation-circle"></i>
          <span>This agent is currently {current.status || 'inactive'}. Activate it in the agent settings to enable chat.</span>
        </div>
      )}
    </div>
  );
};

export default AgentConsole;