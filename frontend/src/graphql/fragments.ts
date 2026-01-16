import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    username
    name
    email
    bio
    createdAt
    followersCount
    followingCount
    postsCount
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    title
    content
    createdAt
    userId
  }
`;

export const RELATIONSHIP_FRAGMENT = gql`
  fragment RelationshipFields on Relationship {
    id
    followerId
    followingId
    createdAt
  }
`;
