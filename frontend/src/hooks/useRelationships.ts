import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_RELATIONSHIPS, GET_USERS } from '../graphql/queries';
import { FOLLOW_USER, UNFOLLOW_USER } from '../graphql/mutations';
import type {
  Relationship,
  RelationshipsQueryResponse,
  FollowUserResponse,
  UnfollowUserResponse,
} from '../types';

interface UseRelationshipsReturn {
  relationships: Relationship[];
  loading: boolean;
  error: string | null;
  follow: (followingId: string) => Promise<Relationship | undefined>;
  unfollow: (followingId: string) => Promise<boolean>;
  clearError: () => void;
  refetch: () => void;
}

export function useRelationships(userId: string): UseRelationshipsReturn {
  const [error, setError] = useState<string | null>(null);

  const {
    data,
    loading,
    error: queryError,
    refetch,
  } = useQuery<RelationshipsQueryResponse>(GET_RELATIONSHIPS, {
    variables: { userId },
    skip: !userId,
  });

  // Refetch both relationships and users to update follower/following counts
  const refetchQueries = [
    { query: GET_RELATIONSHIPS, variables: { userId } },
    { query: GET_USERS },
  ];

  const [followMutation] = useMutation<FollowUserResponse>(FOLLOW_USER, {
    refetchQueries,
    onError: (err) => setError(err.message),
  });

  const [unfollowMutation] = useMutation<UnfollowUserResponse>(UNFOLLOW_USER, {
    refetchQueries,
    onError: (err) => setError(err.message),
  });

  const follow = useCallback(
    async (followingId: string): Promise<Relationship | undefined> => {
      setError(null);
      try {
        const result = await followMutation({
          variables: { followerId: userId, followingId },
        });
        return result.data?.followUser;
      } catch {
        // Error handled in onError callback
        return undefined;
      }
    },
    [userId, followMutation]
  );

  const unfollow = useCallback(
    async (followingId: string): Promise<boolean> => {
      setError(null);
      try {
        const result = await unfollowMutation({
          variables: { followerId: userId, followingId },
        });
        return result.data?.unfollowUser ?? false;
      } catch {
        // Error handled in onError callback
        return false;
      }
    },
    [userId, unfollowMutation]
  );

  const clearError = useCallback(() => setError(null), []);

  return {
    relationships: data?.relationships ?? [],
    loading,
    error: error || queryError?.message || null,
    follow,
    unfollow,
    clearError,
    refetch,
  };
}
