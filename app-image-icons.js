
import '@polymer/iron-iconset-svg/iron-iconset-svg.js';
import htmlString from './app-image-icons.html';

const imageIcons 		 = document.createElement('div');
imageIcons.innerHTML = htmlString;
imageIcons.setAttribute('style', 'display: none;');
document.head.appendChild(imageIcons);
