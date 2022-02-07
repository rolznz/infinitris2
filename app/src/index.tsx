import './firebase/index';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Loader from './components/ui/Loader';
import PageRouter from './PageRouter';
import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

ReactDOM.render(
  <React.StrictMode>
    <App>
      <Loader>
        <PageRouter />
      </Loader>
    </App>
  </React.StrictMode>,
  document.getElementById('root')
);
