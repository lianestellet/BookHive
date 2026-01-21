import React, { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { usePosts } from '../hooks';
import type { Post, UpdatePostInput } from '../types';
import './PostList.css';

interface PostListProps {
  userId?: string | null;
}

const PostList: React.FC<PostListProps> = ({ userId }) => {
  const { posts, loading, error, updatePost, deletePost } = usePosts({ userId });
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort posts by newest first
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts]);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
  };

  const handleCloseModal = () => {
    setSelectedPost(null);
  };

  const handleUpdate = async (input: UpdatePostInput) => {
    if (!selectedPost) return;
    
    try {
      const updatedPost = await updatePost(selectedPost.id, input);
      if (updatedPost) {
        setSelectedPost(updatedPost);
        toast.success('Post updated successfully!');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update post';
      toast.error(message);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!selectedPost) return;
    
    setIsDeleting(true);
    try {
      await deletePost(selectedPost.id);
      setSelectedPost(null);
      toast.success('Post deleted successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete post';
      toast.error(message);
    } finally {
      setIsDeleting(false);
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
          <div 
            key={post.id} 
            className="post-card"
            onClick={() => handlePostClick(post)}
          >
            <div className="post-header">
              <div>
                <h3>{post.title}</h3>
                <p className="post-author">
                  by {post.user?.name} (@{post.user?.username})
                </p>
              </div>
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

      {selectedPost && (
        <PostModal
          post={selectedPost}
          isDeleting={isDeleting}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

interface PostModalProps {
  post: Post;
  isDeleting: boolean;
  onClose: () => void;
  onUpdate: (input: UpdatePostInput) => Promise<void>;
  onDelete: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, isDeleting, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    
    setIsSaving(true);
    try {
      await onUpdate({ title: title.trim(), content: content.trim() });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving post:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setTitle(post.title);
    setContent(post.content);
    setIsEditing(false);
  };

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal" onClick={(e) => e.stopPropagation()}>
        <button className="post-modal-close" onClick={onClose}>×</button>
        
        <div className="post-modal-header">
          <span className="post-modal-icon">📖</span>
          {isEditing ? (
            <input
              type="text"
              className="post-modal-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Post title..."
            />
          ) : (
            <h2>{post.title}</h2>
          )}
        </div>

        <div className="post-modal-meta">
          <span className="post-modal-author">
            by {post.user?.name} (@{post.user?.username})
          </span>
          <span className="post-modal-date">
            {new Date(post.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        {isEditing ? (
          <div className="post-modal-edit-content">
            <textarea
              className="post-modal-content-input"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Post content..."
              rows={6}
            />
          </div>
        ) : (
          <div className="post-modal-content">
            {post.content}
          </div>
        )}

        {isEditing ? (
          <div className="post-modal-edit-actions">
            <button 
              className="cancel-btn" 
              onClick={handleCancelEdit}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={isSaving || !title.trim() || !content.trim()}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : showDeleteConfirm ? (
          <div className="post-modal-confirm-delete">
            <p>Are you sure you want to delete this post?</p>
            <div className="post-modal-confirm-actions">
              <button 
                className="cancel-btn" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-btn" 
                onClick={onDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div className="post-modal-actions">
            <button className="post-modal-edit-btn" onClick={() => setIsEditing(true)}>
              ✏️ Edit Post
            </button>
            <button className="post-modal-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
              🗑️ Delete Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostList;
