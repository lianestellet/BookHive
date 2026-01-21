import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useRelationships, useUsers } from '../hooks';
import type { User } from '../types';
import './RelationshipManager.css';

const RelationshipManager: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'following' | 'discover'>('following');

  const { users, loading: usersLoading } = useUsers();

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setSearchQuery('');
    setActiveTab('following');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setSearchQuery('');
  };

  if (usersLoading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="relationship-manager">
      <p className="instruction">Select a user to manage their relationships</p>
      
      <div className="user-grid">
        {users.map((user: User) => (
          <div
            key={user.id}
            className="user-grid-card"
            onClick={() => handleUserClick(user)}
          >
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h4>{user.name}</h4>
            <p className="username">@{user.username}</p>
            <div className="user-stats-mini">
              <span>{user.followingCount} following</span>
              <span>{user.followersCount} followers</span>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedUser && (
        <RelationshipModal
          user={selectedUser}
          users={users}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

interface RelationshipModalProps {
  user: User;
  users: User[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: 'following' | 'discover';
  setActiveTab: (tab: 'following' | 'discover') => void;
  onClose: () => void;
}

const RelationshipModal: React.FC<RelationshipModalProps> = ({
  user,
  users,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onClose,
}) => {
  const {
    relationships,
    loading: relationshipsLoading,
    error,
    follow,
    unfollow,
    clearError,
  } = useRelationships(user.id);

  const followingIds = useMemo(() => {
    return new Set(relationships.map((r) => r.followingId));
  }, [relationships]);

  const filteredFollowing = useMemo(() => {
    if (!searchQuery.trim()) return relationships;
    const query = searchQuery.toLowerCase();
    return relationships.filter(
      (r) =>
        r.following?.name.toLowerCase().includes(query) ||
        r.following?.username.toLowerCase().includes(query)
    );
  }, [relationships, searchQuery]);

  const discoverUsers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return users.filter((u) => {
      // Exclude current user and already following
      if (u.id === user.id || followingIds.has(u.id)) return false;
      // Filter by search query
      if (!searchQuery.trim()) return true;
      return (
        u.name.toLowerCase().includes(query) ||
        u.username.toLowerCase().includes(query)
      );
    });
  }, [users, user.id, followingIds, searchQuery]);

  const handleFollow = async (followingId: string) => {
    try {
      await follow(followingId);
      const followedUser = users.find(u => u.id === followingId);
      toast.success(`Now following ${followedUser?.name || 'user'}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to follow user';
      toast.error(message);
    }
  };

  const handleUnfollow = async (followingId: string) => {
    try {
      await unfollow(followingId);
      const unfollowedUser = users.find(u => u.id === followingId);
      toast.success(`Unfollowed ${unfollowedUser?.name || 'user'}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unfollow user';
      toast.error(message);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-user-info">
            <div className="modal-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{user.name}</h3>
              <p className="username">@{user.username}</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={clearError} className="dismiss-error">×</button>
          </div>
        )}

        <div className="modal-tabs">
          <button
            className={activeTab === 'following' ? 'active' : ''}
            onClick={() => setActiveTab('following')}
          >
            Following ({relationships.length})
          </button>
          <button
            className={activeTab === 'discover' ? 'active' : ''}
            onClick={() => setActiveTab('discover')}
          >
            Discover Users
          </button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder={activeTab === 'following' ? 'Search followed users...' : 'Search users to follow...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="modal-body">
          {relationshipsLoading ? (
            <div className="loading">Loading...</div>
          ) : activeTab === 'following' ? (
            <div className="user-list-modal">
              {filteredFollowing.length === 0 ? (
                <div className="empty-state">
                  {searchQuery ? 'No matching users found' : 'Not following anyone yet'}
                </div>
              ) : (
                filteredFollowing.map((relationship) => (
                  <div key={relationship.id} className="user-list-item">
                    <div className="user-list-avatar">
                      {relationship.following?.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-list-info">
                      <h4>{relationship.following?.name}</h4>
                      <p className="username">@{relationship.following?.username}</p>
                    </div>
                    <button
                      className="unfollow-button"
                      onClick={() => handleUnfollow(relationship.followingId)}
                    >
                      Unfollow
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="user-list-modal">
              {discoverUsers.length === 0 ? (
                <div className="empty-state">
                  {searchQuery ? 'No matching users found' : 'No more users to follow'}
                </div>
              ) : (
                discoverUsers.map((discoverUser) => (
                  <div key={discoverUser.id} className="user-list-item">
                    <div className="user-list-avatar">
                      {discoverUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-list-info">
                      <h4>{discoverUser.name}</h4>
                      <p className="username">@{discoverUser.username}</p>
                    </div>
                    <button
                      className="follow-button"
                      onClick={() => handleFollow(discoverUser.id)}
                    >
                      Follow
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipManager;
