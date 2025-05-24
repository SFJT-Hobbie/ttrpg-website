/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { format } from 'date-fns';
import sanitizeHtml from 'sanitize-html';
import debounce from 'lodash/debounce';

function Rules() {
  const { user, isAdmin } = useAuth();
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState('');
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState(null);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Initialize QuillJS for admin
  useEffect(() => {
    if (isAdmin && editorRef.current && !quillRef.current) {
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
        placeholder: 'Write the rule...',
      });

      quillRef.current.on('text-change', () => {
        setContent(quillRef.current.root.innerHTML);
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, [isAdmin]);

  // Update editor content
  useEffect(() => {
    if (quillRef.current && content !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = content;
    }
  }, [content]);

  // Fetch rules
  useEffect(() => {
    async function fetchRules() {
      setLoading(true);
      try {
        let query = supabase.from('rules').select('*').order('order_index');
        if (search) {
          query = query.textSearch('search_vector', search, { type: 'websearch' });
        }
        const { data, error } = await query;
        if (error) {
          throw new Error(error.message.includes('permission') ? 'Access denied' : error.message);
        }
        setRules(data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load rules: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRules();
  }, [search]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!quillRef.current?.getText().trim()) {
      setError('Content is required.');
      return;
    }

    try {
      setError(null);
      const contentJson = { sections: [{ type: 'text', html: content }] };
      if (editingRuleId) {
        const { error } = await supabase
          .from('rules')
          .update({
            title,
            content_json: contentJson,
            parent_id: parentId || null,
            order_index: rules.find(r => r.id === editingRuleId)?.order_index || 0,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingRuleId);
        if (error) {
          throw new Error(error.message.includes('permission') ? 'Unauthorized update' : error.message);
        }
      } else {
        const { error } = await supabase
          .from('rules')
          .insert({
            title,
            content_json: contentJson,
            parent_id: parentId || null,
            order_index: rules.length,
          });
        if (error) {
          throw new Error(error.message.includes('permission') ? 'Unauthorized insert' : error.message);
        }
      }

      // Refresh rules
      const { data, error: fetchError } = await supabase
        .from('rules')
        .select('*')
        .order('order_index');
      if (fetchError) throw fetchError;
      setRules(data || []);
      setTitle('');
      setContent('');
      setParentId('');
      setEditingRuleId(null);
    } catch (err) {
      setError('Failed to save rule: ' + err.message);
      console.error(err);
    }
  };

  // Handle edit rule
  const handleEdit = (rule) => {
    setTitle(rule.title);
    setContent(rule.content_json.sections[0]?.html || '');
    setParentId(rule.parent_id || '');
    setEditingRuleId(rule.id);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete rule
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleToDelete.id);
      if (error) {
        throw new Error(error.message.includes('permission') ? 'Unauthorized deletion' : error.message);
      }
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
      setError(null);
    } catch (err) {
      setError('Failed to delete rule: ' + err.message);
      console.error(err);
    }
  };

  // Debounced search
  useEffect(() => {
    const debouncedSetSearch = debounce((value) => setSearch(value), 300);
    return () => debouncedSetSearch.cancel();
  }, []);

  // Build hierarchical index
  const renderIndex = useCallback(
    (parentId = null, depth = 0) => {
      return rules
        .filter(r => r.parent_id === parentId)
        .map(rule => (
          <li key={rule.id} className={`ml-${depth * 4}`}>
            <a href={`#rule-${rule.id}`} className="text-darkfantasy-highlight hover:underline">
              {rule.title}
            </a>
            <ul>{renderIndex(rule.id, depth + 1)}</ul>
          </li>
        ));
    },
    [rules]
  );

  return (
    <div className="min-h-screen bg-darkfantasy-primary p-8">
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar Index */}
        <div className="w-1/4 pr-8">
          <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
            Rule Index
          </h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search rules..."
              defaultValue={search}
              onChange={(e) => {
                const debouncedSetSearch = debounce((value) => setSearch(value), 300);
                debouncedSetSearch(e.target.value);
              }}
              className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy-highlight focus:outline-none"
              aria-label="Search rules"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-darkfantasy-neutral hover:text-darkfantasy-secondary"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {loading ? (
            <p className="text-darkfantasy-neutral">Loading...</p>
          ) : (
            <ul className="text-darkfantasy-neutral">{renderIndex()}</ul>
          )}
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral mb-6">
            Laws of the Realm
          </h1>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          {/* Admin Form */}
          {isAdmin && (
            <form onSubmit={handleSubmit} className="mb-8 bg-darkfantasy-tertiary border border-[#8a7b5e] rounded-lg p-6 shadow-lg">
              <div className="mb-4">
                <label htmlFor="rule-title" className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Rule Title
                </label>
                <input
                  id="rule-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title the rule..."
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-highlight focus:outline-none"
                  required
                  aria-label="Rule title"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="rule-content" className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Content
                </label>
                <div id="rule-content" ref={editorRef} className="bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-highlight" />
              </div>
              <div className="mb-4">
                <label htmlFor="parent-chapter" className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Parent Chapter
                </label>
                <select
                  id="parent-chapter"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-3 py-2 bg-darkfantasy-primary text-darkfantasy-neutral rounded border border-darkfantasy-highlight focus:outline-none"
                  aria-label="Parent chapter"
                >
                  <option value="">No Parent</option>
                  {rules.filter(r => !r.parent_id).map(rule => (
                    <option key={rule.id} value={rule.id}>
                      {rule.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#8a7b5e] font-darkfantasy"
                >
                  {editingRuleId ? 'Update Rule' : 'Add Rule'}
                </button>
                {editingRuleId && (
                  <button
                    type="button"
                    onClick={() => {
                      setTitle('');
                      setContent('');
                      setParentId('');
                      setEditingRuleId(null);
                      setError(null);
                    }}
                    className="bg-gray-600 text-darkfantasy-neutral py-2 px-6 rounded hover:bg-gray-700 font-darkfantasy"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Rules Content */}
          {loading ? (
            <p className="text-darkfantasy-neutral text-center">Loading rules...</p>
          ) : rules.length === 0 ? (
            <p className="text-darkfantasy-neutral text-center">No rules found.</p>
          ) : (
            rules.map(rule => (
              <div key={rule.id} id={`rule-${rule.id}`} className="mb-8">
                <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-2">
                  {rule.title}
                </h2>
                <div
                  className="prose prose-sm text-darkfantasy-neutral max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(rule.content_json.sections[0]?.html || '') }}
                />
                {isAdmin && (
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-4 rounded hover:bg-[#8a7b5e] font-darkfantasy"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setRuleToDelete(rule);
                        setDeleteDialogOpen(true);
                      }}
                      className="bg-[#661318] text-darkfantasy-neutral py-1 px-4 rounded hover:bg-red-800 font-darkfantasy"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-darkfantasy-tertiary border-2 border-[#8a7b5e] rounded-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-4">
              Erase Rule
            </h2>
            <p className="text-darkfantasy-neutral mb-6">
              Are you sure you wish to erase "{ruleToDelete.title}" and its subchapters from the annals?
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

export default Rules;