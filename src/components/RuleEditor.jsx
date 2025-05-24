import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient.js';
import { useAuth } from '../AuthContext.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

function RuleEditor() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const editId = new URLSearchParams(location.search).get('edit');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [parentId, setParentId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Redirect non-admins
  useEffect(() => {
    if (!isAdmin) {
      navigate('/rules');
    }
  }, [isAdmin, navigate]);

  // Initialize QuillJS
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
        placeholder: 'Write the rule...',
      });

      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML;
        console.log('Quill text-change:', html);
        setContent(html);
      });
    }

    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, []);

  // Update editor content for editing
  useEffect(() => {
    if (quillRef.current && content && content !== quillRef.current.root.innerHTML) {
      console.log('Updating Quill content:', content);
      quillRef.current.root.innerHTML = content;
    }
  }, [content]);

  // Fetch chapters and rule (if editing)
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch chapters
        const { data: chapterData, error: chapterError } = await supabase
          .from('rules')
          .select('id, title')
          .is('parent_id', null)
          .order('order_index');
        if (chapterError) throw chapterError;
        setChapters(chapterData || []);

        // Fetch rule for editing
        if (editId) {
          const { data: ruleData, error: ruleError } = await supabase
            .from('rules')
            .select('*')
            .eq('id', editId)
            .single();
          if (ruleError) throw ruleError;
          if (ruleData) {
            setTitle(ruleData.title);
            const htmlContent = ruleData.content_json?.sections?.[0]?.html || '';
            console.log('Fetched rule content:', htmlContent);
            setContent(htmlContent);
            setParentId(ruleData.parent_id || '');
          }
        }
      } catch (err) {
        setError('Failed to load data: ' + err.message);
        console.error(err);
      }
    }
    fetchData();
  }, [editId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const quillText = quillRef.current?.getText().trim();
    if (!quillText) {
      setError('Content is required.');
      return;
    }

    try {
      setError(null);
      const htmlContent = quillRef.current.root.innerHTML;
      console.log('Submitting content:', htmlContent);
      const contentJson = { sections: [{ type: 'text', html: htmlContent }] };
      console.log('contentJson:', contentJson);

      if (editId) {
        const { error } = await supabase
          .from('rules')
          .update({
            title,
            content_json: contentJson,
            parent_id: parentId || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editId);
        if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized update' : error.message);
      } else {
        const { data: existingRules, error: fetchError } = await supabase
          .from('rules')
          .select('id')
          .is('parent_id', null);
        if (fetchError) throw fetchError;
        const { error } = await supabase
          .from('rules')
          .insert({
            title,
            content_json: contentJson,
            parent_id: parentId || null,
            order_index: parentId ? 0 : existingRules.length,
          });
        if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized insert' : error.message);
      }
      navigate(parentId ? `/rules/${parentId}` : '/rules');
    } catch (err) {
      setError('Failed to save rule: ' + err.message);
      console.error(err);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', editId);
      if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized deletion' : error.message);
      setDeleteDialogOpen(false);
      navigate('/rules');
    } catch (err) {
      setError('Failed to delete rule: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-darkfantasy-primary p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral mb-6">
          {editId ? 'Edit Rule' : 'Create New Rule'}
        </h1>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="bg-darkfantasy-tertiary border border-[#8a7b5e] rounded-lg p-6 shadow-lg">
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
              {chapters.map(chapter => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#8a7b5e] font-darkfantasy"
            >
              {editId ? 'Update Rule' : 'Add Rule'}
            </button>
            <button
              type="button"
              onClick={() => navigate(parentId ? `/rules/${parentId}` : '/rules')}
              className="bg-gray-600 text-darkfantasy-neutral py-2 px-6 rounded hover:bg-gray-700 font-darkfantasy"
            >
              Cancel
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-[#661318] text-darkfantasy-neutral py-2 px-6 rounded hover:bg-red-800 font-darkfantasy"
              >
                Delete
              </button>
            )}
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-darkfantasy-tertiary border-2 border-[#8a7b5e] rounded-lg p-6 max-w-sm w-full text-center">
              <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-4">
                Erase Rule
              </h2>
              <p className="text-darkfantasy-neutral mb-6">
                Are you sure you wish to erase "{title}" and its subchapters?
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
    </div>
  );
}

export default RuleEditor;