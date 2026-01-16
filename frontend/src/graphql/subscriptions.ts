import { gql } from '@apollo/client';
import { POST_FRAGMENT, RELATIONSHIP_FRAGMENT } from './fragments';

export const POST_CREATED_SUBSCRIPTION = gql`
  subscription PostCreated($userId: ID) {
    postCreated(userId: $userId) {
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

export const RELATIONSHIP_CREATED_SUBSCRIPTION = gql`
  subscription RelationshipCreated {
    relationshipCreated {
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
