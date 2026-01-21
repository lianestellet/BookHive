import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import { useUsers } from '../hooks';
import type { User, UserInput, UpdateUserInput } from '../types';
import './UserList.css';

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

  const handleEditClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
    setEditingUser(user);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, user: User) => {
    e.stopPropagation();
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
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
      } else {
        await createUser(data);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
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
            onClick={() => onUserSelect?.(user.id)}
          >
            <div className="user-card-header">
              <div className="user-card-title">
                <h3>{user.name}</h3>
                <span className="username">@{user.username}</span>
              </div>
              <div className="user-card-actions">
                <button
                  className="edit-button"
                  onClick={(e) => handleEditClick(e, user)}
                  title="Edit user"
                >
                  ✎
                </button>
                <button
                  className="delete-button"
                  onClick={(e) => handleDeleteClick(e, user)}
                  title="Delete user"
                >
                  ×
                </button>
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
}

const UserFormModal: React.FC<UserFormModalProps> = ({ user, error, onSubmit, onClose }) => {
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generateRandomData = () => {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{user ? 'Edit User' : 'Create User'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {!user && (
            <button type="button" className="generate-random-button" onClick={generateRandomData}>
              🎲 Generate User Data
            </button>
          )}
          
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
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
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio (optional)</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : user ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserList;
