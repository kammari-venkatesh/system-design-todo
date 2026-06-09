import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RichTextEditor from './RichTextEditor';

export default function CollapsibleSection({ title, hint, content, onChange, onUpload }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="note-collapsible">
      <button type="button" className="note-collapsible-header" onClick={() => setOpen((o) => !o)}>
        <span className="note-collapsible-chevron">{open ? '▾' : '▸'}</span>
        <span>
          <strong>{title}</strong>
          {hint && <span className="note-collapsible-hint">{hint}</span>}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="note-collapsible-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <RichTextEditor content={content} onChange={onChange} placeholder={hint} onUpload={onUpload} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
