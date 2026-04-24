// Mock the environment variables BEFORE requiring the service
process.env.EXPO_PUBLIC_IGDB_CLIENT_ID = 'test_client_id';
process.env.EXPO_PUBLIC_IGDB_ACCESS_TOKEN = 'test_token';

// Use require to ensure env vars are set before module evaluation
const { searchGames } = require('../services/igdbService');

global.fetch = jest.fn();

describe('igdbService', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('searchGames returns mapped game data on success', async () => {
    const mockGames = [
      {
        id: 123,
        name: 'The Legend of Zelda',
        cover: { image_id: 'cover123' },
        first_release_date: 508636800, // 1986
        involved_companies: [
          { company: { name: 'Nintendo' } }
        ]
      }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGames,
    });

    const results = await searchGames('Zelda');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/games'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Client-ID': 'test_client_id',
          'Authorization': 'Bearer test_token',
        }),
      })
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({
      id: 'igdb_123',
      title: 'The Legend of Zelda',
      subtitle: 'Nintendo',
      coverUrl: 'https://images.igdb.com/igdb/image/upload/t_cover_big/cover123.jpg',
      releaseYear: '1986',
      type: 'game',
      originalData: mockGames[0]
    });
  });

  test('searchGames returns empty array on fetch failure', async () => {
    // Spy on console.error to suppress the expected error message in the console
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const results = await searchGames('Zelda');
    expect(results).toEqual([]);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error searching IGDB:'),
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  test('searchGames returns empty array if query is empty', async () => {
    const results = await searchGames('');
    expect(results).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });
});
