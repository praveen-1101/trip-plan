'use client';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function toggleFavorite(placeId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select()
      .eq('user_id', user.id)
      .eq('place_id', placeId)
      .single();
    
    if (existing) {
      // Remove from favorites
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('place_id', placeId);
      
      if (error) throw error;
      return false; // Not favorited
    } else {
      // Add to favorites
      const { error } = await supabase
        .from('favorites')
        .insert([
          { user_id: user.id, place_id: placeId }
        ]);
      
      if (error) throw error;
      return true; // Favorited
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
}

export async function getFavorites() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .select('place_id')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    return data.map(f => f.place_id);
  } catch (error) {
    console.error('Error getting favorites:', error);
    return [];
  }
}