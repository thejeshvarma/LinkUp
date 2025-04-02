import { useState, useEffect, useRef } from 'react';
import { io as socketIO, Socket as SocketType } from 'socket.io-client';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

interface ChatProps {
  username: string;
  onLogout: () => void;
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

const Chat = ({ username, onLogout }: ChatProps) => {
  const [socket, setSocket] = useState<SocketType | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = socketIO(SOCKET_URL, {
      withCredentials: true,
      transports: ['polling'],
      path: '/socket.io/',
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 45000,
      forceNew: true,
      autoConnect: true,
      extraHeaders: {
        'Access-Control-Allow-Origin': '*'
      }
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('user:join', username);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect:', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.log('Failed to reconnect');
    });

    newSocket.on('user:list', (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on('chat:message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: username,
      content: newMessage.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    socket.emit('chat:message', message);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="chat-container">
      <div className="row g-0 h-100">
        {/* Sidebar */}
        <div className={`col-md-4 col-lg-3 sidebar ${showSidebar ? 'show' : ''}`}>
          <div className="p-3 border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Online Users</h5>
              <button
                onClick={onLogout}
                className="btn btn-link text-danger p-0 text-decoration-none"
              >
                Logout
              </button>
            </div>
            <p className="text-muted small mb-0">Welcome, {username}!</p>
          </div>
          <div className="p-3">
            {onlineUsers.map((user) => (
              <div
                key={user}
                className="d-flex align-items-center p-2 rounded hover-bg-light"
              >
                <div className="online-indicator"></div>
                <span>{user}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col">
          {/* Chat Header */}
          <div className="chat-header p-3 d-flex align-items-center">
            <button
              className="btn btn-link d-md-none me-2 p-0"
              onClick={toggleSidebar}
            >
              <i className="bi bi-list fs-4"></i>
            </button>
            <h5 className="mb-0">Group Chat</h5>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`d-flex flex-column ${
                  message.sender === username ? 'align-items-end' : 'align-items-start'
                }`}
              >
                <div
                  className={`message-bubble ${
                    message.sender === username ? 'message-sent' : 'message-received'
                  }`}
                >
                  {message.sender !== username && (
                    <small className="text-muted d-block mb-1">{message.sender}</small>
                  )}
                  <p className="mb-1">{message.content}</p>
                  <small className="text-end opacity-75 d-block">
                    {formatTime(message.timestamp)}
                  </small>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="message-input-container">
            <form onSubmit={handleSendMessage}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                />
                <button
                  type="submit"
                  className="btn btn-whatsapp"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 