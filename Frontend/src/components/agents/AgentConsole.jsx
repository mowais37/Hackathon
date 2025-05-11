// components/agents/AgentConsole.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import AgentContext from '../../context/agent/agentContext';
import { formatDate } from '../../utils/formatDate';

const AgentConsole = () => {
  const { id } = useParams();
  
  const agentContext = useContext(AgentContext);
  const { getAgentById, current, loading, queryAgent, queryLoading, queryError } = agentContext;
  
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Load agent data on mount
  useEffect(() => {
    getAgentById(id);
    // eslint-disable-next-line
  }, [id]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Auto-focus input field
  useEffect(() => {
    if (!loading && current) {
      inputRef.current?.focus();
    }
  }, [loading, current]);
  
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
      
      // Add a short delay to make the response feel more natural
      setTimeout(() => {
        // Add agent response to conversation
        const agentMessage = {
          id: Date.now() + 1,
          role: 'agent',
          content: response.output || response.message || 'No response from agent',
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
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading agent...</p>
      </div>
    );
  }
  
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
          <div className={`agent-status ${getStatusClass(current.status)}`}>
            {current.status}
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
            disabled={current.status !== 'active' || isTyping}
            ref={inputRef}
          />
          <button 
            type="button" 
            className="voice-input-btn"
            disabled={current.status !== 'active' || isTyping}
          >
            <i className="fas fa-microphone"></i>
          </button>
        </div>
        <button 
          type="submit" 
          className="send-btn"
          disabled={!prompt.trim() || current.status !== 'active' || isTyping}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </form>
      
      {current.status !== 'active' && (
        <div className="agent-inactive-warning">
          <i className="fas fa-exclamation-circle"></i>
          <span>This agent is currently {current.status}. Activate it in the agent settings to enable chat.</span>
        </div>
      )}
    </div>
  );
};

export default AgentConsole;

// CSS Styling for the Agent Console
/* 
.agent-console-container {
  display: flex;
  flex-direction: column;
  height: 80vh;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.agent-console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.agent-info {
  display: flex;
  align-items: center;
}

.back-link {
  margin-right: 1rem;
  font-size: 1.2rem;
  color: #555;
}

.agent-status {
  display: flex;
  align-items: center;
  margin-left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status-active {
  background-color: #e6f7ee;
  color: #2ecc71;
}

.status-inactive {
  background-color: #f8f9fa;
  color: #adb5bd;
}

.status-error {
  background-color: #fdeded;
  color: #e74c3c;
}

.agent-type .type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  background-color: #ebf5fe;
  color: #3498db;
  font-size: 0.8rem;
  font-weight: 500;
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  background-color: #f9f9f9;
}

.empty-chat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  text-align: center;
  color: #777;
}

.empty-chat-content {
  max-width: 600px;
}

.empty-chat i {
  color: #ddd;
  margin-bottom: 1rem;
}

.empty-chat h3 {
  margin-bottom: 0.5rem;
  color: #444;
}

.suggestion-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.suggestion-btn {
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.suggestion-btn:hover {
  background-color: #e0e0e0;
}

.messages-list {
  display: flex;
  flex-direction: column;
}

.message-item {
  display: flex;
  margin-bottom: 1rem;
  max-width: 80%;
}

.message-agent {
  align-self: flex-start;
}

.message-user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-system {
  align-self: center;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.message-agent .message-avatar {
  background-color: #3498db;
}

.message-user .message-avatar {
  display: none;
}

.message-system .message-avatar {
  background-color: #f39c12;
}

.message-content {
  background-color: white;
  padding: 1rem;
  border-radius: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-agent .message-content {
  border-top-left-radius: 0;
}

.message-user .message-content {
  background-color: #3498db;
  color: white;
  border-top-right-radius: 0;
}

.message-system .message-content {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
}

.message-text {
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 0.5rem;
  text-align: right;
}

.message-user .message-time {
  color: rgba(255, 255, 255, 0.8);
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  float: left;
  margin: 0 1px;
  background-color: #9E9EA1;
  display: block;
  border-radius: 50%;
  opacity: 0.4;
}

.typing-indicator span:nth-of-type(1) {
  animation: 1s blink infinite 0.3333s;
}

.typing-indicator span:nth-of-type(2) {
  animation: 1s blink infinite 0.6666s;
}

.typing-indicator span:nth-of-type(3) {
  animation: 1s blink infinite 0.9999s;
}

@keyframes blink {
  50% {
    opacity: 1;
  }
}

.chat-input-form {
  display: flex;
  padding: 1rem;
  background-color: white;
  border-top: 1px solid #eee;
}

.input-container {
  flex: 1;
  display: flex;
  background-color: #f5f5f5;
  border-radius: 24px;
  overflow: hidden;
  margin-right: 0.5rem;
}

.input-container input {
  flex: 1;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  background-color: transparent;
}

.input-container input:focus {
  outline: none;
}

.voice-input-btn {
  background-color: transparent;
  border: none;
  padding: 0.75rem;
  cursor: pointer;
  color: #777;
}

.voice-input-btn:hover {
  color: #333;
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.send-btn:hover {
  background-color: #2980b9;
}

.send-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.agent-inactive-warning {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem;
  background-color: #fff3cd;
  border-top: 1px solid #ffeeba;
  color: #856404;
}

.agent-inactive-warning i {
  margin-right: 0.5rem;
}
*/