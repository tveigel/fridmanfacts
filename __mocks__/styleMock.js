// __mocks__/styleMock.js
module.exports = {
    // Mock style module exports
    // This handles both CSS Modules and regular CSS imports
    __esModule: true,
    default: new Proxy({}, {
      get: function getter(target, key) {
        // Return the key as the className for CSS modules
        return key;
      }
    })
  };