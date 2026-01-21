import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { faker } from '@faker-js/faker';
import { useUsers } from '../hooks';
import type { User, UserInput, UpdateUserInput } from '../types';
import './UserList.css';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface UserListProps {
  onUserSelect?: (userId: string) => void;
  selectedUserId?: string | null;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect, selectedUserId }) => {
  const { users, loading, error, createUser, updateUser, deleteUser } = useUsers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateClick = () => {
    setEditingUser(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleUserCardClick = (user: User) => {
    setEditingUser(user);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (user: User) => {
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id);
      if (selectedUserId === userToDelete.id) {
        onUserSelect?.(users.find(u => u.id !== userToDelete.id)?.id || '');
      }
      setUserToDelete(null);
      setIsModalOpen(false);
      setEditingUser(null);
      toast.success('User deleted successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user';
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormError(null);
  };

  const handleSubmit = async (data: UserInput) => {
    setFormError(null);
    try {
      if (editingUser) {
        const updateData: UpdateUserInput = {};
        if (data.username !== editingUser.username) updateData.username = data.username;
        if (data.email !== editingUser.email) updateData.email = data.email;
        if (data.name !== editingUser.name) updateData.name = data.name;
        if (data.bio !== editingUser.bio) updateData.bio = data.bio;
        
        await updateUser(editingUser.id, updateData);
        toast.success('User updated successfully!');
      } else {
        await createUser(data);
        toast.success('User created successfully!');
      }
      handleCloseModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setFormError(message);
      toast.error(message);
    }
  };

  if (loading && users.length === 0) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <button className="create-user-button" onClick={handleCreateClick}>
          + Add User
        </button>
      </div>

      <div className="user-list">
        {users.map((user: User) => (
          <div
            key={user.id}
            className={`user-card ${selectedUserId === user.id ? 'selected' : ''}`}
            onClick={() => handleUserCardClick(user)}
          >
            <div className="user-card-header">
              <div className="user-card-title">
                <h3>{user.name}</h3>
                <span className="username">@{user.username}</span>
              </div>
            </div>
            <p className="user-email">{user.email}</p>
            {user.bio && <p className="user-bio">{user.bio}</p>}
            <div className="user-stats">
              <span>{user.postsCount} posts</span>
              <span>{user.followersCount} followers</span>
              <span>{user.followingCount} following</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <UserFormModal
          user={editingUser}
          error={formError}
          onSubmit={handleSubmit}
          onClose={handleCloseModal}
          onDelete={editingUser ? () => handleDeleteRequest(editingUser) : undefined}
        />
      )}

      {userToDelete && (
        <ConfirmDeleteModal
          user={userToDelete}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setUserToDelete(null)}
        />
      )}
    </div>
  );
};

interface ConfirmDeleteModalProps {
  user: User;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  user,
  isDeleting,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content confirm-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-delete-icon">
          <span>⚠️</span>
        </div>
        
        <h3>Delete User</h3>
        
        <p className="confirm-delete-message">
          Are you sure you want to delete <strong>{user.name}</strong>?
        </p>

        <div className="confirm-delete-warning">
          <p>This action will permanently delete:</p>
          <ul>
            <li>
              <span className="warning-icon">📝</span>
              <span>{user.postsCount} {user.postsCount === 1 ? 'post' : 'posts'}</span>
            </li>
            <li>
              <span className="warning-icon">👥</span>
              <span>{user.followersCount} {user.followersCount === 1 ? 'follower relationship' : 'follower relationships'}</span>
            </li>
            <li>
              <span className="warning-icon">➡️</span>
              <span>{user.followingCount} following {user.followingCount === 1 ? 'relationship' : 'relationships'}</span>
            </li>
          </ul>
        </div>

        <p className="confirm-delete-note">This action cannot be undone.</p>

        <div className="confirm-delete-actions">
          <button 
            type="button" 
            className="cancel-button" 
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="confirm-delete-button" 
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface UserFormModalProps {
  user: User | null;
  error: string | null;
  onSubmit: (data: UserInput) => Promise<void>;
  onClose: () => void;
  onDelete?: () => void;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, error, onSubmit, onClose, onDelete }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const createSparkles = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + Math.random() * 0.5;
      const distance = 60 + Math.random() * 120;
      
      newSparkles.push({
        id: Date.now() + i,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: 0.5 + Math.random() * 0.7,
        delay: Math.random() * 0.15,
      });
    }
    
    setSparkles(prev => [...prev, ...newSparkles]);
    
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(ns => ns.id === s.id)));
    }, 1000);
  }, []);

  const generateRandomData = (e: React.MouseEvent) => {
    createSparkles(e);
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    setName(`${firstName} ${lastName}`);
    setUsername(faker.internet.username({ firstName, lastName }).toLowerCase());
    setEmail(faker.internet.email({ firstName, lastName }).toLowerCase());
    setBio(faker.person.bio());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !name.trim()) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit({
        username: username.trim(),
        email: email.trim(),
        name: name.trim(),
        bio: bio.trim() || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      {/* Sparkles */}
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
      
      <div className="drawer drawer-right" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="drawer-title">
            <span className="drawer-icon">🐝</span>
            <h3>{user ? 'Edit Hive Member' : 'New Hive Member'}</h3>
            {!user && (
              <button 
                type="button" 
                className="generate-icon-button" 
                onClick={generateRandomData}
                title="Auto-fill with random data"
              >
                🪄
              </button>
            )}
          </div>
          <button className="drawer-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="drawer-form">
          
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="busy_bee_123"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="bee@bookhivez.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Buzzy McReader"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio (optional)</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about your reading journey..."
              rows={4}
            />
          </div>

          <div className="drawer-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : user ? 'Save Changes' : 'Add to Hive'}
            </button>
          </div>

          {user && onDelete && (
            <div className="drawer-danger-zone">
              <p className="danger-zone-label">Danger Zone</p>
              <button type="button" className="drawer-delete-button" onClick={onDelete}>
                🗑️ Delete User
              </button>
              <p className="danger-zone-hint">
                This will delete all posts and relationships
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserList;
