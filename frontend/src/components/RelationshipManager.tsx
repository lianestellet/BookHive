import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RELATIONSHIPS, GET_USERS } from '../graphql/queries';
import { FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations';
import './RelationshipManager.css';

interface RelationshipManagerProps {
  userId: string;
}

interface Relationship {
  id: string;
  followerId: string;
  followingId: string;
  follower: {
    id: string;
    username: string;
    name: string;
  };
  following: {
    id: string;
    username: string;
    name: string;
  };
}

interface User {
  id: string;
  username: string;
  name: string;
}

const RelationshipManager: React.FC<RelationshipManagerProps> = ({ userId }) => {
  const [followingId, setFollowingId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { loading: relationshipsLoading, data: relationshipsData, refetch } = useQuery<{
    relationships: Relationship[];
  }>(GET_RELATIONSHIPS, {
    variables: { userId },
  });

  const { loading: usersLoading, data: usersData } = useQuery<{ users: User[] }>(GET_USERS);

  const [followUser] = useMutation(FOLLOW_USER, {
    refetchQueries: [{ query: GET_RELATIONSHIPS, variables: { userId } }],
    onError: (err) => {
      setError(err.message);
    },
    onCompleted: () => {
      setFollowingId('');
      setError(null);
    },
  });

  const [unfollowUser] = useMutation(UNFOLLOW_USER, {
    refetchQueries: [{ query: GET_RELATIONSHIPS, variables: { userId } }],
    onError: (err) => {
      setError(err.message);
    },
  });

  const handleFollow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followingId) {
      setError('Please select a user to follow');
      return;
    }

    try {
      await followUser({
        variables: {
          followerId: userId,
          followingId,
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  const handleUnfollow = async (relationshipId: string, followingIdToUnfollow: string) => {
    if (window.confirm('Are you sure you want to unfollow this user?')) {
      try {
        await unfollowUser({
          variables: {
            followerId: userId,
            followingId: followingIdToUnfollow,
          },
        });
      } catch (err) {
        // Error handled in onError
      }
    }
  };

  if (relationshipsLoading || usersLoading) {
    return <div className="loading">Loading relationships...</div>;
  }

  const relationships = relationshipsData?.relationships || [];
  const users = usersData?.users || [];
  const availableUsers = users.filter((u) => u.id !== userId);

  return (
    <div className="relationship-manager">
      {error && <div className="error-message">{error}</div>}

      <div className="follow-section">
        <h3>Follow User</h3>
        <form onSubmit={handleFollow} className="follow-form">
          <select
            value={followingId}
            onChange={(e) => setFollowingId(e.target.value)}
            className="user-select"
          >
            <option value="">Select a user...</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} (@{user.username})
              </option>
            ))}
          </select>
          <button type="submit" className="follow-button">
            Follow
          </button>
        </form>
      </div>

      <div className="following-section">
        <h3>Following ({relationships.length})</h3>
        {relationships.length === 0 ? (
          <div className="empty-state">Not following anyone yet</div>
        ) : (
          <div className="relationship-list">
            {relationships.map((relationship) => (
              <div key={relationship.id} className="relationship-card">
                <div className="relationship-info">
                  <h4>{relationship.following.name}</h4>
                  <p className="username">@{relationship.following.username}</p>
                </div>
                <button
                  className="unfollow-button"
                  onClick={() => handleUnfollow(relationship.id, relationship.followingId)}
                >
                  Unfollow
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RelationshipManager;
