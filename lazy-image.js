
/**
  * `lazy-image`
  *
  *   Lazy loads image placeholder and src once in view.
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
} from '@longlost/app-core/app-element.js';

import {
  hijackEvent,
  isOnScreen,
  schedule,
  wait
} from '@longlost/app-core/utils.js';

import htmlString from './lazy-image.html';
import '@polymer/iron-image/iron-image.js';


class LazyImage extends AppElement {
  static get is() { return 'lazy-image'; }

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

      crossorigin: {
        type: String,
        value: 'anonymous'
      },

      error: Boolean,

      loaded: Boolean,

      noFade: {
        type: Boolean,
        value: false
      },

      // Image orientation correction for 
      // photos captured on a device camera.
      orientation: Number,

      // Set this to a base64 string or 
      // thumbnail for fast initial loading.
      placeholder: String,

      placeholderError: Boolean,

      placeholderLoaded: Boolean,

      // Image sizing type.
      sizing: {
        type: String,
        value: 'cover' // Or 'contain'.
      },

      // Full image url string.
      src: String,

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

      // Set after element is visible on screen.
      _lazyPlaceholder: String,

      // Set after element is visible on screen.
      _lazySrc: String,

      // Triggers '__orientationChanged'.
      _resized: Boolean
 
    }
  }


  static get observers() {
    return [
      '__errorChanged(error)',
      '__loadedChanged(loaded)',
      '__orientationChanged(orientation, _resized)', // '_resized' is only a trigger.
      '__placeholderErrorChanged(placeholderError)',
      '__placeholderLoadedChanged(placeholderLoaded)',
      '__placeholderSrcChanged(placeholder, src, trigger)',
      '__missingAlt(alt, src)'
    ];
  }


  connectedCallback() {
    super.connectedCallback();

    this.__resizeHandler = this.__resizeHandler.bind(this);

    window.addEventListener('resize', this.__resizeHandler);
  }


  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this.__resizeHandler);
  }


  __setResized() {
    this._resized = typeof this._resized === 'boolean' ? !this._resized : true;
  }


  async __resizeHandler() {
    await schedule(); // Allow first layout/paint before measuring
    await isOnScreen(this, this.trigger);
    
    this.__setResized();
  }


  __missingAlt(alt, src) {
    if (!alt && (src && src !== '#')) {
      console.warn(this, ` Missing alt tag for ${src}`);
    } 
  }


  __errorChanged(error) {
    this.fire('lazy-image-error-changed', {value: error});
  }


  __loadedChanged(loaded) {
    this.fire('lazy-image-loaded-changed', {value: loaded});
  }


  __orientationChanged(num, resized) {
    if (typeof num !== 'number' || typeof resized !== 'boolean') { return; }

    const plhPlaceholderDiv = this.select('#placeholder', this.$.placeholder);
    const plhSrcDiv         = this.select('#sizedImgDiv', this.$.placeholder);
    const srcPlaceholderDiv = this.select('#placeholder', this.$.src);
    const srcSrcDiv         = this.select('#sizedImgDiv', this.$.src);

    if (num <= 1) {
      [plhPlaceholderDiv, plhSrcDiv, srcPlaceholderDiv, srcSrcDiv].forEach(div => {
        div.style.height    = '100%';
        div.style.width     = '100%';
        div.style.top       = '0px';
        div.style.left      = '0px';
        div.style.transform = 'none';
      });
    }
    else {

      const {height, width} = this.getBoundingClientRect();      

      const rotations = {
        3: '180',
        6: '90',
        8: '-90'
      };

      const deg = rotations[num];

      const hRatio = deg === '180' ? 100 : ((width / height) * 100);
      const wRatio = deg === '180' ? 100 : ((height / width) * 100);

      [plhPlaceholderDiv, plhSrcDiv, srcPlaceholderDiv, srcSrcDiv].forEach(div => {
        div.style.height    = `${hRatio}%`;
        div.style.width     = `${wRatio}%`;
        div.style.top       = '50%';
        div.style.left      = '50%';
        div.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
      });
    }
  }


  __placeholderErrorChanged(error) {
    this.fire('lazy-image-placeholder-error-changed', {value: error});
  }


  __placeholderLoadedChanged(loaded) {
    this.fire('lazy-image-placeholder-loaded-changed', {value: loaded});
  }


  __waitForPlaceholder() {
    return new Promise(resolve => {

      const handler = event => {
        const {value} = event.detail;

        if (value) {
          this.$.placeholder.removeEventListener('loaded-changed', handler);
          this.$.placeholder.removeEventListener('error-changed',  handler);

          resolve();
        }
      };

      this.$.placeholder.addEventListener('loaded-changed', handler);
      this.$.placeholder.addEventListener('error-changed',  handler);
    });
  }


  async __placeholderSrcChanged(placeholder, src, trigger) {
    try {
      
      if (!placeholder && !src) { 
        this._lazyPlaceholder = '#';
        this._lazySrc         = '#';
        return; 
      }

      await schedule(); // Allow first layout/paint before measuring
      await isOnScreen(this, trigger);

      this.__setResized();

      // NOTICE!! - NOT using closure values here to work
      // correctly within template repeaters
      // where data can be changed by the time the 
      // above schedule and isOnScreen have resolved.
      
      // Wait for placeholder to fully load or fail
      // before starting to load the src.
      if (this.placeholder) {        

        this.$.src.style['background-color'] = 'transparent';

        await schedule();

        this._lazyPlaceholder = this.placeholder;

        await this.__waitForPlaceholder();
      }
      else {
        this.$.src.style['background-color'] = 'inherit';
      }

      await schedule();

      // NOT using closure values here!
      this._lazySrc = this.src || '#';
    }
    catch (error) {
      if (error === 'Element removed.') { return; }
      console.error(error);
    }
  }


  __placeholderErrorChangedHandler(event) {

    // NOT using `hijackEvent`, `consumeEvent` or 
    // `event.stopImmediatePropagation` here as to 
    // not break the listeners in the 
    // `__waitForPlaceholder` method.
    event.stopPropagation();

    this.placeholderError = event.detail.value;
  }


  __placeholderLoadedChangedHandler(event) {

    // NOT using `hijackEvent`, `consumeEvent` or 
    // `event.stopImmediatePropagation` here as to 
    // not break the listeners in the 
    // `__waitForPlaceholder` method.
    event.stopPropagation();

    this.placeholderLoaded = event.detail.value;
  }


  __errorChangedHandler(event) {
    hijackEvent(event);

    this.error = event.detail.value;
  }

  
  async __loadedChangedHandler(event) {
    hijackEvent(event);

    this.loaded = event.detail.value;

    if (this.loaded) {
      await wait(500); // Wait for src to fade in.

      // Release memory resources.
      this._lazyPlaceholder = '#';
    }
  }

}

window.customElements.define(LazyImage.is, LazyImage);
