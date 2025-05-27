import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { supabase } from '../supabaseClient';
import { Image } from 'lucide-react';
import api from '../api';

function NPCSheet() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize character state, merging updates from subpages
  const [character, setCharacter] = useState(() => {
    const stateCharacter = location.state?.character || {};
    const updatedEquipment = location.state?.updatedEquipment;
    const updatedProficiencies = location.state?.updatedProficiencies;
    const updatedCurrency = location.state?.updatedCurrency;
    const updatedGridSize = location.state?.updatedGridSize;

    const defaultCharacter = {
      id: null,
      type: 'NPC',
      data: {
        name: '',
        npcType: 'Monster',
        hd: 1,
        hp: 0,
        save: 0,
        bonusToHit: 0,
        ac: 0,
        closeQuarterMovement: 0, // New field
        openFieldMovement: 0,    // New field
        equipment: [],
        proficiencies: [],
        nonWeaponProficiencies: [],
        description: '',
        picture: '',
        class: '',
        xp: 0,
      },
    };

    return {
      ...defaultCharacter,
      ...stateCharacter,
      data: {
        ...defaultCharacter.data,
        ...stateCharacter.data,
        equipment: updatedEquipment || stateCharacter.data?.equipment || stateCharacter.data?.inventory || [],
        nonWeaponProficiencies: updatedProficiencies || stateCharacter.data?.nonWeaponProficiencies || [],
        currency: updatedCurrency || stateCharacter.data?.currency || defaultCharacter.data.currency,
        gridSize: updatedGridSize || stateCharacter.data?.gridSize || defaultCharacter.data.gridSize,
        closeQuarterMovement: stateCharacter.data?.closeQuarterMovement || 0, // Initialize if not present
        openFieldMovement: stateCharacter.data?.openFieldMovement || 0,       // Initialize if not present
      },
    };
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(character.data.picture || '');

  const proficiencyOptions = [
    'Sword', 'Axe', 'Mace', 'Staff', 'Spear', 'Dagger', 'Flail', 'Warhammer',
    'Two-Handed Sword', 'Morning Star', 'Glaive', 'Halberd', 'Quarterstaff',
    'Bow', 'Shortbow', 'Crossbow', 'Hand Crossbow', 'Light Crossbow', 'Sling',
  ];

  useEffect(() => {
    if (character.data.picture) setImagePreview(character.data.picture);
  }, [character.data.picture]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCharacter((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [name]: ['hd', 'hp', 'save', 'bonusToHit', 'ac', 'xp', 'closeQuarterMovement', 'openFieldMovement'].includes(name)
          ? Number(value) || 0
          : value,
      },
    }));
  };

  const handleProficiencyChange = (e) => {
    const selectedProf = e.target.value;
    if (selectedProf && !character.data.proficiencies.includes(selectedProf)) {
      setCharacter((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          proficiencies: [...prev.data.proficiencies, selectedProf],
        },
      }));
    }
  };

  const removeProficiency = (prof) => {
    setCharacter((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        proficiencies: prev.data.proficiencies.filter((p) => p !== prof),
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('character-images')
      .upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('character-images').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let pictureUrl = character.data.picture || '';
      if (imageFile) pictureUrl = await uploadImage(imageFile);

      const characterData = {
        user_id: user.id,
        type: 'NPC',
        name: character.data.name,
        data: {
          ...character.data,
          currency: character.data.currency,
          gridSize: character.data.gridSize,
          picture: pictureUrl,
        },
      };

      if (character.id) {
        await supabase
          .from('characters')
          .update(characterData)
          .eq('id', character.id);
      } else {
        const { data, error } = await supabase
          .from('characters')
          .insert(characterData)
          .select()
          .single();
        if (error) throw error;
        setCharacter({ ...character, id: data.id });
      }
      navigate('/characters');
    } catch (err) {
      setError('Failed to save NPC: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="bg-darkfantasy-primary border-2 border-[#8a7b5e] rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
        <h1 className="text-3xl font-darkfantasy text-darkfantasy-neutral mb-6 text-center">
          {character.id ? 'Edit NPC' : 'Create NPC'}
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={character.data.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Type
                </label>
                <select
                  name="npcType"
                  value={character.data.npcType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                >
                  <option value="Monster">Monster</option>
                  <option value="Humanoid">Humanoid</option>
                  <option value="Beast">Beast</option>
                  <option value="Vehicle">Vehicle</option>
                </select>
              </div>
              {character.data.npcType === 'Humanoid' && (
                <>
                  <div>
                    <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                      Class
                    </label>
                    <input
                      type="text"
                      name="class"
                      value={character.data.class}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                      XP
                    </label>
                    <input
                      type="number"
                      name="xp"
                      value={character.data.xp}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                      disabled={loading}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Combat Stats */}
          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">Combat Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  HD (Hit Dice)
                </label>
                <input
                  type="number"
                  name="hd"
                  value={character.data.hd}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  HP (Hit Points)
                </label>
                <input
                  type="number"
                  name="hp"
                  value={character.data.hp}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Save
                </label>
                <input
                  type="number"
                  name="save"
                  value={character.data.save}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Bonus to Hit
                </label>
                <input
                  type="number"
                  name="bonusToHit"
                  value={character.data.bonusToHit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  AC (Armor Class)
                </label>
                <input
                  type="number"
                  name="ac"
                  value={character.data.ac}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Close Quarter Movement
                </label>
                <input
                  type="number"
                  name="closeQuarterMovement"
                  value={character.data.closeQuarterMovement}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Open Field Movement
                </label>
                <input
                  type="number"
                  name="openFieldMovement"
                  value={character.data.openFieldMovement}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy"
                  disabled={loading}
                />
                <p className="text-darkfantasy-neutral text-xs mt-1">
                  Open Field Movement is Close Quarter Movement × 4
                </p>
              </div>
            </div>
          </div>

          {/* Proficiencies Section */}
          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">Proficiencies</h2>
            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Weapon Proficiencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.proficiencies.map((prof) => (
                    <span
                      key={prof}
                      className="inline-flex items-center px-2 py-1 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded text-sm cursor-pointer"
                      onClick={() => removeProficiency(prof)}
                    >
                      {prof}
                      <span className="ml-1 text-red-500">×</span>
                    </span>
                  ))}
                </div>
                <select
                  onChange={handleProficiencyChange}
                  className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy focus:outline-none"
                  disabled={loading}
                >
                  <option value="">Add Weapon Proficiency</option>
                  {proficiencyOptions
                    .filter((prof) => !character.data.proficiencies.includes(prof))
                    .map((prof) => (
                      <option key={prof} value={prof}>
                        {prof}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-darkfantasy-neutral text-sm font-darkfantasy mb-2">
                  Non-Weapon Proficiencies
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {character.data.nonWeaponProficiencies.map((prof, index) => (
                    <span
                      key={prof.name || index}
                      className="inline-flex items-center px-2 py-1 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded text-sm"
                    >
                      {prof.name} ({prof.value}%)
                    </span>
                  ))}
                </div>
                <Link
                  to="/characters/new/non-weapon-proficiencies"
                  state={{ character, imagePreview }}
                  className="inline-block bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#661318] font-darkfantasy"
                >
                  Manage Non-Weapon Proficiencies
                </Link>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">Inventory</h2>
            <div className="mt-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {character.data.equipment.map((item, index) => (
                  <span
                    key={item.id || index}
                    className="inline-flex items-center px-2 py-1 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded text-sm"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
              <Link
                to="/characters/new/inventory"
                state={{ character, imagePreview }}
                className="inline-block bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-4 rounded hover:bg-[#661318] font-darkfantasy"
              >
                Manage Inventory
              </Link>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-darkfantasy text-darkfantasy-neutral">Description</h2>
            <div className="space-y-4 flex flex-col items-center mt-4">
              <div>
                <label htmlFor="picture" className="cursor-pointer">
                  <div className="w-32 h-32 rounded-full bg-darkfantasy-tertiary border border-darkfantasy flex items-center justify-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Image className="w-8 h-8 text-darkfantasy-neutral" />
                    )}
                  </div>
                </label>
                <input
                  id="picture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </div>
              <textarea
                name="description"
                value={character.data.description}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-darkfantasy-tertiary text-darkfantasy-neutral rounded border border-darkfantasy h-32"
                placeholder="Describe the NPC"
                disabled={loading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-darkfantasy-secondary text-darkfantasy-neutral py-2 px-6 rounded hover:bg-[#661318] font-darkfantasy"
            >
              {loading ? 'Saving...' : 'Save NPC'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NPCSheet;