import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Note } from '../types';

interface NotesContextType {
  notes: Note[];
  addNote: (content: string, source?: string) => void;
  deleteNote: (id: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
  openWithDraft: (draft: string) => void;
  draft: string;
  setDraft: (text: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('moses-notes');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse notes", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('moses-notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = (content: string, source?: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      source,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setIsOpen(true);
    // Clear draft if it matches content (simple heuristic)
    if (draft === content) setDraft('');
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const openWithDraft = (text: string) => {
    setDraft(text);
    setIsOpen(true);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote, deleteNote, isOpen, toggleOpen, openWithDraft, draft, setDraft }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};