# GraphQL Training Project

A full-stack training application to practice Node.js + Express, GraphQL (advanced features), and React skills for coding challenges.

## Project Overview

This project demonstrates a complete GraphQL application with:
- **Backend**: Node.js + Express + Apollo Server
- **Frontend**: React + TypeScript + Apollo Client
- **GraphQL Features**: Queries, Mutations, Subscriptions, Custom Scalars, Fragments
- **Data Store**: In-memory data store (can be easily replaced with a database)

## Features

### Backend Features
- Express server with CORS and middleware
- GraphQL API with Apollo Server
- Custom DateTime scalar
- GraphQL fragments support
- Search functionality with union types
- Real-time subscriptions (PubSub)
- Error handling middleware
- Request logging

### Frontend Features
- React 18 with TypeScript
- Apollo Client for GraphQL operations
- GraphQL fragments for reusable queries
- Query, mutation, and subscription hooks
- Error handling and loading states
- Modern UI with CSS

## Project Structure

```
graphql-training/
├── backend/              # Node.js + Express + GraphQL server
│   ├── src/
│   │   ├── server.js         # Express server setup
│   │   ├── schema/           # GraphQL schema definitions
│   │   ├── resolvers/        # GraphQL resolvers
│   │   ├── data/             # In-memory data store
│   │   ├── middleware/       # Express middleware
│   │   └── utils/            # Utilities
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── graphql/          # GraphQL queries, mutations, fragments
│   │   └── App.tsx           # Main application component
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional):
   ```bash
   PORT=4000
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:4000`
   GraphQL endpoint: `http://localhost:4000/graphql`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

## GraphQL API

### Queries

- `users(limit: Int, offset: Int)`: Get all users with pagination
- `user(id: ID!)`: Get user by ID
- `posts(userId: ID)`: Get posts (optionally filtered by userId)
- `post(id: ID!)`: Get post by ID
- `relationships(userId: ID!)`: Get relationships for a user
- `search(query: String!)`: Search users and posts

### Mutations

- `createUser(input: UserInput!)`: Create a new user
- `updateUser(id: ID!, input: UpdateUserInput!)`: Update a user
- `createPost(input: PostInput!)`: Create a new post
- `deletePost(id: ID!)`: Delete a post
- `followUser(followerId: ID!, followingId: ID!)`: Follow a user
- `unfollowUser(followerId: ID!, followingId: ID!)`: Unfollow a user

### Subscriptions

- `postCreated(userId: ID)`: Subscribe to new posts
- `relationshipCreated`: Subscribe to new relationships

### Types

- **User**: User profile with posts, followers, and following
- **Post**: User posts with title and content
- **Relationship**: Following relationships between users
- **SearchResult**: Union type for search results

## Learning Objectives

This project covers:

1. Express server setup and middleware
2. GraphQL schema design and type system
3. GraphQL queries, mutations, and subscriptions
4. Advanced GraphQL features (custom scalars, fragments, union types)
5. React hooks and component patterns
6. GraphQL client integration with Apollo Client
7. Real-time data with subscriptions
8. Error handling and loading states
9. TypeScript integration
10. Full-stack application architecture

## Example GraphQL Queries

### Get all users
```graphql
query {
  users {
    id
    username
    name
    email
    postsCount
    followersCount
  }
}
```

### Create a post
```graphql
mutation {
  createPost(input: {
    userId: "1"
    title: "My New Post"
    content: "This is the content of my post"
  }) {
    id
    title
    content
    user {
      name
    }
  }
}
```

### Search
```graphql
query {
  search(query: "graphql") {
    users {
      id
      username
      name
    }
    posts {
      id
      title
      content
    }
  }
}
```

## Technologies Used

### Backend
- Node.js
- Express
- Apollo Server
- GraphQL
- graphql-subscriptions
- dotenv
- cors

### Frontend
- React 18
- TypeScript
- Vite
- Apollo Client
- React Router (for navigation if needed)

## Development

### Backend Scripts
- `npm run dev`: Start development server with watch mode
- `npm start`: Start production server

### Frontend Scripts
- `npm run dev`: Start Vite dev server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Notes

- The backend uses an in-memory data store for simplicity. Data will reset on server restart.
- Subscriptions are set up but require WebSocket support for full functionality (currently using HTTP only for training purposes).
- This is a training project designed to practice GraphQL concepts.

## License

ISC
