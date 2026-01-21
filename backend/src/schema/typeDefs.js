export const typeDefs = `
  scalar DateTime

  type User {
    id: ID!
    username: String!
    email: String!
    name: String!
    bio: String
    createdAt: DateTime!
    posts: [Post!]!
    followers: [Relationship!]!
    following: [Relationship!]!
    followersCount: Int!
    followingCount: Int!
    postsCount: Int!
  }

  type Post {
    id: ID!
    userId: ID!
    user: User!
    title: String!
    content: String!
    createdAt: DateTime!
  }

  type Relationship {
    id: ID!
    followerId: ID!
    followingId: ID!
    follower: User!
    following: User!
    createdAt: DateTime!
  }

  type SearchResult {
    users: [User!]!
    posts: [Post!]!
  }

  input UserInput {
    username: String!
    email: String!
    name: String!
    bio: String
  }

  input UpdateUserInput {
    username: String
    email: String
    name: String
    bio: String
  }

  input PostInput {
    userId: ID!
    title: String!
    content: String!
  }

  input RelationshipInput {
    followerId: ID!
    followingId: ID!
  }

  type Query {
    users(limit: Int, offset: Int): [User!]!
    user(id: ID!): User
    posts(userId: ID): [Post!]!
    post(id: ID!): Post
    relationships(userId: ID!): [Relationship!]!
    search(query: String!): SearchResult!
  }

  type Mutation {
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UpdateUserInput!): User
    deleteUser(id: ID!): Boolean!
    createPost(input: PostInput!): Post!
    deletePost(id: ID!): Boolean!
    followUser(followerId: ID!, followingId: ID!): Relationship!
    unfollowUser(followerId: ID!, followingId: ID!): Boolean!
  }

  type Subscription {
    postCreated(userId: ID): Post!
    relationshipCreated: Relationship!
  }
`;
