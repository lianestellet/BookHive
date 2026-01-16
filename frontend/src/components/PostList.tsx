import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_POSTS } from '../graphql/queries';
import { DELETE_POST } from '../graphql/mutations';
import './PostList.css';

interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string;
  };
}

interface PostListProps {
  userId?: string | null;
}

const PostList: React.FC<PostListProps> = ({ userId }) => {
  const { loading, error, data } = useQuery<{ posts: Post[] }>(GET_POSTS, {
    variables: userId ? { userId } : {},
  });

  const [deletePost] = useMutation(DELETE_POST, {
    refetchQueries: [{ query: GET_POSTS, variables: userId ? { userId } : {} }],
  });

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost({ variables: { id: postId } });
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  const posts = data?.posts || [];

  return (
    <div className="post-list">
      {posts.length === 0 ? (
        <div className="empty-state">No posts found</div>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div>
                <h3>{post.title}</h3>
                <p className="post-author">
                  by {post.user.name} (@{post.user.username})
                </p>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(post.id)}
                aria-label="Delete post"
              >
                ×
              </button>
            </div>
            <p className="post-content">{post.content}</p>
            <div className="post-footer">
              <span className="post-date">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PostList;
