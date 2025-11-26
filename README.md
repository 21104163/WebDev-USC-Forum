# WebDev-USC-Furom

A full-stack forum application built with React.js and Node.js Express.

## Project Structure

```
WebDev-USC-Furom/
├── backend/           # Node.js Express API server
│   ├── index.js       # Main server file with API routes
│   └── package.json   # Backend dependencies
├── frontend/          # React.js frontend application
│   ├── src/
│   │   ├── App.jsx    # Main React component
│   │   ├── App.css    # Component styles
│   │   └── main.jsx   # React entry point
│   └── package.json   # Frontend dependencies
└── README.md          # This file
```

## Features

- 📝 Create, read, and delete forum posts
- 🎨 Modern, responsive UI with USC colors
- 🔄 Real-time data refresh
- 📱 Mobile-friendly design

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/21104163/WebDev-USC-Furom.git
cd WebDev-USC-Furom
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

### Running the Application

1. Start the backend server (from the backend directory):
```bash
cd backend
npm start
```
The API server will run on http://localhost:5000

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```
The frontend will run on http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | Welcome message |
| GET | `/api/posts` | Get all posts |
| GET | `/api/posts/:id` | Get a single post |
| POST | `/api/posts` | Create a new post |
| PUT | `/api/posts/:id` | Update a post |
| DELETE | `/api/posts/:id` | Delete a post |

## Technologies Used

### Backend
- Node.js
- Express.js
- CORS

### Frontend
- React.js
- Vite
- CSS3

## License

ISC