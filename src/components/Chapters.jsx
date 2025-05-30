import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
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
    <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
      {/* Subtle background overlay for texture */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-darkfantasy-heading text-4xl font-semibold text-darkfantasy-accent tracking-tight">
            Chronicles of the Realm
          </h1>
          <Link
            to="/rules/new"
            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
            aria-label="Add new chapter"
          >
            Inscribe New Chapter
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-600 text-sm mb-6 text-center font-darkfantasy animate-pulse-darkfantasy">
            {error}
          </p>
        )}

        {/* Search Bar */}
        <div className="relative mb-8">
          <input
            type="text"
            placeholder="Seek within the ancient tomes..."
            defaultValue={search}
            onChange={(e) => {
              const debouncedSetSearch = debounce((value) => setSearch(value), 300);
              debouncedSetSearch(e.target.value);
            }}
            className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
            aria-label="Search chapters"
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

        {/* Loading or No Chapters */}
        {loading ? (
          <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg animate-pulse-darkfantasy">
            Unearthing ancient lore...
          </p>
        ) : chapters.length === 0 ? (
          <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg">
            No tomes found in the abyss.
          </p>
        ) : (
          /* Chapters Grid */
          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/rules/${chapter.id}`}
                className="bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg p-6 shadow-darkfantasy hover:bg-darkfantasy-secondary/80 hover:shadow-darkfantasy-glow transition-all duration-300 group relative overflow-hidden texture-darkfantasy"
              >
                <h2 className="font-darkfantasy-heading text-xl text-darkfantasy-highlight mb-3 group-hover:text-darkfantasy-neutral transition-all duration-300">
                  {chapter.title}
                </h2>
                <p className="text-darkfantasy-neutral text-sm font-darkfantasy">
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