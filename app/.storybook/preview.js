import React from 'react';
import App from '@/App';
import { MemoryRouter } from 'react-router-dom';
import './storybook.css';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  layout: 'fullscreen',
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
