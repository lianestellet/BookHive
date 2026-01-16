import { dataStore } from '../data/store.js';
import { pubsub } from '../utils/pubsub.js';

export const relationshipResolvers = {
  Relationship: {
    follower: (parent) => {
      return dataStore.users.getById(parent.followerId);
    },
    following: (parent) => {
      return dataStore.users.getById(parent.followingId);
    },
  },
  Query: {
    relationships: (parent, args) => {
      return dataStore.relationships.getByFollowerId(args.userId);
    },
    search: (parent, args) => {
      const { query } = args;
      const queryLower = query.toLowerCase();
      const matchingUsers = dataStore.users
        .getAll()
        .filter(
          (u) =>
            u.username.toLowerCase().includes(queryLower) ||
            u.name.toLowerCase().includes(queryLower) ||
            (u.bio && u.bio.toLowerCase().includes(queryLower))
        );
      const matchingPosts = dataStore.posts
        .getAll()
        .filter(
          (p) =>
            p.title.toLowerCase().includes(queryLower) ||
            p.content.toLowerCase().includes(queryLower)
        );
      return {
        users: matchingUsers,
        posts: matchingPosts,
      };
    },
  },
  Mutation: {
    followUser: (parent, args) => {
      const { followerId, followingId } = args;
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }
      const follower = dataStore.users.getById(followerId);
      const following = dataStore.users.getById(followingId);
      if (!follower || !following) {
        throw new Error('User not found');
      }
      const relationship = dataStore.relationships.create({
        followerId,
        followingId,
      });
      if (!relationship) {
        throw new Error('Relationship already exists');
      }
      pubsub.publish('RELATIONSHIP_CREATED', {
        relationshipCreated: relationship,
      });
      return relationship;
    },
    unfollowUser: (parent, args) => {
      const { followerId, followingId } = args;
      const deleted = dataStore.relationships.delete(followerId, followingId);
      if (!deleted) {
        throw new Error('Relationship not found');
      }
      return true;
    },
  },
  Subscription: {
    relationshipCreated: {
      subscribe: () => pubsub.asyncIterator(['RELATIONSHIP_CREATED']),
    },
  },
};
