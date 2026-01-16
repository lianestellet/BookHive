import { dataStore } from '../data/store.js';

export const userResolvers = {
  User: {
    posts: (parent) => {
      return dataStore.posts.getByUserId(parent.id);
    },
    followers: (parent) => {
      return dataStore.relationships.getByFollowingId(parent.id);
    },
    following: (parent) => {
      return dataStore.relationships.getByFollowerId(parent.id);
    },
    followersCount: (parent) => {
      return dataStore.relationships.getByFollowingId(parent.id).length;
    },
    followingCount: (parent) => {
      return dataStore.relationships.getByFollowerId(parent.id).length;
    },
    postsCount: (parent) => {
      return dataStore.posts.getByUserId(parent.id).length;
    },
  },
  Query: {
    users: (parent, args) => {
      const { limit, offset = 0 } = args;
      const allUsers = dataStore.users.getAll();
      const paginatedUsers = limit
        ? allUsers.slice(offset, offset + limit)
        : allUsers.slice(offset);
      return paginatedUsers;
    },
    user: (parent, args) => {
      return dataStore.users.getById(args.id);
    },
  },
  Mutation: {
    createUser: (parent, args) => {
      const { input } = args;
      // Check if username already exists
      const existingUser = dataStore.users.getByUsername(input.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      return dataStore.users.create(input);
    },
    updateUser: (parent, args) => {
      const { id, input } = args;
      return dataStore.users.update(id, input);
    },
  },
};
