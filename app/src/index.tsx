import './firebase/index';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import smoothscroll from 'smoothscroll-polyfill';
smoothscroll.polyfill();

ReactDOM.render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>,
  document.getElementById('root')
);
//window.addEventListener('selectstart', function(e){ e.preventDefault(); });
document.onfullscreenerror = (event) => {
  console.error(event);
};
