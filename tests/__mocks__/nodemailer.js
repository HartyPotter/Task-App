const createTransport = jest.fn(() => ({
    sendMail: jest.fn(),
  }));
  
  module.exports = {
    createTransport,
  };