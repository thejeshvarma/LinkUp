# WhatsApp-Inspired Chat Application

A real-time chat application built with React, Node.js, and Socket.IO, featuring a WhatsApp-inspired design.

## Features

- Real-time messaging using Socket.IO
- User authentication (username/password)
- Online users tracking
- WhatsApp-inspired UI with Bootstrap
- Responsive design for mobile and desktop
- Group chat functionality

## Tech Stack

### Frontend
- React with TypeScript
- Vite
- Bootstrap for styling
- Socket.IO client
- React Router for navigation

### Backend
- Node.js with Express
- Socket.IO for real-time communication
- TypeScript
- In-memory data storage (can be extended to use a database)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Start the development servers:

Backend:
```bash
cd server
npm run dev
```

Frontend:
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:3001`.

## Environment Variables

### Frontend (.env)
```
VITE_SOCKET_URL=http://localhost:3001
```

### Backend (.env)
```
PORT=3001
NODE_ENV=development
```

## Deployment

The application is configured for deployment on Vercel:

1. Frontend: Deploy the `client` directory
2. Backend: Deploy the `server` directory
3. Update the frontend environment variables with the production backend URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 