export const DAILY_SECTIONS = [
  { key: 'keyConcepts', label: 'Key Concepts', hint: 'Things learned today.' },
  { key: 'importantPoints', label: 'Important Points', hint: 'Short summary.' },
  { key: 'doubts', label: 'Doubts', hint: 'Topics requiring revision.' },
  { key: 'interviewQuestions', label: 'Interview Questions', hint: 'Questions discovered during study.' },
  { key: 'examples', label: 'Examples', hint: 'Code snippets and diagrams.' },
  { key: 'revisionNotes', label: 'Revision Notes', hint: 'Quick review notes.' },
  { key: 'personalThoughts', label: 'Personal Thoughts', hint: 'Observations and learning experiences.' },
];

export const NOTE_CATEGORIES = [
  { id: 'recent', label: 'Recent Notes' },
  { id: 'favorites', label: 'Favorites' },
  { id: 'pinned', label: 'Pinned' },
  { id: 'daily', label: 'Daily Notes' },
  { id: 'topic', label: 'Topic Notes' },
  { id: 'revision', label: 'Revision Notes' },
];

export function dailyNoteId(dayNum) {
  return `day-${dayNum}`;
}

export function emptyTipTapDoc() {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

export function textToTipTapDoc(text) {
  if (!text?.trim()) return emptyTipTapDoc();
  return {
    type: 'doc',
    content: text.split('\n').filter(Boolean).map((line) => ({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    })),
  };
}

export function tipTapDocToPlainText(doc) {
  if (!doc?.content) return '';
  const walk = (nodes) =>
    nodes
      .map((node) => {
        if (node.type === 'text') return node.text || '';
        if (node.content) return walk(node.content);
        return '';
      })
      .join('\n');
  return walk(doc.content).trim();
}

export function extractTagsFromText(text) {
  const matches = text.match(/#([A-Za-z][A-Za-z0-9_]*)/g) || [];
  return [...new Set(matches.map((t) => t.slice(1)))];
}

export function getNotePreview(note) {
  const parts = [];
  if (note.summary?.trim()) parts.push(note.summary.trim());
  DAILY_SECTIONS.forEach(({ key }) => {
    const t = tipTapDocToPlainText(note.sections?.[key]);
    if (t) parts.push(t);
  });
  const body = tipTapDocToPlainText(note.body);
  if (body) parts.push(body);
  const text = parts.join(' ').replace(/\s+/g, ' ').trim();
  return text.slice(0, 120) + (text.length > 120 ? '…' : '');
}

export function filterNotesByCategory(notes, categoryId) {
  const list = Object.values(notes || {});
  switch (categoryId) {
    case 'favorites':
      return list.filter((n) => n.favorite);
    case 'pinned':
      return list.filter((n) => n.pinned);
    case 'daily':
      return list.filter((n) => n.type === 'daily');
    case 'topic':
      return list.filter((n) => n.type === 'topic' || n.type === 'week');
    case 'revision':
      return list.filter((n) => n.type === 'revision' || n.tags?.includes('revision'));
    default:
      return [...list].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
}

export function searchNotes(notes, query) {
  const q = query.toLowerCase().trim();
  if (!q) return Object.values(notes || {});
  return Object.values(notes || {}).filter((note) => {
    const haystack = [
      note.title,
      note.topic,
      note.summary,
      note.tags?.join(' '),
      `week ${note.week}`,
      `phase ${note.phase}`,
      getNotePreview(note),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function sortNotesForDisplay(notes, categoryId) {
  const filtered = categoryId === 'recent'
    ? filterNotesByCategory(notes, 'recent')
    : filterNotesByCategory(notes, categoryId);
  return filtered.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
}

export function findRelatedNotes(notes, activeNote, limit = 3) {
  if (!activeNote) return [];
  const others = Object.values(notes || {}).filter((n) => n.id !== activeNote.id);
  const activeTags = new Set(activeNote.tags || []);
  const activeWords = new Set(
    (activeNote.topic || activeNote.title || '')
      .toLowerCase()
      .split(/\W+/)
      .filter((w) => w.length > 3)
  );

  return others
    .map((note) => {
      let score = 0;
      (note.tags || []).forEach((t) => { if (activeTags.has(t)) score += 3; });
      if (note.week === activeNote.week) score += 2;
      if (note.phase === activeNote.phase) score += 1;
      const words = (note.topic || note.title || '').toLowerCase().split(/\W+/);
      words.forEach((w) => { if (activeWords.has(w)) score += 1; });
      return { note, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ note }) => note);
}

export function buildDailyNoteTemplate(day) {
  const now = new Date().toISOString();
  const sections = {};
  DAILY_SECTIONS.forEach(({ key }) => {
    sections[key] = emptyTipTapDoc();
  });
  return {
    id: dailyNoteId(day._n),
    type: 'daily',
    dayNum: day._n,
    week: day.week,
    phase: day.phase,
    topic: day.topic,
    title: `Day ${day._n} · ${day.topic}`,
    summary: '',
    pinned: false,
    favorite: false,
    tags: [],
    relatedNoteIds: [],
    sections,
    body: emptyTipTapDoc(),
    attachments: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function migrateDayNotesToKnowledge(dayNotes, allDays) {
  const result = {};
  Object.entries(dayNotes || {}).forEach(([dayNumStr, legacy]) => {
    const dayNum = Number(dayNumStr);
    const day = allDays?.find((d) => d._n === dayNum);
    if (!day) return;
    const hasContent = legacy.learned || legacy.takeaways || legacy.doubts || legacy.revision;
    if (!hasContent) return;
    const note = buildDailyNoteTemplate(day);
    note.sections.keyConcepts = textToTipTapDoc(legacy.learned || '');
    note.sections.importantPoints = textToTipTapDoc(legacy.takeaways || '');
    note.sections.doubts = textToTipTapDoc(legacy.doubts || '');
    note.sections.revisionNotes = textToTipTapDoc(legacy.revision || '');
    note.updatedAt = legacy.updatedAt || note.updatedAt;
    result[note.id] = note;
  });
  return result;
}

export function journalGroupLabel(updatedAt) {
  const now = new Date();
  const d = new Date(updatedAt);
  const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
