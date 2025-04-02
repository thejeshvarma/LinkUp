import express, { Request, Response, RequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcrypt';

interface User {
  username: string;
  password: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: number;
}

interface RegisterRequest {
  username: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const allowedOrigins = [
  'http://localhost:5173',
  'https://link-up-front.vercel.app',
  'https://link-up.vercel.app',
  'https://linkup-chat.vercel.app',
  'https://link-up-git-main-thejeshvarma.vercel.app',
  'https://link-up-thejeshvarma.vercel.app',
  'https://link-upch.vercel.app'
];

// Configure CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  path: '/socket.io/',
  transports: ['polling'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e8
});

app.use(express.json());

// In-memory storage (replace with a database in production)
const users: User[] = [];
const onlineUsers = new Set<string>();

// Authentication endpoints
const registerHandler: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  if (users.some((user) => user.username === username)) {
    res.status(400).json({ error: 'Username already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
};

const loginHandler: RequestHandler = async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({ message: 'Login successful' });
};

app.post('/api/register', registerHandler);
app.post('/api/login', loginHandler);

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('user:join', (username: string) => {
    socket.data.username = username;
    onlineUsers.add(username);
    io.emit('user:list', Array.from(onlineUsers));
  });

  socket.on('chat:message', (message: Message) => {
    io.emit('chat:message', message);
  });

  socket.on('disconnect', () => {
    if (socket.data.username) {
      onlineUsers.delete(socket.data.username);
      io.emit('user:list', Array.from(onlineUsers));
    }
    console.log('A user disconnected');
  });
});

// Add error handling for Socket.IO
io.engine.on('connection_error', (err) => {
  console.log('Connection error:', err);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 