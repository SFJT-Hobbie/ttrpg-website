import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Trash2, Skull, User } from 'lucide-react';

function Characters() {
  const { user } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const [modalCharacter, setModalCharacter] = useState(null);

  useEffect(() => {
    if (user) {
      async function fetchCharacters() {
        const { data, error } = await supabase
          .from('characters')
          .select('*')
          .eq('user_id', user.id);
        if (error) console.error('Error fetching characters:', error);
        else setCharacters(data);
      }
      fetchCharacters();
    }
  }, [user]);

  const openModal = (action, character) => {
    setModalAction(action);
    setModalCharacter(character);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalAction(null);
    setModalCharacter(null);
  };

  const confirmAction = async () => {
    if (modalAction === 'delete') {
      try {
        await supabase.from('characters').delete().eq('id', modalCharacter.id);
        setCharacters(characters.filter(c => c.id !== modalCharacter.id));
      } catch (error) {
        console.error('Error deleting character:', error);
      }
    } else if (modalAction === 'toggleStatus') {
      try {
        const updatedData = {
          ...modalCharacter.data,
          status: 'deceased',
          deathDate: new Date().toISOString().split('T')[0],
        };
        await supabase
          .from('characters')
          .update({ data: updatedData })
          .eq('id', modalCharacter.id);
        setCharacters(
          characters.map(c =>
            c.id === modalCharacter.id ? { ...c, data: updatedData } : c
          )
        );
      } catch (error) {
        console.error('Error marking character as deceased:', error);
      }
    }
    closeModal();
  };

  const aliveCharacters = characters.filter(char => char.data?.status !== 'deceased');
  const deceasedCharacters = characters.filter(char => char.data?.status === 'deceased');

  return (
    <div className="min-h-screen bg-[#3c2f2f] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-darkfantasy text-darkfantasy-neutral">
            Your Characters
          </h1>
          <div className="space-x-4">
            <Link
              to="/characters/new/pc"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#3c2f2f] font-darkfantasy"
            >
              Create PC
            </Link>
            <Link
              to="/characters/new/npc"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#3c2f2f] font-darkfantasy"
            >
              Create NPC
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
              Alive Characters
            </h2>
            <div className="w-full">
              {aliveCharacters.length === 0 ? (
                <p className="text-darkfantasy-neutral text-center">
                  No alive characters found.
                </p>
              ) : (
                aliveCharacters.map(char => (
                  <CharacterCard key={char.id} char={char} openModal={openModal} />
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral mb-4">
              Deceased Characters
            </h2>
            <div className="w-full">
              {deceasedCharacters.length === 0 ? (
                <p className="text-darkfantasy-neutral text-center">
                  No deceased characters found.
                </p>
              ) : (
                deceasedCharacters.map(char => (
                  <CharacterCard key={char.id} char={char} openModal={openModal} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-darkfantasy-primary p-6 rounded-lg text-darkfantasy-neutral"
            onClick={e => e.stopPropagation()}
          >
            <p className="mb-4">
              {modalAction === 'delete'
                ? `Are you sure you want to delete ${modalCharacter.name}?`
                : `Are you sure you want to mark ${modalCharacter.name} as deceased?`}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmAction}
                className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
              >
                Yes
              </button>
              <button
                onClick={closeModal}
                className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CharacterCard({ char, openModal }) {
  const status = char.data?.status || 'alive';

  return (
    <div className="p-4 bg-darkfantasy-primary rounded-lg border border-darkfantasy shadow-lg flex items-center space-x-4 mb-4">
      <div className="flex-shrink-0">
        {char.data?.picture ? (
          <img
            src={char.data.picture}
            alt={char.name}
            className="w-32 h-32 rounded-full object-cover"
          />
        ) : (
          <User className="w-32 h-32 text-darkfantasy-neutral" />
        )}
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-darkfantasy text-darkfantasy-neutral">
          {char.name}
        </h3>
        <p className="text-darkfantasy-highlight">Type: {char.type}</p>
        {char.type === 'PC' && (
          <div>
            <p className="text-darkfantasy-highlight">
              Race: {char.data?.race || 'N/A'}
            </p>
            <p className="text-darkfantasy-highlight">
              Class: {char.data?.class || 'N/A'}
            </p>
            <p className="text-darkfantasy-highlight">
              Level: {char.data?.level || 'N/A'}
            </p>
          </div>
        )}
        <div className="flex space-x-4 mt-2">
          <Link
            to={`/characters/edit/${char.id}`}
            className="text-darkfantasy-highlight hover:underline"
          >
            View Character
          </Link>
        </div>
      </div>

      <div className="flex space-x-8">
        {status === 'alive' && (
          <Skull
            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={() => openModal('toggleStatus', char)}
          />
        )}
        <Trash2
          className="w-5 h-5 text-red-500 cursor-pointer hover:text-red-700"
          onClick={() => openModal('delete', char)}
        />
      </div>
    </div>
  );
}

export default Characters;