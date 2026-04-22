const BASE_URL = 'https://openlibrary.org';

export async function searchBooks(query) {
  if (!query) return [];

  try {
    const response = await fetch(`${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`);

    if (!response.ok) {
      throw new Error(`OpenLibrary Error: ${response.status}`);
    }

    const data = await response.json();

    return data.docs.map(book => {
      const coverUrl = book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
        : null;
        
      const author = book.author_name && book.author_name.length > 0 
        ? book.author_name[0] 
        : 'Unknown Author';

      return {
        id: `ol_${book.key.replace('/works/', '')}`,
        title: book.title,
        subtitle: author,
        coverUrl,
        releaseYear: book.first_publish_year ? book.first_publish_year.toString() : '',
        type: 'book',
        originalData: book
      };
    });

  } catch (error) {
    console.error('Error searching OpenLibrary:', error);
    return [];
  }
}

export async function getBookDetails(workId) {
  if (!workId) return null;

  try {
    const response = await fetch(`${BASE_URL}/works/${workId}.json`);
    if (!response.ok) throw new Error(`OpenLibrary Details Error: ${response.status}`);
    const data = await response.json();
    
    // Summary can be a string or an object { type: '...', value: '...' }
    const description = typeof data.description === 'string' 
      ? data.description 
      : data.description?.value || '';

    return {
      ...data,
      description
    };
  } catch (error) {
    console.error('Error fetching OpenLibrary details:', error);
    return null;
  }
}
