import { formatDistanceToNow } from 'date-fns';
import { getNotePreview, journalGroupLabel } from '../../utils/notesHelpers';

export default function NotesList({ notes, activeNoteId, viewMode, onSelect, onTogglePin, onToggleFavorite, showJournal }) {
  if (!notes.length) {
    return <div className="notes-list-empty">No notes yet. Select a study day to start writing.</div>;
  }

  let grouped = [{ label: null, items: notes }];
  if (showJournal) {
    const map = new Map();
    notes.forEach((note) => {
      const label = journalGroupLabel(note.updatedAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(note);
    });
    grouped = [...map.entries()].map(([label, items]) => ({ label, items }));
  }

  return (
    <div className={`notes-list notes-list--${viewMode}`}>
      {grouped.map(({ label, items }) => (
        <div key={label || 'all'} className="notes-list-group">
          {label && <div className="notes-journal-label">{label}</div>}
          {items.map((note) => (
            <button
              key={note.id}
              type="button"
              className={`note-card ${activeNoteId === note.id ? 'active' : ''} ${note.pinned ? 'pinned' : ''}`}
              onClick={() => onSelect(note.id)}
            >
              <div className="note-card-top">
                <strong className="note-card-title">{note.title || note.topic}</strong>
                <span className="note-card-actions">
                  <span
                    role="button"
                    tabIndex={0}
                    className={`note-icon ${note.pinned ? 'on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onTogglePin(note.id))}
                  >
                    📌
                  </span>
                  <span
                    role="button"
                    tabIndex={0}
                    className={`note-icon ${note.favorite ? 'on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(note.id); }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.stopPropagation(), onToggleFavorite(note.id))}
                  >
                    ★
                  </span>
                </span>
              </div>
              <p className="note-card-preview">{getNotePreview(note) || 'No content yet'}</p>
              <div className="note-card-meta">
                <span>{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
                {note.week && <span>Week {note.week}</span>}
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
