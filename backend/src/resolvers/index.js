import { userResolvers } from './User.js';
import { postResolvers } from './Post.js';
import { relationshipResolvers } from './Relationship.js';
import { DateTimeScalar } from '../schema/directives.js';

export const resolvers = {
  DateTime: DateTimeScalar,
  Query: {
    ...userResolvers.Query,
    ...postResolvers.Query,
    ...relationshipResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...postResolvers.Mutation,
    ...relationshipResolvers.Mutation,
  },
  Subscription: {
    ...postResolvers.Subscription,
    ...relationshipResolvers.Subscription,
  },
  User: userResolvers.User,
  Post: postResolvers.Post,
  Relationship: relationshipResolvers.Relationship,
};
