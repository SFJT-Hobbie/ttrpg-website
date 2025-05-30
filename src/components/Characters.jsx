import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext.jsx';
import { Link } from 'react-router-dom';
import { Trash2, Skull, User, X } from 'lucide-react';

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
    <div className="min-h-screen p-8 font-darkfantasy relative overflow-hidden">
      {/* Subtle background overlay for texture */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10 pointer-events-none" />
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-darkfantasy-heading text-4xl font-semibold text-darkfantasy-accent tracking-tight">
            Roster of the Realm
          </h1>
          <div className="flex space-x-4">
            <Link
              to="/characters/new/pc"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
              aria-label="Create player character"
            >
              Forge PC
            </Link>
            <Link
              to="/characters/new/npc"
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
              aria-label="Create non-player character"
            >
              Forge NPC
            </Link>
          </div>
        </div>

        <div className="space-y-12">
          <div>
            <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-highlight mb-6 tracking-tight">
              Living Legends
            </h2>
            <div className="space-y-4">
              {aliveCharacters.length === 0 ? (
                <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg">
                  No living souls remain in the realm.
                </p>
              ) : (
                aliveCharacters.map(char => (
                  <CharacterCard key={char.id} char={char} openModal={openModal} />
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-highlight mb-6 tracking-tight">
              Fallen Heroes
            </h2>
            <div className="space-y-4">
              {deceasedCharacters.length === 0 ? (
                <p className="text-darkfantasy-neutral text-center font-darkfantasy text-lg">
                  No souls have yet perished.
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
          className="fixed inset-0 bg-darkfantasy-shadow flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-darkfantasy-tertiary border-darkfantasy-heavy rounded-lg p-6 max-w-sm w-full text-center shadow-darkfantasy texture-darkfantasy"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-darkfantasy-heading text-2xl text-darkfantasy-accent mb-4">
              {modalAction === 'delete' ? 'Erase from History' : 'Mark as Fallen'}
            </h2>
            <p className="text-darkfantasy-neutral mb-6 font-darkfantasy">
              {modalAction === 'delete'
                ? `Are you certain you wish to erase ${modalCharacter.name} from the annals?`
                : `Are you certain you wish to mark ${modalCharacter.name} as fallen?`}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmAction}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-red-800 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Confirm action"
              >
                Yes
              </button>
              <button
                onClick={closeModal}
                className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded border-darkfantasy hover:bg-darkfantasy-highlight/50 hover:shadow-darkfantasy-glow hover:text-darkfantasy-highlight font-darkfantasy transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-darkfantasy-highlight"
                aria-label="Cancel action"
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
    <div className="p-6 bg-darkfantasy-tertiary rounded-lg border-darkfantasy-heavy shadow-darkfantasy hover:shadow-darkfantasy-glow flex items-center space-x-6 mb-4 transition-all duration-300 texture-darkfantasy">
      <div className="flex-shrink-0">
        {char.data?.picture ? (
          <img
            src={char.data.picture}
            alt={char.name}
            className="w-24 h-24 rounded-full object-cover border-darkfantasy"
          />
        ) : (
          <User className="w-24 h-24 text-darkfantasy-neutral" />
        )}
      </div>

      <div className="flex-grow">
        <h3 className="font-darkfantasy-heading text-lg text-darkfantasy-highlight mb-2">
          {char.name}
        </h3>
        <p className="text-darkfantasy-neutral text-sm font-darkfantasy">
          Type: {char.type}
        </p>
        {char.type === 'PC' && (
          <div>
            <p className="text-darkfantasy-neutral text-sm font-darkfantasy">
              Race: {char.data?.race || 'Unknown'}
            </p>
            <p className="text-darkfantasy-neutral text-sm font-darkfantasy">
              Class: {char.data?.class || 'Unknown'}
            </p>
            <p className="text-darkfantasy-neutral text-sm font-darkfantasy">
              Level: {char.data?.level || 'N/A'}
            </p>
          </div>
        )}
        <div className="mt-3">
          <Link
            to={`/characters/edit/${char.id}`}
            className="text-darkfantasy-highlight hover:text-darkfantasy-neutral font-darkfantasy text-sm transition-all duration-300"
            aria-label={`View ${char.name}'s details`}
          >
            View Chronicle
          </Link>
        </div>
      </div>

      <div className="flex space-x-4">
        {status === 'alive' && (
          <Skull
            className="w-5 h-5 text-darkfantasy-neutral cursor-pointer hover:text-darkfantasy-highlight transition-all duration-300"
            onClick={() => openModal('toggleStatus', char)}
            aria-label={`Mark ${char.name} as deceased`}
          />
        )}
        <Trash2
          className="w-5 h-5 text-darkfantasy-neutral cursor-pointer hover:text-red-600 transition-all duration-300"
          onClick={() => openModal('delete', char)}
          aria-label={`Delete ${char.name}`}
        />
      </div>
    </div>
  );
}

export default Characters;