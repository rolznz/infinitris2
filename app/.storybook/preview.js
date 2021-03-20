import React from 'react';
import App from '@/App';
import { MemoryRouter } from 'react-router-dom';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};

export const decorators = [
  (Story) => (
    <App>
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    </App>
  ),
];
