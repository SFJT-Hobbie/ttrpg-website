import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { format } from 'date-fns';

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

  // Initialize QuillJS editor
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
      setError('Title is required.');
      return;
    }
    if (!quillRef.current.getText().trim()) {
      setError('Content is required.');
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
      setError('Failed to save journal: ' + err.message);
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
      setError('Failed to delete journal: ' + err.message);
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
    <div className="min-h-screen bg-darkfantasy-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral mb-6">
          Chronicles of the Realm
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}

        {/* WYSIWYG Editor Form */}
        <form onSubmit={handleSubmit} className="mb-8 bg-darkfantasy-tertiary border border-[#8a7b5e] rounded-lg p-6 shadow-lg">
          <div className="mb-4">
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Entry Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your chronicle..."
              className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Content
            </label>
            <div ref={editorRef} className="bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy" />
          </div>
          <div className="mb-4">
            <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Bound to Character
            </label>
            <select
              value={characterId}
              onChange={(e) => setCharacterId(e.target.value)}
              className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
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
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#8a7b5e] font-darkfantasy"
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
                className="bg-gray-600 text-darkfantasy-neutral py-2 px-6 rounded hover:bg-gray-700 font-darkfantasy"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Search Input */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chronicles..."
            className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
          />
        </div>

        {/* Journal Sections */}
        <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-4">
          Your Chronicles
        </h2>
        <div className="space-y-8">
          {/* Character-Indexed Sections */}
          {characters.map((char) => (
            groupedJournals[char.id]?.length > 0 && (
              <div key={char.id}>
                <h3 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
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
              <h3 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
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
            <p className="text-darkfantasy-neutral text-center">
              No chronicles match your search.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-darkfantasy-tertiary border-2 border-[#8a7b5e] rounded-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-4">
              Erase Chronicle
            </h2>
            <p className="text-darkfantasy-neutral mb-6">
              Are you sure you wish to erase "{journalToDelete.title}" from history?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="bg-darkfantasy-primary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-gray-600 font-darkfantasy"
              >
                Spare
              </button>
              <button
                onClick={handleDelete}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-red-800 font-darkfantasy"
              >
                Obliterate
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="p-4 bg-darkfantasy-tertiary border border-[#8a7b5e] rounded-lg shadow-md">
      <h4 className="text-lg font-darkfantasy text-darkfantasy-neutral mb-2">
        {entry.title}
      </h4>
      <p className="text-darkfantasy-neutral prose prose-sm max-w-none">
        {truncateHtml(entry.content)}
      </p>
      <p className="text-sm text-darkfantasy-highlight mt-2">
        Bound to: {entry.characters?.name || 'None'}
      </p>
      <p className="text-sm text-darkfantasy-highlight">
        Inscribed: {format(new Date(entry.created_at), 'MMMM d, yyyy')}
      </p>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => onEdit(entry)}
          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-4 rounded hover:bg-[#8a7b5e] font-darkfantasy"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(entry)}
          className="bg-[#661318] text-darkfantasy-neutral py-1 px-4 rounded hover:bg-red-800 font-darkfantasy"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default Journal;