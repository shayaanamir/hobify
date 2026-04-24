import authReducer, { 
  clearAuthError, 
  sessionExpired, 
  signUpUser 
} from '../slices/authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    isLoggedIn: false,
    user: null,
    status: 'idle',
    error: null,
    isRestoringSession: true,
  };

  test('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  test('should handle clearAuthError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const actual = authReducer(stateWithError, clearAuthError());
    expect(actual.error).toBeNull();
  });

  test('should handle sessionExpired', () => {
    const stateLoggedIn = { ...initialState, isLoggedIn: true, user: { uid: '123' } };
    const actual = authReducer(stateLoggedIn, sessionExpired());
    expect(actual.isLoggedIn).toBe(false);
    expect(actual.user).toBeNull();
  });

  test('should handle signUpUser.pending', () => {
    const action = { type: signUpUser.pending.type };
    const actual = authReducer(initialState, action);
    expect(actual.status).toBe('loading');
    expect(actual.error).toBeNull();
  });

  test('should handle signUpUser.fulfilled', () => {
    const mockUser = { uid: '123', name: 'John' };
    const action = { type: signUpUser.fulfilled.type, payload: mockUser };
    const actual = authReducer(initialState, action);
    expect(actual.status).toBe('succeeded');
    expect(actual.isLoggedIn).toBe(true);
    expect(actual.user).toEqual(mockUser);
  });

  test('should handle signUpUser.rejected', () => {
    const action = { type: signUpUser.rejected.type, payload: 'Signup failed' };
    const actual = authReducer(initialState, action);
    expect(actual.status).toBe('failed');
    expect(actual.error).toBe('Signup failed');
  });
});
