import React, { useState } from 'react';
import UserList from './components/UserList';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import RelationshipManager from './components/RelationshipManager';
import './App.css';

type TabType = 'hive' | 'books' | 'connections';

function App() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('hive');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'hive', label: 'The Hive', icon: '🐝' },
    { id: 'books', label: 'Book Buzz', icon: '📚' },
    { id: 'connections', label: 'Connections', icon: '🍯' },
  ];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="brand">
            <span className="brand-icon">🐝</span>
            <div className="brand-text">
              <h1>BookHivez</h1>
              <span className="tagline">Share Your Reading Journey</span>
            </div>
          </div>
          
          <nav className="nav-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main buzz-in">
        <div className="content-section">
          {activeTab === 'hive' && (
            <>
              <div className="section-header">
                <h2>🐝 The Hive</h2>
                <p className="section-description">Meet the busy bees in our reading community</p>
              </div>
              <UserList onUserSelect={setSelectedUserId} selectedUserId={selectedUserId} />
            </>
          )}

          {activeTab === 'books' && (
            <>
              <div className="section-header">
                <h2>📚 Book Buzz</h2>
                <p className="section-description">Share and discover what everyone's reading</p>
              </div>
              <PostForm />
              <PostList userId={selectedUserId} />
            </>
          )}

          {activeTab === 'connections' && (
            <>
              <div className="section-header">
                <h2>🍯 Connections</h2>
                <p className="section-description">Build your network of book lovers</p>
              </div>
              <RelationshipManager />
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Made with 🍯 by BookHivez • Buzz together, read forever</p>
      </footer>
    </div>
  );
}

export default App;
