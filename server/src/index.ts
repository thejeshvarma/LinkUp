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

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['*'],
    exposedHeaders: ['*']
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 