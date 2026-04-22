import { searchMoviesAndShows, getMediaDetails as getTmdbDetails } from './tmdbService';
import { searchGames, getGameDetails } from './igdbService';
import { searchBooks, getBookDetails } from './openLibraryService';

export async function searchMedia(query, type) {
  if (!query || query.length < 2) return [];

  switch (type) {
    case 'movie':
      return await searchMoviesAndShows(query);
    case 'game':
      return await searchGames(query);
    case 'book':
      return await searchBooks(query);
    default:
      console.warn(`Unknown media search type: ${type}`);
      return [];
  }
}

export async function getMediaDetails(id, type, subType) {
  if (!id) return null;

  if (id.startsWith('igdb_') || type === 'game') {
    const gameId = id.replace('igdb_', '');
    return await getGameDetails(gameId);
  }
  
  if (id.startsWith('ol_') || type === 'book') {
    const workId = id.replace('ol_', '');
    return await getBookDetails(workId);
  }

  if (id.startsWith('tmdb_') || type === 'movie') {
    const tmdbId = id.replace('tmdb_', '');
    return await getTmdbDetails(tmdbId, subType || 'movie');
  }
  
  return null;
}
