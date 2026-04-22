const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

export async function searchMoviesAndShows(query) {
  if (!query || !TMDB_API_KEY) {
    console.warn('TMDB Search: Missing query or API Key');
    return [];
  }
  
  try {
    // Detect if the key is a V4 Bearer Token (usually long, starting with eyJ) 
    // or a V3 API Key (32 characters).
    const isBearerToken = TMDB_API_KEY.length > 50;
    
    const url = isBearerToken 
      ? `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=1`
      : `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=1`;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      // Some environments require a User-Agent or specific headers to avoid network errors
      'User-Agent': 'HobifyApp/1.0',
    };

    if (isBearerToken) {
      headers['Authorization'] = `Bearer ${TMDB_API_KEY}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB API Error: ${response.status} - ${errorText}`);
      throw new Error(`TMDB Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results) return [];

    return data.results
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => {
        const title = item.title || item.name;
        const releaseDate = item.release_date || item.first_air_date;
        const releaseYear = releaseDate ? releaseDate.split('-')[0] : '';
        const coverUrl = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null;
        
        return {
          id: `tmdb_${item.id}`,
          tmdbId: item.id,
          mediaType: item.media_type, // 'movie' or 'tv'
          title,
          subtitle: item.media_type === 'movie' ? 'Movie' : 'TV Show',
          coverUrl,
          releaseYear,
          type: 'movie',
          originalData: item
        };
      })
      .slice(0, 10);
      
  } catch (error) {
    console.error('Network error reaching TMDB:', error);
    return [];
  }
}

export async function getMediaDetails(tmdbId, mediaType) {
  if (!tmdbId || !TMDB_API_KEY) return null;
  
  try {
    const isBearerToken = TMDB_API_KEY.length > 50;
    const url = isBearerToken 
      ? `${BASE_URL}/${mediaType}/${tmdbId}`
      : `${BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}`;

    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'HobifyApp/1.0',
    };

    if (isBearerToken) {
      headers['Authorization'] = `Bearer ${TMDB_API_KEY}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`TMDB Details Error: ${response.status}`);
    
    const data = await response.json();
    
    // Normalize runtime/duration
    // Movies have 'runtime' (minutes)
    // TV shows have 'episode_run_time' (array of minutes)
    let runtime = 0;
    if (mediaType === 'movie') {
      runtime = data.runtime || 0;
    } else if (mediaType === 'tv') {
      runtime = data.episode_run_time?.[0] || 0;
    }
    
    return {
      ...data,
      runtime
    };
  } catch (error) {
    console.error('Error fetching TMDB details:', error);
    return null;
  }
}
