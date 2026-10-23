import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { NoteCreator } from './components/NoteCreator';
import { NotesList } from './components/NotesList';
import { Toast } from './components/Toast';
import './App.css';

export function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [notesError, setNotesError] = useState(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Toast notification state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: '', type: 'success' });
  };

  // Handle logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setNotes([]);
    showToast('You have been logged out.', 'info');
  }, []);

  // Fetch all user notes
  const fetchNotes = useCallback(async () => {
    if (!token) return;
    setLoadingNotes(true);
    setNotesError(null);
    try {
      const data = await api.notes.getAll();
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch notes error:', err);
      setNotesError(err.message || 'Unable to fetch your notes.');
    } finally {
      setLoadingNotes(false);
    }
  }, [token]);

  // Check backend health & database status
  const checkHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      if (res && res.database) {
        setDbStatus(res.database);
      }
    } catch {
      // ignore in UI
    }
  }, []);

  // Initial load effect
  useEffect(() => {
    checkHealth();
    if (token) {
      fetchNotes();
    }

    const handleAuthExpired = () => {
      handleLogout();
      showToast('Session expired. Please log in again.', 'error');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, [token, fetchNotes, checkHealth, handleLogout]);

  // Handle successful login or register
  const handleAuthSuccess = (userData, successMessage) => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    setUser(userData);
    showToast(successMessage || 'Signed in successfully!', 'success');
  };

  // Handle create new note
  const handleCreateNote = async ({ title, content }) => {
    setIsSubmittingNote(true);
    try {
      const newNote = await api.notes.create({ title, content });
      setNotes((prevNotes) => [newNote, ...prevNotes]);
      showToast('Note created successfully!', 'success');
      return true;
    } catch (err) {
      console.error('Create note error:', err);
      showToast(err.message || 'Failed to create note.', 'error');
      return false;
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Handle delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await api.notes.delete(noteId);
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      showToast('Note deleted successfully.', 'success');
    } catch (err) {
      console.error('Delete note error:', err);
      showToast(err.message || 'Failed to delete note.', 'error');
    }
  };

  return (
    <div className="app-container">
      {/* Toast feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={closeToast}
      />

      {!token ? (
        // View 1: Authentication Screen
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      ) : (
        // View 2: Dashboard Screen
        <div className="dashboard-layout animate-fade-in">
          <Navbar
            user={user}
            onLogout={handleLogout}
            dbStatus={dbStatus}
          />

          <main className="dashboard-main">
            <div className="dashboard-content-wrapper">
              {/* Note Creator Form */}
              <NoteCreator
                onNoteCreated={handleCreateNote}
                isSubmitting={isSubmittingNote}
              />

              {/* Notes List with 4 States */}
              <NotesList
                notes={notes}
                loading={loadingNotes}
                error={notesError}
                onDeleteNote={handleDeleteNote}
                onRetry={fetchNotes}
              />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
