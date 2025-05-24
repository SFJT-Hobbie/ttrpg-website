import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function EditCharacter() {
  const { id } = useParams();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        setCharacter(data);
      } catch (err) {
        setError('Failed to load character: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCharacter();
  }, [id]);

  if (loading) return <p className="text-darkfantasy-neutral">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!character) return <p className="text-darkfantasy-neutral">Character not found</p>;

  const path = character.type === 'PC' ? '/characters/new/pc' : '/characters/new/npc';
  return <Navigate to={path} state={{ character }} replace />;
}

export default EditCharacter;