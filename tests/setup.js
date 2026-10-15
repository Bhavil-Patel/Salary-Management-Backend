// Silence noisy dotenv console banners and intentional error logs in test runs
const originalError = console.error;

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args) => {
    const msg = args.map(String).join(' ');
    if (
      msg.includes('injected env') ||
      msg.includes('error:') ||
      msg.includes('Internal server error') ||
      msg.includes('Database unavailable')
    ) {
      return;
    }
    originalError(...args);
  });
});

afterAll(() => {
  console.error.mockRestore?.();
});
