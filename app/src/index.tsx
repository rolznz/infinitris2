import './firebase/index';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import Loader from './components/ui/Loader';
import PageRouter from './PageRouter';

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

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
