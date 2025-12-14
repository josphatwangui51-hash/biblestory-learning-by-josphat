import React from 'react';
import { PenTool, X, Trash2, Save, Calendar } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';

export const NotesWidget: React.FC = () => {
  const { notes, addNote, deleteNote, isOpen, toggleOpen, draft, setDraft } = useNotes();

  const handleSave = () => {
    if (draft.trim()) {
      addNote(draft, 'User Note');
      setDraft('');
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={toggleOpen}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? 'bg-stone-800 text-white rotate-45' : 'bg-orange-500 text-white hover:bg-orange-600 hover:scale-110'
        }`}
        aria-label="Open Notes"
      >
        {isOpen ? <X className="w-6 h-6" /> : <PenTool className="w-6 h-6" />}
      </button>

      {/* Widget Panel */}
      <div
        className={`fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-stone-200 z-40 transform transition-all duration-300 origin-bottom-right flex flex-col max-h-[70vh] ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none translate-y-8'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-stone-100 bg-stone-50 rounded-t-2xl flex justify-between items-center">
          <h3 className="font-display text-stone-800 font-bold">My Reflections</h3>
          <span className="text-xs text-stone-500 font-sans">{notes.length} notes</span>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
          {notes.length === 0 ? (
            <div className="text-center py-8 text-stone-400">
              <PenTool className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No notes yet. Capture your thoughts!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="bg-white p-4 rounded-xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                    {note.source || 'Note'}
                  </span>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-serif">{note.content}</p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-stone-400">
                  <Calendar className="w-3 h-3" />
                  {formatDate(note.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-stone-100 rounded-b-2xl">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Write a personal note..."
            className="w-full bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none h-24 mb-2"
          />
          <button
            onClick={handleSave}
            disabled={!draft.trim()}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Note
          </button>
        </div>
      </div>
    </>
  );
};