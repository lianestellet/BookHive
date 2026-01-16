import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS } from '../graphql/queries';
import './UserList.css';

interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
}

interface UserListProps {
  onUserSelect?: (userId: string) => void;
  selectedUserId?: string | null;
}

const UserList: React.FC<UserListProps> = ({ onUserSelect, selectedUserId }) => {
  const { loading, error, data } = useQuery<{ users: User[] }>(GET_USERS);

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="user-list">
      {data?.users.map((user) => (
        <div
          key={user.id}
          className={`user-card ${selectedUserId === user.id ? 'selected' : ''}`}
          onClick={() => onUserSelect?.(user.id)}
        >
          <div className="user-card-header">
            <h3>{user.name}</h3>
            <span className="username">@{user.username}</span>
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
  );
};

export default UserList;
