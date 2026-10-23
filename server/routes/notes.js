const express = require('express');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Fallback in-memory notes storage if MongoDB is not connected
const inMemoryNotes = [];

// Apply authentication middleware to all note routes
router.use(authMiddleware);

// @route   GET /api/notes
// @desc    Get all notes belonging to the authenticated user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const notes = await Note.find({ userId: req.user.id }).sort({ createdAt: -1 });
      return res.status(200).json(notes);
    } else {
      const userNotes = inMemoryNotes
        .filter((n) => n.userId.toString() === req.user.id.toString())
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(userNotes);
    }
  } catch (error) {
    console.error('Error fetching notes:', error);
    return res.status(500).json({ message: 'Server error while fetching notes.', error: error.message });
  }
});

// @route   POST /api/notes
// @desc    Create a new note linked to authenticated user
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const newNote = await Note.create({
        userId: req.user.id,
        title: title.trim(),
        content: content.trim(),
      });
      return res.status(201).json(newNote);
    } else {
      const newNote = {
        _id: new mongoose.Types.ObjectId().toString(),
        userId: req.user.id.toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      inMemoryNotes.unshift(newNote);
      return res.status(201).json(newNote);
    }
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({ message: 'Server error while creating note.', error: error.message });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note only if owned by req.user.id
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id) && typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid note ID format.' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const note = await Note.findById(id);

      if (!note) {
        return res.status(404).json({ message: 'Note not found.' });
      }

      // Check ownership
      if (note.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Forbidden. You do not have permission to delete this note.' });
      }

      await Note.findByIdAndDelete(id);

      return res.status(200).json({
        message: 'Note deleted successfully.',
        id,
      });
    } else {
      const noteIndex = inMemoryNotes.findIndex((n) => n._id.toString() === id.toString());

      if (noteIndex === -1) {
        return res.status(404).json({ message: 'Note not found.' });
      }

      const note = inMemoryNotes[noteIndex];

      if (note.userId.toString() !== req.user.id.toString()) {
        return res.status(403).json({ message: 'Forbidden. You do not have permission to delete this note.' });
      }

      inMemoryNotes.splice(noteIndex, 1);

      return res.status(200).json({
        message: 'Note deleted successfully.',
        id,
      });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({ message: 'Server error while deleting note.', error: error.message });
  }
});

module.exports = router;
