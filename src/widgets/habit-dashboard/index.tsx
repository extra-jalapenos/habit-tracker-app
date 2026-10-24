import React from 'react';
import ReactDOM from 'react-dom';
import { App } from './app';
import './app.css';

async function main() {
  const host = await YTApp.register();
  const root = document.getElementById('app-root');
  if (root) {
    ReactDOM.createRoot(root).render(<App host={host} />);
  }
}

main();
