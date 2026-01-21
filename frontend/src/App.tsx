import React, { useState } from 'react';
import UserList from './components/UserList';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import RelationshipManager from './components/RelationshipManager';
import './App.css';

function App() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'relationships'>('users');

  return (
    <div className="app">
      <header className="app-header">
        <h1>GraphQL Training Application</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={activeTab === 'posts' ? 'active' : ''}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={activeTab === 'relationships' ? 'active' : ''}
            onClick={() => setActiveTab('relationships')}
          >
            Relationships
          </button>
        </nav>
      </header>

      <main className="app-main">
        {activeTab === 'users' && (
          <div className="content-section">
            <h2>Users</h2>
            <UserList onUserSelect={setSelectedUserId} selectedUserId={selectedUserId} />
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="content-section">
            <h2>Posts</h2>
            <PostForm />
            <PostList userId={selectedUserId} />
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="content-section">
            <h2>Relationships</h2>
            <RelationshipManager />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
