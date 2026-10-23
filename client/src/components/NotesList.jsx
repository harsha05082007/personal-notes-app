import React, { useState } from 'react';
import { NoteCard } from './NoteCard';
import { IconEmpty, IconAlert } from './Icons';

export const NotesList = ({
  notes,
  loading,
  error,
  onDeleteNote,
  onRetry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter notes based on search query
  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      (note.title && note.title.toLowerCase().includes(query)) ||
      (note.content && note.content.toLowerCase().includes(query))
    );
  });

  return (
    <section className="notes-section">
      <div className="notes-section-header">
        <div className="section-title-wrapper">
          <h2 className="section-title">Your Notes</h2>
          <span className="notes-count-badge">
            {loading ? '...' : `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`}
          </span>
        </div>

        {notes.length > 0 && (
          <div className="notes-search-wrapper">
            <input
              type="text"
              className="notes-search-input"
              placeholder="Search in notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search notes"
            />
          </div>
        )}
      </div>

      {/* State 1: ERROR STATE */}
      {error && (
        <div className="state-error-card glass-panel animate-fade-in" role="alert">
          <div className="error-icon-box">
            <IconAlert size={28} />
          </div>
          <div className="error-text-content">
            <h4 className="error-heading">Failed to load notes</h4>
            <p className="error-description">{error}</p>
          </div>
          {onRetry && (
            <button onClick={onRetry} className="btn-retry">
              Try Again
            </button>
          )}
        </div>
      )}

      {/* State 2: LOADING STATE (Skeleton Cards) */}
      {loading && (
        <div className="notes-grid" aria-label="Loading notes">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="note-card-skeleton glass-panel">
              <div className="skeleton-title shimmer"></div>
              <div className="skeleton-line shimmer"></div>
              <div className="skeleton-line short shimmer"></div>
              <div className="skeleton-footer shimmer"></div>
            </div>
          ))}
        </div>
      )}

      {/* State 3: EMPTY LIST STATE */}
      {!loading && !error && notes.length === 0 && (
        <div className="state-empty-card glass-panel animate-fade-in">
          <div className="empty-icon-container">
            <IconEmpty size={60} className="empty-icon" />
          </div>
          <h3 className="empty-title">No notes found</h3>
          <p className="empty-description">
            Your note repository is currently empty. Use the creator form above to add your thoughts, checklists, or reminders!
          </p>
        </div>
      )}

      {/* Empty Search Results */}
      {!loading && !error && notes.length > 0 && filteredNotes.length === 0 && (
        <div className="state-empty-card glass-panel animate-fade-in">
          <h3 className="empty-title">No matching notes</h3>
          <p className="empty-description">
            No notes match your search "{searchQuery}". Try a different keyword or clear the search.
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="btn-clear-search"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* State 4: SUCCESS STATE (Populated Notes Grid) */}
      {!loading && !error && filteredNotes.length > 0 && (
        <div className="notes-grid">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onDelete={onDeleteNote}
            />
          ))}
        </div>
      )}
    </section>
  );
};
