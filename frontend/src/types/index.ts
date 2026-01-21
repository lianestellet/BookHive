// User types
export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  bio?: string;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  posts?: Post[];
}

export interface UserInput {
  username: string;
  email: string;
  name: string;
  bio?: string;
}

export interface UpdateUserInput {
  username?: string;
  email?: string;
  name?: string;
  bio?: string;
}

// Post types
export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  user?: UserBasic;
}

export interface PostInput {
  userId: string;
  title: string;
  content: string;
}

// Relationship types
export interface Relationship {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
  follower?: UserBasic;
  following?: UserBasic;
}

// Basic user info for nested relations
export interface UserBasic {
  id: string;
  username: string;
  name: string;
}

// Search result types
export interface SearchResult {
  users: User[];
  posts: Post[];
}

// Query response types
export interface UsersQueryResponse {
  users: User[];
}

export interface UserQueryResponse {
  user: User;
}

export interface PostsQueryResponse {
  posts: Post[];
}

export interface RelationshipsQueryResponse {
  relationships: Relationship[];
}

export interface SearchQueryResponse {
  search: SearchResult;
}

// Mutation response types
export interface CreateUserResponse {
  createUser: User;
}

export interface UpdateUserResponse {
  updateUser: User;
}

export interface DeleteUserResponse {
  deleteUser: boolean;
}

export interface CreatePostResponse {
  createPost: Post;
}

export interface DeletePostResponse {
  deletePost: boolean;
}

export interface FollowUserResponse {
  followUser: Relationship;
}

export interface UnfollowUserResponse {
  unfollowUser: boolean;
}
