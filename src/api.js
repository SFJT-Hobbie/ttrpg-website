import { supabase } from './supabaseClient';

const api = {
  // Fetch inventory items for a character
  getInventoryItems: async (characterId) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('character_id', characterId);
    if (error) throw error;
    return data;
  },

  // Create or update an inventory item
  upsertInventoryItem: async (item) => {
    const { data, error } = await supabase
      .from('inventory_items')
      .upsert({
        id: item.id,
        character_id: item.character_id,
        name: item.name,
        slot_position: item.slot_position,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Delete an inventory item
  deleteInventoryItem: async (itemId) => {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', itemId);
    if (error) throw error;
  },

  // Update character data (e.g., to store inventory references)
  updateCharacter: async (characterId, characterData) => {
    const { data, error } = await supabase
      .from('characters')
      .update({ data: characterData })
      .eq('id', characterId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export default api;