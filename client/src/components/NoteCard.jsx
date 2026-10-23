import React, { useState } from 'react';
import { IconTrash, IconCalendar, IconSpinner } from './Icons';

export const NoteCard = ({ note, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Format date cleanly
  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }).format(date);
    } catch {
      return 'Recently';
    }
  };

  const handleDeleteClick = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    await onDelete(note._id);
  };

  const handleCancelConfirm = () => {
    setConfirmDelete(false);
  };

  return (
    <article className="note-card glass-panel animate-fade-in" id={`note-card-${note._id}`}>
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title}</h3>
        <div className="note-card-actions">
          {confirmDelete ? (
            <div className="confirm-delete-box animate-scale-up">
              <span className="confirm-text">Delete?</span>
              <button
                className="btn-confirm-yes"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                title="Confirm delete note"
                id={`confirm-delete-${note._id}`}
              >
                {isDeleting ? <IconSpinner size={14} /> : 'Yes'}
              </button>
              <button
                className="btn-confirm-no"
                onClick={handleCancelConfirm}
                disabled={isDeleting}
                title="Cancel deletion"
              >
                No
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeleteClick}
              className="btn-note-delete"
              title="Delete note"
              aria-label={`Delete note: ${note.title}`}
              id={`delete-note-${note._id}`}
            >
              <IconTrash size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="note-card-body">
        <p className="note-card-content">{note.content}</p>
      </div>

      <div className="note-card-footer">
        <div className="note-card-date">
          <IconCalendar size={14} className="calendar-icon" />
          <span>{formatDate(note.createdAt)}</span>
        </div>
      </div>
    </article>
  );
};
