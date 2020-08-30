
/**
  * `responsive-image`
  * 
  *    Auto lazy loads when in view.
  *
  *    Works in conjunction with static images that 
  *    are handled by webpack responsive-loader.
  * 
  *
  *
  * @customElement
  * @polymer
  * @demo demo/index.html
  *
  * 
  **/

import {
  AppElement, 
  html
} from '@longlost/app-element/app-element.js';

import {
  isOnScreen, 
  schedule,
  wait
} from '@longlost/utils/utils.js';

import htmlString from './responsive-image.html';


class ResponsiveImage extends AppElement {
  static get is() { return 'responsive-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      // Image alt tag.
      alt: {
        type: String,
        value: ''
      },

      disableAutoSizing: {
        type: Boolean,
        value: false
      },

      // Disable opacity transition.
      noFade: Boolean,

      // Image object from webpack responsive-loader import.
      responsive: Object,

      // Image sizing type.
      sizing: {
        type: String,
        value: 'cover' // or 'contain'
      },

      // The distance in pixels to pad
      // to the carousel trigger threshold.
      // For instance, 0 would mean that the
      // next lazy image would not start to download
      // until a single pixel intersects the edge of
      // the carousel.
      // Or 128 means that the image would start to
      // download 128px before the next image comes
      // into view.
      trigger: {
        type: Number,
        value: 0
      },

      _aspectRatio: {
        type: Number,
        computed: '__computeAspectRatio(responsive.height, responsive.width, sizing, disableAutoSizing)'
      },

      _noFadeClass: {
        type: Boolean,
        computed: '__computeNoFadeClass(noFade)'
      }

    };
  }


  static get observers() {
    return [
      '__responsiveChanged(responsive)',
      '__sizingChanged(sizing)',
      '__missingAlt(alt)'
    ];
  }


  constructor() {
    super();

    this.__resizeHandler = this.__resizeHandler.bind(this);
  }


  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this.__resizeHandler);
  }


  __computeAspectRatio(height, width, sizing, disableAutoSizing) {
    if (disableAutoSizing)    { return 0; }
    if (sizing === 'contain') { return 0; }
    if (!height || !width)    { return 0; }
    return width / height;
  }


  __computeNoFadeClass(noFade) {
    return noFade ? 'no-fade' : '';
  }


  __sizingChanged(sizing) {
    this.$.placeholder.style.backgroundSize = sizing;
    this.$.sizedImgDiv.style.backgroundSize = sizing;
  }


  __missingAlt(alt) {
    if (!alt) {
      console.warn('Missing alt tag: ', this);
    } 
  }


  async __resizeHandler() {
    await schedule();
    this.resize();
  }


  async __responsiveChanged(responsive) {
    try {      
      if (!responsive) { return; }

      // Webpack config responsive loader output sizes: 300, 600, 900, 1200, 1500.
      // Media breakpoints: 480px, 768px, 1025px, 1281px, 1824px.
      this.$.image.sizes = `
        (max-width: 480px) 300px,
        (max-width: 768px) 600px,
        (max-width: 1024px) 900px,
        (max-width: 1280px) 1200px
        1500px
      `;

      // Reset for new images.
      this.$.sizedImgDiv.style.opacity = '0';

      window.removeEventListener('resize', this.__resizeHandler);

      if (this._aspectRatio) {

        this.__resizeHandler();

        window.addEventListener('resize', this.__resizeHandler);
      }

      // Wait for dom to settle.
      await schedule(); 
      await isOnScreen(this, this.trigger);

      // NOT using closure values here to work
      // correctly within template repeaters
      // where data can be changed by the time the 
      // above schedule and isOnScreen have resolved.

      const {placeholder} = this.responsive;
      this.$.placeholder.style.backgroundImage = `url(${placeholder})`;

      await schedule();

      const {src, srcSet} = this.responsive;
      this.$.image.srcset = srcSet;
      this.$.image.src    = src;
    }
    catch (error) {
      if (error === 'Element removed.') { return; } // Noop for isOnScreen rejection.
      console.error(error);
    }
  }


  async __imgLoaded() {
    this.fire('loaded');

    await schedule();

    this.$.sizedImgDiv.style.backgroundImage = `url(${this.$.image.currentSrc})`;
    this.$.sizedImgDiv.style.opacity = '1';

    // Cannot rely on transitionend not getting trampled.
    await wait(300); 

    this.$.placeholder.style.backgroundImage = 'url(#)';
  }


  resize() {
    if (!this._aspectRatio) { return; }

    const {width} = this.getBoundingClientRect();

    if (!width) { return; } 

    this.style.height = `${width / this._aspectRatio}px`;
  }

}

window.customElements.define(ResponsiveImage.is, ResponsiveImage);
