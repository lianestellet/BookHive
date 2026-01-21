// In-memory data store
let users = [
  {
    id: '1',
    username: 'alice',
    email: 'alice@example.com',
    name: 'Alice Johnson',
    bio: 'Software developer',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: '2',
    username: 'bob',
    email: 'bob@example.com',
    name: 'Bob Smith',
    bio: 'Designer',
    createdAt: new Date('2024-01-02').toISOString(),
  },
  {
    id: '3',
    username: 'charlie',
    email: 'charlie@example.com',
    name: 'Charlie Brown',
    bio: 'Product manager',
    createdAt: new Date('2024-01-03').toISOString(),
  },
];

let posts = [
  {
    id: '1',
    userId: '1',
    title: 'My First Post',
    content: 'This is my first post on the platform!',
    createdAt: new Date('2024-01-05').toISOString(),
  },
  {
    id: '2',
    userId: '2',
    title: 'Design Principles',
    content: 'Here are some design principles I follow...',
    createdAt: new Date('2024-01-06').toISOString(),
  },
  {
    id: '3',
    userId: '1',
    title: 'GraphQL Tutorial',
    content: 'Learning GraphQL is fun!',
    createdAt: new Date('2024-01-07').toISOString(),
  },
];

let relationships = [
  {
    id: '1',
    followerId: '2',
    followingId: '1',
    createdAt: new Date('2024-01-08').toISOString(),
  },
  {
    id: '2',
    followerId: '3',
    followingId: '1',
    createdAt: new Date('2024-01-09').toISOString(),
  },
  {
    id: '3',
    followerId: '1',
    followingId: '2',
    createdAt: new Date('2024-01-10').toISOString(),
  },
];

let nextUserId = 4;
let nextPostId = 4;
let nextRelationshipId = 4;

export const dataStore = {
  users: {
    getAll: () => users,
    getById: (id) => users.find((u) => u.id === id),
    getByUsername: (username) => users.find((u) => u.username === username),
    create: (userData) => {
      const newUser = {
        id: String(nextUserId++),
        ...userData,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      return newUser;
    },
    update: (id, userData) => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return null;
      users[index] = { ...users[index], ...userData };
      return users[index];
    },
    delete: (id) => {
      const index = users.findIndex((u) => u.id === id);
      if (index === -1) return false;
      
      // Cascade delete: remove all posts by this user
      posts = posts.filter((p) => p.userId !== id);
      
      // Cascade delete: remove all relationships where user is follower or following
      relationships = relationships.filter(
        (r) => r.followerId !== id && r.followingId !== id
      );
      
      // Remove the user
      users.splice(index, 1);
      return true;
    },
  },
  posts: {
    getAll: () => posts,
    getById: (id) => posts.find((p) => p.id === id),
    getByUserId: (userId) => posts.filter((p) => p.userId === userId),
    create: (postData) => {
      const newPost = {
        id: String(nextPostId++),
        ...postData,
        createdAt: new Date().toISOString(),
      };
      posts.push(newPost);
      return newPost;
    },
    update: (id, postData) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) return null;
      posts[index] = { ...posts[index], ...postData };
      return posts[index];
    },
    delete: (id) => {
      const index = posts.findIndex((p) => p.id === id);
      if (index === -1) return false;
      posts.splice(index, 1);
      return true;
    },
  },
  relationships: {
    getAll: () => relationships,
    getById: (id) => relationships.find((r) => r.id === id),
    getByFollowerId: (followerId) =>
      relationships.filter((r) => r.followerId === followerId),
    getByFollowingId: (followingId) =>
      relationships.filter((r) => r.followingId === followingId),
    create: (relationshipData) => {
      // Check if relationship already exists
      const exists = relationships.find(
        (r) =>
          r.followerId === relationshipData.followerId &&
          r.followingId === relationshipData.followingId
      );
      if (exists) return null;

      const newRelationship = {
        id: String(nextRelationshipId++),
        ...relationshipData,
        createdAt: new Date().toISOString(),
      };
      relationships.push(newRelationship);
      return newRelationship;
    },
    delete: (followerId, followingId) => {
      const index = relationships.findIndex(
        (r) => r.followerId === followerId && r.followingId === followingId
      );
      if (index === -1) return false;
      relationships.splice(index, 1);
      return true;
    },
  },
};
