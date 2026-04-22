const IGDB_CLIENT_ID = process.env.EXPO_PUBLIC_IGDB_CLIENT_ID;
const IGDB_ACCESS_TOKEN = process.env.EXPO_PUBLIC_IGDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.igdb.com/v4';

export async function searchGames(query) {
  if (!query || !IGDB_CLIENT_ID || !IGDB_ACCESS_TOKEN) return [];

  try {
    const response = await fetch(`${BASE_URL}/games`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-ID': IGDB_CLIENT_ID,
        'Authorization': `Bearer ${IGDB_ACCESS_TOKEN}`,
        'Content-Type': 'text/plain',
      },
      body: `search "${query}"; fields name, cover.image_id, first_release_date, involved_companies.company.name; limit 10;`
    });

    if (!response.ok) {
      throw new Error(`IGDB Error: ${response.status}`);
    }

    const data = await response.json();

    return data.map(game => {
      const releaseYear = game.first_release_date 
        ? new Date(game.first_release_date * 1000).getFullYear().toString()
        : '';
        
      const coverUrl = game.cover?.image_id 
        ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
        : null;

      const developer = game.involved_companies?.find(c => c.company?.name)?.company?.name || 'Game';

      return {
        id: `igdb_${game.id}`,
        title: game.name,
        subtitle: developer,
        coverUrl,
        releaseYear,
        type: 'game',
        originalData: game
      };
    });

  } catch (error) {
    console.error('Error searching IGDB:', error);
    return [];
  }
}
