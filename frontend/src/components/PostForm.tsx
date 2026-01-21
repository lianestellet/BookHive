import React, { useState, useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { usePosts, useUsers } from '../hooks';
import type { User } from '../types';
import './PostForm.css';

const PostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  const generatePostContent = () => {
    setTitle(faker.book.title());
    setContent(faker.book.series());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Please select a user');
      return;
    }
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <div className="post-form-header">
        <h3>Create New Post</h3>
      </div>
        <button type="button" className="generate-random-button" onClick={generatePostContent}>
          🎲 Generate Post Content
        </button>
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
