import React, { useMemo } from 'react';
import { usePosts } from '../hooks';
import type { Post } from '../types';
import './PostList.css';

interface PostListProps {
  userId?: string | null;
}

const PostList: React.FC<PostListProps> = ({ userId }) => {
  const { posts, loading, error, deletePost } = usePosts({ userId });

  // Sort posts by newest first
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts]);

  const handleDelete = async (postId: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (error) return <div className="error">Error: {error.message}</div>;

  return (
    <div className="post-list">
      {sortedPosts.length === 0 ? (
        <div className="empty-state">No posts found</div>
      ) : (
        sortedPosts.map((post: Post) => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div>
                <h3>{post.title}</h3>
                <p className="post-author">
                  by {post.user?.name} (@{post.user?.username})
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
