import { searchMoviesAndShows, getMediaDetails as getTmdbDetails } from './tmdbService';
import { searchGames } from './igdbService';
import { searchBooks } from './openLibraryService';

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

export async function getMediaDetails(id, type, mediaType) {
  if (type === 'movie') {
    // extract numeric ID from tmdb_ID
    const tmdbId = id.replace('tmdb_', '');
    return await getTmdbDetails(tmdbId, mediaType || 'movie');
  }
  return null;
}
