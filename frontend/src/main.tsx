import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const httpLink = new HttpLink({
  uri: 'http://localhost:4000/graphql',
});

// Note: Subscriptions require WebSocket support
// For a training project, we'll use HTTP link for queries and mutations
// Subscriptions would require additional WebSocket server setup
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#2D2D2D',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#4CAF50',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#E53935',
              secondary: '#FFFFFF',
            },
            duration: 5000,
          },
        }}
      />
    </ApolloProvider>
  </React.StrictMode>
);
