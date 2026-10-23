import React, { useState } from 'react';
import { IconPlus, IconSpinner } from './Icons';

export const NoteCreator = ({ onNoteCreated, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setLocalError('Please provide a title for your note.');
      return;
    }
    if (!content.trim()) {
      setLocalError('Please write some content for your note.');
      return;
    }

    setLocalError('');
    const success = await onNoteCreated({
      title: title.trim(),
      content: content.trim(),
    });

    if (success) {
      setTitle('');
      setContent('');
    }
  };

  const handleKeyDown = (e) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className="note-creator-card glass-panel animate-fade-in">
      <div className="creator-header">
        <h2 className="creator-title">
          <span className="creator-title-highlight">Create</span> New Note
        </h2>
        <span className="creator-hint">Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to save</span>
      </div>

      {localError && (
        <div className="creator-error-inline">
          <span>{localError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="creator-form">
        <div className="creator-field">
          <input
            id="note-title-input"
            type="text"
            className="creator-title-input"
            placeholder="Note title (e.g. Project Roadmap, Brainstorming, Todo List)..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (localError) setLocalError('');
            }}
            maxLength={120}
            disabled={isSubmitting}
          />
        </div>

        <div className="creator-field">
          <textarea
            id="note-content-input"
            className="creator-content-textarea"
            placeholder="Write your note content, thoughts, or markdown-formatted checklist here..."
            rows={4}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (localError) setLocalError('');
            }}
            onKeyDown={handleKeyDown}
            disabled={isSubmitting}
          />
        </div>

        <div className="creator-footer">
          <div className="creator-meta">
            <span className="char-count">{content.length} characters</span>
          </div>

          <button
            type="submit"
            id="submit-note-btn"
            className="btn-primary creator-submit-btn"
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? (
              <span className="btn-content-loading">
                <IconSpinner size={16} />
                <span>Saving Note...</span>
              </span>
            ) : (
              <span className="btn-content-icon">
                <IconPlus size={18} />
                <span>Create Note</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
