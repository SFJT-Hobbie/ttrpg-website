import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import debounce from 'lodash/debounce';

function Chapters() {
  const [chapters, setChapters] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch chapters
  useEffect(() => {
    async function fetchChapters() {
      setLoading(true);
      try {
        let query = supabase
          .from('rules')
          .select('*')
          .is('parent_id', null)
          .order('order_index');
        if (search) {
          query = supabase
            .from('rules')
            .select('*')
            .textSearch('search_vector', search, { type: 'websearch' })
            .order('order_index');
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        setChapters(data || []);
        setError(null);
      } catch (err) {
        setError('Failed to load chapters: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchChapters();
  }, [search]);

  // Debounced search
  useEffect(() => {
    const debouncedSetSearch = debounce((value) => setSearch(value), 300);
    return () => debouncedSetSearch.cancel();
  }, []);

  // Truncate text for preview
  const truncateHtml = (html, maxLength = 100) => {
    const text = html.replace(/<[^>]+>/g, '');
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-darkfantasy-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral">
            Chronicles of the Realm
          </h1>
          <Link
            to="/rules/new"
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#8a7b5e] font-darkfantasy"
          >
            Add Chapter
          </Link>
        </div>
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search chapters..."
            defaultValue={search}
            onChange={(e) => {
              const debouncedSetSearch = debounce((value) => setSearch(value), 300);
              debouncedSetSearch(e.target.value);
            }}
            className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy-highlight focus:outline-none"
            aria-label="Search chapters"
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
          <p className="text-darkfantasy-neutral text-center">Loading chapters...</p>
        ) : chapters.length === 0 ? (
          <p className="text-darkfantasy-neutral text-center">No chapters found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chapters.map(chapter => (
              <Link
                key={chapter.id}
                to={`/rules/${chapter.id}`}
                className="bg-darkfantasy-tertiary border border-[#8a7b5e] rounded-lg p-6 shadow-lg hover:bg-darkfantasy-primary transition-colors"
              >
                <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-2">
                  {chapter.title}
                </h2>
                <p className="text-darkfantasy-neutral text-sm">
                  {truncateHtml(chapter.content_json.sections[0]?.html || '')}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chapters;