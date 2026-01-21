import { useQuery, useMutation } from '@apollo/client';
import { GET_USERS, GET_USER, GET_POSTS } from '../graphql/queries';
import { CREATE_USER, UPDATE_USER, DELETE_USER } from '../graphql/mutations';
import type {
  User,
  UserInput,
  UpdateUserInput,
  UsersQueryResponse,
  UserQueryResponse,
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
} from '../types';

interface UseUsersOptions {
  limit?: number;
  offset?: number;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
  createUser: (input: UserInput) => Promise<User | undefined>;
  updateUser: (id: string, input: UpdateUserInput) => Promise<User | undefined>;
  deleteUser: (id: string) => Promise<boolean>;
}

export function useUsers(options: UseUsersOptions = {}): UseUsersReturn {
  const { limit, offset } = options;

  const { data, loading, error, refetch } = useQuery<UsersQueryResponse>(GET_USERS, {
    variables: { limit, offset },
    fetchPolicy: 'cache-and-network',
  });

  const [createUserMutation] = useMutation<CreateUserResponse>(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS, variables: { limit, offset } }],
  });

  const [updateUserMutation] = useMutation<UpdateUserResponse>(UPDATE_USER);

  const [deleteUserMutation] = useMutation<DeleteUserResponse>(DELETE_USER, {
    update: (cache, { data: mutationData }, { variables: mutationVars }) => {
      if (!mutationData?.deleteUser || !mutationVars?.id) return;

      // Remove the deleted user from cache
      cache.modify({
        fields: {
          users(existingUsers = [], { readField }) {
            return existingUsers.filter(
              (userRef: { __ref: string }) => readField('id', userRef) !== mutationVars.id
            );
          },
        },
      });

      // Evict the deleted user and their posts from cache
      cache.evict({ id: `User:${mutationVars.id}` });
      cache.gc();
    },
    // Refetch posts since user's posts are deleted
    refetchQueries: [{ query: GET_POSTS }],
    awaitRefetchQueries: true,
  });

  const createUser = async (input: UserInput): Promise<User | undefined> => {
    const result = await createUserMutation({ variables: { input } });
    return result.data?.createUser;
  };

  const updateUser = async (id: string, input: UpdateUserInput): Promise<User | undefined> => {
    const result = await updateUserMutation({
      variables: { id, input },
      refetchQueries: [
        { query: GET_USERS, variables: { limit, offset } },
        { query: GET_USER, variables: { id } },
      ],
    });
    return result.data?.updateUser;
  };

  const deleteUser = async (id: string): Promise<boolean> => {
    const result = await deleteUserMutation({ variables: { id } });
    return result.data?.deleteUser ?? false;
  };

  return {
    users: data?.users ?? [],
    loading,
    error,
    refetch,
    createUser,
    updateUser,
    deleteUser,
  };
}

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

export function useUser(id: string): UseUserReturn {
  const { data, loading, error, refetch } = useQuery<UserQueryResponse>(GET_USER, {
    variables: { id },
    skip: !id,
  });

  return {
    user: data?.user ?? null,
    loading,
    error,
    refetch,
  };
}
