import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_POST } from '../graphql/mutations';
import { GET_POSTS } from '../graphql/queries';
import './PostForm.css';

const PostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [userId, setUserId] = useState('1');
  const [error, setError] = useState<string | null>(null);

  const [createPost, { loading }] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }],
    onError: (err) => {
      setError(err.message);
    },
    onCompleted: () => {
      setTitle('');
      setContent('');
      setError(null);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      await createPost({
        variables: {
          input: {
            userId,
            title: title.trim(),
            content: content.trim(),
          },
        },
      });
    } catch (err) {
      // Error handled in onError
    }
  };

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <h3>Create New Post</h3>
      {error && <div className="error-message">{error}</div>}
      <div className="form-group">
        <label htmlFor="userId">User ID:</label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="title">Title:</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="content">Content:</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />
      </div>
      <button type="submit" disabled={loading} className="submit-button">
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </form>
  );
};

export default PostForm;
