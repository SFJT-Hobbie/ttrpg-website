import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Edit2, Trash2 } from 'lucide-react';
import sanitizeHtml from 'sanitize-html';
import debounce from 'lodash/debounce';

function Subchapters() {
  const { chapterId } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [subchapters, setSubchapters] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch chapter and subchapters
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch chapter
        const { data: chapterData, error: chapterError } = await supabase
          .from('rules')
          .select('*')
          .eq('id', chapterId)
          .single();
        if (chapterError) throw chapterError;
        if (!chapterData) throw new Error('Chapter not found');
        console.log('Raw chapter content_json:', chapterData.content_json);
        setChapter(chapterData);

        // Fetch subchapters
        let query = supabase
          .from('rules')
          .select('*')
          .eq('parent_id', chapterId)
          .order('title', { ascending: true });
        if (search) {
          query = query.textSearch('search_vector', search, { type: 'websearch' });
        }
        const { data: subchapterData, error: subchapterError } = await query;
        if (subchapterError) throw subchapterError;
        console.log('Raw subchapter content_json:', subchapterData?.map(sc => sc.content_json));
        setSubchapters(subchapterData || []);
        setError(null);
      } catch (err) {
        setError('Failed to load chapter: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [chapterId, search]);

  // Handle delete
  const handleDelete = async (ruleId) => {
    try {
      const { error } = await supabase
        .from('rules')
        .delete()
        .eq('id', ruleId);
      if (error) throw new Error(error.message.includes('permission') ? 'Unauthorized deletion' : error.message);
      if (ruleId === chapterId) {
        navigate('/rules');
      } else {
        setSubchapters(subchapters.filter(r => r.id !== ruleId));
      }
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

  // Build subchapter index
  const renderIndex = useCallback(() => {
    return subchapters.map(subchapter => (
      <li key={subchapter.id}>
        <a
          href={`#subchapter-${subchapter.id}`}
          className="text-darkfantasy-highlight hover:text-darkfantasy-neutral font-darkfantasy text-sm transition-all duration-300"
        >
          {subchapter.title}
        </a>
      </li>
    ));
  }, [subchapters]);

  if (!chapter && !loading) {
    return (
      <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/runes-bg.png')] bg-cover bg-center opacity-10 pointer-events-none" />
        <div className="max-w-6xl mx-auto">
          <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg">
            Tome not found in the abyss.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
      {/* Subtle background overlay for texture */}
      <div className="absolute inset-0 bg-[url('/assets/runes-bg.png')] bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto">
        {/* Search Bar */}

        <div className="flex">
          {/* Sidebar Index */}
          <div className="w-1/3 pr-20 hidden xl:block">
            <div className="fixed flex flex-col max-w-[250px]">
              <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-accent mb-4 tracking-tight">
                Index of Lore
              </h2>
              <div className="flex justify-start mb-8">
                <div className="relative w-full max-w-md">
                  <input
                    type="text"
                    placeholder="Seek within the ancient tomes..."
                    defaultValue={search}
                    onChange={(e) => {
                      const debouncedSetSearch = debounce((value) => setSearch(value), 300);
                      debouncedSetSearch(e.target.value);
                    }}
                    className="w-full px-4 py-3 bg-darkfantasy-primary text-darkfantasy-neutral border-darkfantasy rounded focus:outline-none focus:border-darkfantasy-highlight focus:ring-2 focus:ring-darkfantasy-highlight text-sm shadow-darkfantasy transition-all duration-300"
                    aria-label="Search subchapters"
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
              </div>
              {loading ? (
                <p className="text-darkfantasy-neutral font-darkfantasy text-lg animate-pulse-darkfantasy">
                  Unearthing secrets...
                </p>
              ) : (
                <ul className="text-darkfantasy-neutral space-y-2">{renderIndex()}</ul>
              )}
            </div>
            
          </div>

          {/* Main Content */}
          <div className="w-full">
            {/* Chapter Header */}
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-darkfantasy-heading text-4xl font-semibold text-darkfantasy-accent tracking-tight">
                {chapter?.title || 'Loading...'}
              </h1>
              {isAdmin && (
                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(`/rules/new?edit=${chapterId}`)}
                    className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                    aria-label="Edit chapter"
                  >
                    <Edit2 className="w-5 h-5 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(chapterId)}
                    className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border-darkfantasy hover:bg-red-800 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                    aria-label="Delete chapter"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-600 text-sm mb-6 text-center font-darkfantasy animate-pulse-darkfantasy">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg animate-pulse-darkfantasy">
                Unveiling ancient lore...
              </p>
            ) : (
              <>
                {/* Chapter Content */}
                <div className="mb-12 bg-darkfantasy-tertiary p-6 rounded border-darkfantasy-heavy shadow-darkfantasy texture-darkfantasy">
                  {chapter?.content_json?.sections?.[0]?.html ? (
                    <div
                      className="prose prose-sm text-darkfantasy-neutral max-w-none font-darkfantasy"
                      dangerouslySetInnerHTML={{ __html: sanitizeHtml(chapter.content_json.sections[0].html) }}
                    />
                  ) : (
                    <p className="text-darkfantasy-neutral italic font-darkfantasy">
                      No lore inscribed for this chapter.
                    </p>
                  )}
                </div>

                {/* Subchapters Content */}
                {subchapters.length > 0 ? (
                  subchapters.map(subchapter => (
                    <div
                      key={subchapter.id}
                      id={`subchapter-${subchapter.id}`}
                      className="mb-8 bg-darkfantasy-tertiary p-6 rounded border-darkfantasy-heavy shadow-darkfantasy hover:shadow-darkfantasy-glow transition-all duration-300 texture-darkfantasy"
                    >
                      <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-highlight mb-4">
                        {subchapter.title}
                      </h2>
                      {subchapter.content_json?.sections?.[0]?.html ? (
                        <div
                          className="prose prose-sm text-darkfantasy-neutral max-w-none font-darkfantasy"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(subchapter.content_json.sections[0].html) }}
                        />
                      ) : (
                        <p className="text-darkfantasy-neutral italic font-darkfantasy">
                          No lore inscribed for this subchapter.
                        </p>
                      )}
                      {isAdmin && (
                        <div className="flex gap-4 mt-4">
                          <button
                            onClick={() => navigate(`/rules/new?edit=${subchapter.id}`)}
                            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                            aria-label="Edit subchapter"
                          >
                            <Edit2 className="w-5 h-5 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(subchapter.id)}
                            className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded border-darkfantasy hover:bg-red-800 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy flex items-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                            aria-label="Delete subchapter"
                          >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : !search ? (
                  <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg">
                    No subchapters found in the abyss.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Subchapters;