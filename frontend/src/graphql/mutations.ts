import { gql } from '@apollo/client';
import { USER_FRAGMENT, POST_FRAGMENT, RELATIONSHIP_FRAGMENT } from './fragments';

export const CREATE_USER = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const CREATE_POST = gql`
  mutation CreatePost($input: PostInput!) {
    createPost(input: $input) {
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

export const DELETE_POST = gql`
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }
`;

export const FOLLOW_USER = gql`
  mutation FollowUser($followerId: ID!, $followingId: ID!) {
    followUser(followerId: $followerId, followingId: $followingId) {
      ...RelationshipFields
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
  ${RELATIONSHIP_FRAGMENT}
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($followerId: ID!, $followingId: ID!) {
    unfollowUser(followerId: $followerId, followingId: $followingId)
  }
`;
