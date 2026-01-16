import { gql } from '@apollo/client';
import { USER_FRAGMENT, POST_FRAGMENT } from './fragments';

export const GET_USERS = gql`
  query GetUsers($limit: Int, $offset: Int) {
    users(limit: $limit, offset: $offset) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
      posts {
        ...PostFields
      }
    }
  }
  ${USER_FRAGMENT}
  ${POST_FRAGMENT}
`;

export const GET_POSTS = gql`
  query GetPosts($userId: ID) {
    posts(userId: $userId) {
      ...PostFields
      user {
        id
        username
        name
      }
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_RELATIONSHIPS = gql`
  query GetRelationships($userId: ID!) {
    relationships(userId: $userId) {
      id
      followerId
      followingId
      follower {
        id
        username
        name
      }
      following {
        id
        username
        name
      }
    }
  }
`;

export const SEARCH = gql`
  query Search($query: String!) {
    search(query: $query) {
      users {
        ...UserFields
      }
      posts {
        ...PostFields
        user {
          id
          username
          name
        }
      }
    }
  }
  ${USER_FRAGMENT}
  ${POST_FRAGMENT}
`;
