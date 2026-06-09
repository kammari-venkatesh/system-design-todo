import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import {
  dailyNoteId,
  searchNotes,
  sortNotesForDisplay,
  findRelatedNotes,
  extractTagsFromText,
  tipTapDocToPlainText,
  DAILY_SECTIONS,
} from '../../utils/notesHelpers';
import NotesSidebar from './NotesSidebar';
import NotesEditor from './NotesEditor';

export default function KnowledgeNotesWorkspace({ selectedDayNum }) {
  const {
    progress,
    upsertNote,
    ensureDailyNote,
    toggleNotePin,
    toggleNoteFavorite,
    uploadNoteFile,
    notesSaveStatus,
    notesLastSavedAt,
  } = useProgress();

  const [expanded, setExpanded] = useState(() => localStorage.getItem('notes_expanded') !== 'false');
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [category, setCategory] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [activeTag, setActiveTag] = useState(null);

  const knowledgeNotes = progress.knowledgeNotes || {};

  useEffect(() => {
    if (selectedDayNum) {
      const id = dailyNoteId(selectedDayNum);
      ensureDailyNote(selectedDayNum);
      setActiveNoteId(id);
    }
  }, [selectedDayNum, ensureDailyNote]);

  useEffect(() => {
    localStorage.setItem('notes_expanded', String(expanded));
  }, [expanded]);

  const displayedNotes = useMemo(() => {
    let list = searchQuery.trim()
      ? searchNotes(knowledgeNotes, searchQuery)
      : sortNotesForDisplay(knowledgeNotes, category);
    if (activeTag) {
      list = list.filter((n) => n.tags?.includes(activeTag));
    }
    return list;
  }, [knowledgeNotes, searchQuery, category, activeTag]);

  const activeNote = activeNoteId ? knowledgeNotes[activeNoteId] : null;

  const relatedNotes = useMemo(
    () => findRelatedNotes(knowledgeNotes, activeNote),
    [knowledgeNotes, activeNote]
  );

  function handleUpdate(note) {
    const textParts = [note.summary || ''];
    if (note.type === 'daily') {
      DAILY_SECTIONS.forEach(({ key }) => {
        textParts.push(tipTapDocToPlainText(note.sections?.[key]));
      });
    } else {
      textParts.push(tipTapDocToPlainText(note.body));
    }
    const tags = extractTagsFromText(textParts.join(' '));
    upsertNote(note.id, { ...note, tags });
  }

  function toggleExpanded() {
    setExpanded((e) => !e);
  }

  return (
    <div className="dashboard-section notes-workspace-wrap" id="notes">
      <div className="notes-workspace-header">
        <div>
          <h2>Knowledge Notes</h2>
          <p className="subtitle">Your personal study knowledge base</p>
        </div>
        <button type="button" className="btn-secondary" onClick={toggleExpanded}>
          {expanded ? 'Collapse Notes' : 'Expand Notes'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            className="notes-workspace card"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="notes-workspace-grid">
              <NotesSidebar
                notes={displayedNotes}
                activeNoteId={activeNoteId}
                category={category}
                onCategoryChange={(c) => { setCategory(c); setActiveTag(null); }}
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onSelect={setActiveNoteId}
                onTogglePin={toggleNotePin}
                onToggleFavorite={toggleNoteFavorite}
              />
              <NotesEditor
                note={activeNote}
                saveStatus={notesSaveStatus}
                lastSavedAt={notesLastSavedAt}
                relatedNotes={relatedNotes}
                onUpdate={handleUpdate}
                onUpload={uploadNoteFile}
                onSelectNote={setActiveNoteId}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="notes-collapsed-bar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Notes collapsed — click Expand Notes to continue writing.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
