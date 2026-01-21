import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS, GET_USERS } from '../graphql/queries';
import { CREATE_POST, DELETE_POST } from '../graphql/mutations';
import type {
  Post,
  PostInput,
  PostsQueryResponse,
  CreatePostResponse,
  DeletePostResponse,
} from '../types';

interface UsePostsOptions {
  userId?: string | null;
}

interface UsePostsReturn {
  posts: Post[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
  createPost: (input: PostInput) => Promise<Post | undefined>;
  deletePost: (id: string) => Promise<boolean>;
}

export function usePosts(options: UsePostsOptions = {}): UsePostsReturn {
  const { userId } = options;

  const variables = userId ? { userId } : {};

  const { data, loading, error, refetch } = useQuery<PostsQueryResponse>(GET_POSTS, {
    variables,
    // Fetch from network but also update cache, ensures fresh data on navigation
    fetchPolicy: 'cache-and-network',
  });

  const [createPostMutation] = useMutation<CreatePostResponse>(CREATE_POST, {
    // Refetch queries to update both posts list and user stats
    refetchQueries: [
      { query: GET_POSTS },
      { query: GET_POSTS, variables },
      { query: GET_USERS },
    ],
    // Ensure refetch happens after mutation completes
    awaitRefetchQueries: true,
  });

  const [deletePostMutation] = useMutation<DeletePostResponse>(DELETE_POST, {
    // Update cache directly for immediate UI feedback
    update: (cache, { data: mutationData }, { variables: mutationVars }) => {
      if (!mutationData?.deletePost || !mutationVars?.id) return;

      // Remove the deleted post from all cached queries
      cache.modify({
        fields: {
          posts(existingPosts = [], { readField }) {
            return existingPosts.filter(
              (postRef: { __ref: string }) => readField('id', postRef) !== mutationVars.id
            );
          },
        },
      });

      // Evict the deleted post from cache entirely
      cache.evict({ id: `Post:${mutationVars.id}` });
      cache.gc();
    },
    // Also refetch to ensure consistency
    refetchQueries: [{ query: GET_USERS }],
    awaitRefetchQueries: true,
  });

  const createPost = async (input: PostInput): Promise<Post | undefined> => {
    const result = await createPostMutation({ variables: { input } });
    return result.data?.createPost;
  };

  const deletePost = async (id: string): Promise<boolean> => {
    const result = await deletePostMutation({ variables: { id } });
    return result.data?.deletePost ?? false;
  };

  return {
    posts: data?.posts ?? [],
    loading,
    error,
    refetch,
    createPost,
    deletePost,
  };
}
