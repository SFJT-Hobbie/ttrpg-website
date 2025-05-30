import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { format } from 'date-fns';
import { Edit2, Trash2, X } from 'lucide-react';

function Journal() {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [characterId, setCharacterId] = useState('');
  const [characters, setCharacters] = useState([]);
  const [journals, setJournals] = useState([]);
  const [editingJournalId, setEditingJournalId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize QuillJS editor with custom styling
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
      });

      // Update content state on editor change
      quillRef.current.on('text-change', () => {
        setContent(quillRef.current.root.innerHTML);
      });

      // Customize Quill editor appearance
      const editor = editorRef.current.querySelector('.ql-editor');
      const toolbar = editorRef.current.previousSibling;
      if (editor) {
        editor.style.backgroundColor = 'var(--darkfantasy-primary)';
        editor.style.color = 'var(--darkfantasy-neutral)';
        editor.style.border = 'var(--border-darkfantasy)';
        editor.style.borderRadius = '4px';
        editor.style.padding = '12px';
        editor.style.minHeight = '200px';
        editor.style.fontFamily = 'var(--font-darkfantasy)';
      }
      if (toolbar) {
        toolbar.style.backgroundColor = 'var(--darkfantasy-tertiary)';
        toolbar.style.border = 'var(--border-darkfantasy)';
        toolbar.style.borderRadius = '4px 4px 0 0';
        toolbar.style.borderBottom = 'none';
      }
    }

    // Cleanup
    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, []);

  // Update editor content when editing
  useEffect(() => {
    if (quillRef.current && content !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = content;
    }
  }, [content]);

  // Fetch characters and journals
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch characters
        const { data: charData, error: charError } = await supabase
          .from('characters')
          .select('id, name')
          .eq('user_id', user.id)
          .order('name');
        if (charError) throw charError;
        setCharacters(charData || []);

        // Fetch journals
        const { data: journalData, error: journalError } = await supabase
          .from('journals')
          .select('*, characters(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (journalError) throw journalError;
        setJournals(journalData || []);
      } catch (err) {
        setError('Failed to load data: ' + err.message);
        console.error(err);
      }
    };

    fetchData();
  }, [user]);

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('A title must be inscribed.');
      return;
    }
    if (!quillRef.current.getText().trim()) {
      setError('Content must be woven into the chronicle.');
      return;
    }

    try {
      setError(null);
      if (editingJournalId) {
        // Update existing journal
        const { error } = await supabase
          .from('journals')
          .update({
            title,
            content,
            character_id: characterId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingJournalId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        // Create new journal
        const { error } = await supabase
          .from('journals')
          .insert({
            user_id: user.id,
            title,
            content,
            character_id: characterId || null,
          });
        if (error) throw error;
      }

      // Refresh journals
      const { data, error: fetchError } = await supabase
        .from('journals')
        .select('*, characters(name)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setJournals(data || []);

      // Reset form
      setContent('');
      setTitle('');
      setCharacterId('');
      setEditingJournalId(null);
    } catch (err) {
      setError('Failed to inscribe chronicle: ' + err.message);
      console.error(err);
    }
  };

  // Handle edit journal
  const handleEdit = (journal) => {
    setTitle(journal.title || '');
    setContent(journal.content || '');
    setCharacterId(journal.character_id || '');
    setEditingJournalId(journal.id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete journal
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('journals')
        .delete()
        .eq('id', journalToDelete.id)
        .eq('user_id', user.id);
      if (error) throw error;
      setJournals(journals.filter(j => j.id !== journalToDelete.id));
      setDeleteDialogOpen(false);
      setJournalToDelete(null);
    } catch (err) {
      setError('Failed to obliterate chronicle: ' + err.message);
      console.error(err);
    }
  };

  // Search and filter journals
  const filteredJournals = journals.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.characters?.name?.toLowerCase().includes(search.toLowerCase())
  );

  // Organize filtered journals by character
  const groupedJournals = characters.reduce((acc, char) => {
    acc[char.id] = filteredJournals.filter(j => j.character_id === char.id);
    return acc;
  }, {});
  const unlinkedJournals = filteredJournals.filter(j => !j.character_id);

  return (
    <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
      {/* Subtle background overlay for texture */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto">
        <h1 className="font-darkfantasy-heading text-4xl font-semibold text-darkfantasy-accent mb-8 tracking-tight">
          Chronicles of the Realm
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-6 text-center font-darkfantasy animate-pulse-darkfantasy">
            {error}
          </p>
        )}

        {/* WYSIWYG Editor Form */}
        <form onSubmit={handleSubmit} className="mb-12 bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg p-6 shadow-darkfantasy texture-darkfantasy">
          <div className="mb-6">
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Entry Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Inscribe the title of your chronicle..."
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              required
              aria-label="Journal entry title"
            />
          </div>
          <div className="mb-6">
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Content
            </label>
            <div ref={editorRef} className="rounded shadow-darkfantasy" />
          </div>
          <div className="mb-6">
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Bound to Character
            </label>
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              aria-label="Select character"
            >
              <option value="">No Character</option>
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
              aria-label={editingJournalId ? 'Update chronicle' : 'Inscribe chronicle'}
            >
              {editingJournalId ? 'Update Chronicle' : 'Inscribe Chronicle'}
            </button>
            {editingJournalId && (
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setTitle('');
                  setCharacterId('');
                  setEditingJournalId(null);
                  setError(null);
                }}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Cancel edit"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Search Input */}
        <div className="mb-8 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Seek within your chronicles..."
            className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
            aria-label="Search chronicles"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-darkfantasy-neutral hover:text-darkfantasy-highlight transition-all duration-300"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Journal Sections */}
        <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-accent mb-6 tracking-tight">
          Your Chronicles
        </h2>
        <div className="space-y-8">
          {/* Character-Indexed Sections */}
          {characters.map((char) => (
            groupedJournals[char.id]?.length > 0 && (
              <div key={char.id}>
                <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight mb-4">
                  Tales of {char.name}
                </h3>
                <div className="space-y-4">
                  {groupedJournals[char.id].map((entry) => (
                    <JournalEntry
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEdit}
                      onDelete={(entry) => {
                        setJournalToDelete(entry);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
          {/* Unlinked Journals Section */}
          {unlinkedJournals.length > 0 && (
            <div>
              <h3 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight mb-4">
                Unbound Chronicles
              </h3>
              <div className="space-y-4">
                {unlinkedJournals.map((entry) => (
                  <JournalEntry
                    key={entry.id}
                    entry={entry}
                    onEdit={handleEdit}
                    onDelete={(entry) => {
                      setJournalToDelete(entry);
                      setDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {filteredJournals.length === 0 && (
            <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg">
              No chronicles found in the abyss.
            </p>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-darkfantasy-shadow flex items-center justify-center z-50">
            <div className="bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg p-6 max-w-sm w-full text-center shadow-darkfantasy texture-darkfantasy">
              <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-accent mb-4">
                Erase Chronicle
              </h2>
              <p className="text-darkfantasy-neutral mb-6 font-darkfantasy">
                Are you certain you wish to obliterate "{journalToDelete.title}" from existence?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                  aria-label="Cancel deletion"
                >
                  Spare
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-red-800 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                  aria-label="Confirm deletion"
                >
                  Obliterate
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JournalEntry({ entry, onEdit, onDelete }) {
  // Truncate HTML content for preview
  const truncateHtml = (html, maxLength = 200) => {
    const text = html.replace(/<[^>]+>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="p-6 bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg shadow-darkfantasy hover:shadow-darkfantasy-glow transition-all duration-300 texture-darkfantasy">
      <h4 className="font-darkfantasy-heading text-lg text-darkfantasy-highlight mb-2">
        {entry.title}
      </h4>
      <div className="text-darkfantasy-neutral prose prose-sm max-w-none font-darkfantasy mb-4">
        {truncateHtml(entry.content)}
      </div>
      <p className="text-sm text-darkfantasy-neutral mb-1 font-darkfantasy">
        Bound to: {entry.characters?.name || 'None'}
      </p>
      <p className="text-sm text-darkfantasy-neutral font-darkfantasy">
        Inscribed: {format(new Date(entry.created_at), 'MMMM d, yyyy')}
      </p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => onEdit(entry)}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Edit journal entry"
        >
          <Edit2 className="w-5 h-5 mr-2" />
          Edit
        </button>
        <button
          onClick={() => onDelete(entry)}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border-darkfantasy hover:bg-red-800 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
          aria-label="Delete journal entry"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default Journal;