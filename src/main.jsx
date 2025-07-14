
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Prevent multiple root creation during HMR
const rootElement = document.getElementById('root');
if (!rootElement._reactRoot) {
  const root = ReactDOM.createRoot(rootElement);
  rootElement._reactRoot = root;
  root.render(<App />);
} else {
  rootElement._reactRoot.render(<App />);
}

// Handle unhandled promise rejections that cause multiple preview tabs
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection prevented:', event.reason);
  event.preventDefault();
});

// Handle HMR connection issues
if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    console.log('HMR update starting...');
  });
  
  import.meta.hot.on('vite:error', (err) => {
    console.error('HMR error:', err);
  });
}
