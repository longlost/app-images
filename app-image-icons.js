
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import htmlString from './app-image-icons.html';

const appImageIcons     = document.createElement('div');
appImageIcons.innerHTML = htmlString;
appImageIcons.setAttribute('style', 'display: none;');
document.head.appendChild(appImageIcons);
