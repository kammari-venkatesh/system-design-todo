import { DAILY_SECTIONS } from '../../utils/notesHelpers';
import NoteSummaryCard from './NoteSummaryCard';
import CollapsibleSection from './CollapsibleSection';
import RelatedNotes from './RelatedNotes';
import SaveStatus from './SaveStatus';

export default function NotesEditor({
  note,
  saveStatus,
  lastSavedAt,
  relatedNotes,
  onUpdate,
  onUpload,
  onSelectNote,
}) {
  if (!note) {
    return (
      <div className="notes-editor notes-editor-empty">
        <p>Select a note from the sidebar or pick a day on the calendar.</p>
      </div>
    );
  }

  function patch(partial) {
    onUpdate({ ...note, ...partial, updatedAt: new Date().toISOString() });
  }

  function patchSection(key, content) {
    patch({ sections: { ...note.sections, [key]: content } });
  }

  return (
    <div className="notes-editor">
      <div className="notes-editor-header">
        <div>
          <h3>{note.title}</h3>
          {note.type === 'daily' && (
            <p className="subtitle">
              Day {note.dayNum} · {note.topic} · Week {note.week} · Phase {note.phase}
            </p>
          )}
        </div>
        <SaveStatus status={saveStatus} lastSavedAt={lastSavedAt} />
      </div>

      <NoteSummaryCard summary={note.summary} onChange={(summary) => patch({ summary })} />

      {note.tags?.length > 0 && (
        <div className="note-tags">
          {note.tags.map((tag) => (
            <span key={tag} className="note-tag">#{tag}</span>
          ))}
        </div>
      )}

      {note.type === 'daily' ? (
        <div className="notes-sections">
          {DAILY_SECTIONS.map(({ key, label, hint }) => (
            <CollapsibleSection
              key={key}
              title={label}
              hint={hint}
              content={note.sections?.[key]}
              onChange={(content) => patchSection(key, content)}
              onUpload={onUpload}
            />
          ))}
        </div>
      ) : (
        <CollapsibleSection
          title="Note"
          content={note.body}
          onChange={(body) => patch({ body })}
          onUpload={onUpload}
        />
      )}

      <RelatedNotes notes={relatedNotes} onSelect={onSelectNote} />
    </div>
  );
}
