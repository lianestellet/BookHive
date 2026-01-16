import { dataStore } from '../data/store.js';
import { pubsub } from '../utils/pubsub.js';

export const postResolvers = {
  Post: {
    user: (parent) => {
      return dataStore.users.getById(parent.userId);
    },
  },
  Query: {
    posts: (parent, args) => {
      if (args.userId) {
        return dataStore.posts.getByUserId(args.userId);
      }
      return dataStore.posts.getAll();
    },
    post: (parent, args) => {
      return dataStore.posts.getById(args.id);
    },
  },
  Mutation: {
    createPost: (parent, args) => {
      const { input } = args;
      const user = dataStore.users.getById(input.userId);
      if (!user) {
        throw new Error('User not found');
      }
      const newPost = dataStore.posts.create(input);
      pubsub.publish('POST_CREATED', {
        postCreated: newPost,
      });
      return newPost;
    },
    deletePost: (parent, args) => {
      return dataStore.posts.delete(args.id);
    },
  },
  Subscription: {
    postCreated: {
      subscribe: (parent, args) => {
        return pubsub.asyncIterator(['POST_CREATED']);
      },
    },
  },
};
