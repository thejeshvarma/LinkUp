import express from 'express';
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

const app = express();
const httpServer = createServer(app);

// Configure CORS for both Express and Socket.IO
const allowedOrigins = [
  'http://localhost:5173',
  'https://link-up-front.vercel.app',
  'https://link-up.vercel.app',
  'https://linkup-chat.vercel.app'
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
    credentials: true
  }
});

app.use(express.json());

// In-memory storage (replace with a database in production)
const users: User[] = [];
const onlineUsers = new Set<string>();

// Authentication endpoints
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (users.some((user) => user.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });

  res.status(201).json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({ message: 'Login successful' });
});

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