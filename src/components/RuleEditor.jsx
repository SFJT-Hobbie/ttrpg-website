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
        placeholder: 'Etch the sacred law...',
      });

      // Customize Quill editor styles to match theme
      const editor = editorRef.current.querySelector('.ql-container');
      const toolbar = editorRef.current.querySelector('.ql-toolbar');
      if (editor && toolbar) {
        editor.classList.add('bg-darkfantasy-primary', 'text-darkfantasy-neutral', 'border-darkfantasy', 'rounded');
        toolbar.classList.add('bg-darkfantasy-secondary', 'border-darkfantasy', 'text-darkfantasy-neutral');
      }

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
        setError('Failed to unveil the annals: ' + err.message);
        console.error(err);
      }
    }
    fetchData();
  }, [editId]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('A title must be forged for the law.');
      return;
    }
    const quillText = quillRef.current?.getText().trim();
    if (!quillText) {
      setError('The law must bear sacred text.');
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
        if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized alteration' : error.message);
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
        if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized inscription' : error.message);
      }
      navigate(parentId ? `/rules/${parentId}` : '/rules');
    } catch (err) {
      setError('Failed to etch the law: ' + err.message);
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
      if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized obliteration' : error.message);
      setDeleteDialogOpen(false);
      navigate('/rules');
    } catch (err) {
      setError('Failed to erase the law: ' + err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-darkfantasy-heading text-darkfantasy-accent mb-8 text-center tracking-tight">
          {editId ? 'Amend the Sacred Law' : 'Forge a New Law'}
        </h1>
        {error && (
          <p className="text-red-600 text-sm mb-6 text-center font-darkfantasy animate-pulse-darkfantasy">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="bg-darkfantasy-tertiary border-darkfantasy-dark rounded-lg p-8 shadow-darkfantasy">
          <div className="mb-6">
            <label htmlFor="rule-title" className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Law Title
            </label>
            <input
              id="rule-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Name the sacred law..."
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              required
              aria-label="Rule title"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="rule-content" className="block text-darkfantasy-neutraltext-sm font-darkfantasy mb-2">
              Sacred Text
            </label>
            <div id="rule-content" ref={editorRef} className="min-h-[300px] bg-darkfantasy-primary" />
          </div>
          <div className="mb-6">
            <label htmlFor="parent-chapter" className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
              Tome of Origin
            </label>
            <select
              id="parent-chapter"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
              aria-label="Parent chapter"
            >
              <option value="">No Parent Tome</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
              aria-label={editId ? 'Update rule' : 'Add rule'}
            >
              {editId ? 'Inscribe Changes' : 'Declare Law'}
            </button>
            <button
              type="button"
              onClick={() => navigate(parentId ? `/rules/${parentId}` : '/rules')}
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
              aria-label="Cancel"
            >
              Abandon
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded border-darkfantasy hover:bg-red-800/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Delete rule"
              >
                Obliterate
              </button>
            )}
          </div>
        </form>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-darkfantasy-tertiary border-darkfantasy-dark rounded-lg p-8 max-w-sm w-full text-center shadow-darkfantasy">
              <h2 className="text-2xl font-darkfantasy-heading text-darkfantasy-accent mb-4 tracking-tight">
                Erase Sacred Law
              </h2>
              <p className="text-darkfantasy-neutral text-sm font-darkfantasy mb-6">
                Do you truly wish to erase "{title}" and its subchapters?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                  aria-label="Cancel deletion"
                >
                  Spare
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-8 rounded border-darkfantasy hover:bg-red-800/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
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

export default RuleEditor;