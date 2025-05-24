import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import { useParams, useNavigate } from 'react-router-dom';
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
          .order('title', { ascending: true }); // Changed to sort by title alphanumerically
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
        <a href={`#subchapter-${subchapter.id}`} className="text-darkfantasy-highlight hover:underline">
          {subchapter.title}
        </a>
      </li>
    ));
  }, [subchapters]);

  if (!chapter && !loading) {
    return (
      <div className="min-h-screen bg-darkfantasy-primary p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-darkfantasy-neutral text-center">Chapter not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkfantasy-primary p-8">
      <div className="w-64 mb-4 flex items-center justify-center mx-auto">
        <input
          type="text"
          placeholder="Search subchapters..."
          defaultValue={search}
          onChange={(e) => {
            const debouncedSetSearch = debounce((value) => setSearch(value), 300);
            debouncedSetSearch(e.target.value);
          }}
          className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy-highlight focus:outline-none"
          aria-label="Search subchapters"
        />
      </div>
      <div className="max-w-6xl mx-auto flex">
        {/* Sidebar Index */}
        <div className="w-1/3 pr-8">
          <div className="flex flex-col fixed">
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
              Index
            </h2>
            {loading ? (
              <p className="text-darkfantasy-neutral">Loading...</p>
            ) : (
              <ul className="text-darkfantasy-neutral">{renderIndex()}</ul>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral">
              {chapter?.title || 'Loading...'}
            </h1>
            {isAdmin && (
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/rules/new?edit=${chapterId}`)}
                  className="bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-4 rounded hover:bg-[#8a7b5e] font-darkfantasy"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(chapterId)}
                  className="bg-[#661318] text-darkfantasy-neutral py-1 px-4 rounded hover:bg-red-800 font-darkfantasy"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          {loading ? (
            <p className="text-darkfantasy-neutral text-center">Loading...</p>
          ) : (
            <>
              {/* Chapter Content */}
              <div className="mb-12">
                {chapter?.content_json?.sections?.[0]?.html ? (
                  <div
                    className="prose prose-sm text-darkfantasy-neutral max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(chapter.content_json.sections[0].html) }}
                  />
                ) : (
                  <p className="text-darkfantasy-neutral italic">No content available for this chapter.</p>
                )}
              </div>
              {/* Subchapters Content */}
              {subchapters.length > 0 ? (
                subchapters.map(subchapter => (
                  <div key={subchapter.id} id={`subchapter-${subchapter.id}`} className="mb-8 border-b-1 border-[#8a7b5e48] pb-2">
                    <h2 className="text-2xl font-darkfantasy text-darkfantasy-neutral mb-4">
                      {subchapter.title}
                    </h2>
                    {subchapter.content_json?.sections?.[0]?.html ? (
                      <div
                        className="prose prose-sm text-darkfantasy-neutral max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(subchapter.content_json.sections[0].html) }}
                      />
                    ) : (
                      <p className="text-darkfantasy-neutral italic">No content available for this subchapter.</p>
                    )}
                    {isAdmin && (
                      <div className="flex gap-4 mt-4">
                        <button
                          onClick={() => navigate(`/rules/new?edit=${subchapter.id}`)}
                          className="bg-darkfantasy-secondary text-darkfantasy-neutral py-1 px-4 rounded hover:bg-[#8a7b5e] font-darkfantasy"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(subchapter.id)}
                          className="bg-[#661318] text-darkfantasy-neutral py-1 px-4 rounded hover:bg-red-800 font-darkfantasy"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : !search ? (
                <p className="text-darkfantasy-neutral text-center">No subchapters found.</p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Subchapters;