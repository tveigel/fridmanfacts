export const useModeration = jest.fn(() => ({
    isModerator: false,
    isAdmin: false,
    loading: false
  }));
  
  export default useModeration;