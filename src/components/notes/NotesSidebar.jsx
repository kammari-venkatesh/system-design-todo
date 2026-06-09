import { NOTE_CATEGORIES } from '../../utils/notesHelpers';
import NotesList from './NotesList';

export default function NotesSidebar({
  notes,
  activeNoteId,
  category,
  onCategoryChange,
  onSearch,
  searchQuery,
  viewMode,
  onViewModeChange,
  onSelect,
  onTogglePin,
  onToggleFavorite,
}) {
  return (
    <aside className="notes-sidebar">
      <input
        type="search"
        className="notes-search"
        placeholder="Search notes…"
        value={searchQuery}
        onChange={(e) => onSearch(e.target.value)}
      />

      <div className="notes-categories">
        {NOTE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`notes-category-btn ${category === cat.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="notes-view-toggle">
        {['list', 'grid', 'compact'].map((mode) => (
          <button
            key={mode}
            type="button"
            className={`notes-view-btn ${viewMode === mode ? 'active' : ''}`}
            onClick={() => onViewModeChange(mode)}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      <NotesList
        notes={notes}
        activeNoteId={activeNoteId}
        viewMode={viewMode}
        onSelect={onSelect}
        onTogglePin={onTogglePin}
        onToggleFavorite={onToggleFavorite}
        showJournal={category === 'recent' || category === 'daily'}
      />
    </aside>
  );
}
