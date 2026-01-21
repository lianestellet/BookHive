import React, { useState, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import { faker } from '@faker-js/faker';
import { usePosts, useUsers } from '../hooks';
import type { User } from '../types';
import './PostForm.css';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

const PostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const { createPost } = usePosts();
  const { users, loading: usersLoading } = useUsers();

  const selectedUser = users.find((u: User) => u.id === userId);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users;
    const search = userSearch.toLowerCase();
    return users.filter(
      (u: User) =>
        u.name.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search)
    );
  }, [users, userSearch]);

  const handleUserSelect = (user: User) => {
    setUserId(user.id);
    setUserSearch('');
    setIsUserDropdownOpen(false);
  };

  const createSparkles = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 24; i++) {
      // Create sparkles in a wider circular pattern
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 60 + Math.random() * 120;
      
      newSparkles.push({
        id: Date.now() + i,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: 0.5 + Math.random() * 0.7, // Size between 0.5rem and 1.2rem
        delay: Math.random() * 0.15, // Stagger the animation slightly
      });
    }
    
    setSparkles(prev => [...prev, ...newSparkles]);
    
    // Remove sparkles after animation
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  }, []);

  const generatePostContent = (e: React.MouseEvent) => {
    createSparkles(e);
    setTitle(faker.book.title());
    setContent(faker.book.series());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Please select a user');
      return;
    }
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createPost({
        userId,
        title: title.trim(),
        content: content.trim(),
      });
      setTitle('');
      setContent('');
      toast.success('Post created successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create post';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {/* Sparkle container */}
      {sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="sparkle"
          style={{
            left: sparkle.x,
            top: sparkle.y,
            fontSize: `${sparkle.size}rem`,
            animationDelay: `${sparkle.delay}s`,
          }}
        >
          ✨
        </div>
      ))}
      
      <div className="post-form-header">
        <h3>Create New Post</h3>
        <button 
          type="button" 
          className="generate-icon-button" 
          onClick={generatePostContent}
          title="Auto-fill with book data"
        >
          🪄
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="userSelect">Author:</label>
        <div className="user-select-container">
          <input
            id="userSelect"
            type="text"
            className="user-search-input"
            placeholder={usersLoading ? 'Loading users...' : 'Search and select a user...'}
            value={isUserDropdownOpen ? userSearch : (selectedUser ? `${selectedUser.name} (@${selectedUser.username})` : '')}
            onChange={(e) => {
              setUserSearch(e.target.value);
              setIsUserDropdownOpen(true);
            }}
            onFocus={() => {
              setIsUserDropdownOpen(true);
              setUserSearch('');
            }}
            onBlur={() => {
              // Delay to allow click on dropdown item
              setTimeout(() => setIsUserDropdownOpen(false), 200);
            }}
            disabled={usersLoading}
            autoComplete="off"
          />
          {isUserDropdownOpen && !usersLoading && (
            <div className="user-dropdown">
              {filteredUsers.length === 0 ? (
                <div className="user-dropdown-empty">No users found</div>
              ) : (
                filteredUsers.map((user: User) => (
                  <div
                    key={user.id}
                    className={`user-dropdown-item ${userId === user.id ? 'selected' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <span className="user-name">{user.name}</span>
                    <span className="user-username">@{user.username}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
      </div>
      
      <button type="submit" disabled={loading || !userId} className="submit-button">
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};

export default PostForm;
