import '@testing-library/jest-dom'

// Polyfill ResizeObserver for testing components that use it (e.g., Recharts)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};