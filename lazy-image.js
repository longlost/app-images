
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
  naturals,
  schedule,
  wait
} from '@longlost/app-core/utils.js';

import {AppImageMixin} from './app-image-mixin.js';

import htmlString from './lazy-image.html';
import '@polymer/iron-image/iron-image.js';


class LazyImage extends AppImageMixin(AppElement) {
  static get is() { return 'lazy-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      crossorigin: {
        type: String,
        value: 'anonymous'
      },

      // Must provide a placeholder, which is 
      // loaded to determine the image's aspect ratio.
      //
      // WARNING! - Use this carefully as it can lead to 
      //            poor UX caused by layout shifting.
      //
      // A valid 'placeholder' is required for auto-sizing.
      enableAutoSizing: Boolean,

      // Image orientation correction for 
      // photos captured on a device camera.
      orientation: Number,

      // Set this to a base64 string or 
      // thumbnail for fast initial loading.
      placeholder: String,

      placeholderError: Boolean,

      placeholderLoaded: Boolean,

      _elementType: {
        type: String,
        value: 'lazy-image',
        readOnly: true
      },

      // Set after element is visible on screen.
      _lazyPlaceholder: String,

      // Set after element is visible on screen.
      _lazySrc: String,

      // Determines when to use ResizeObserver to size the element
      // based on the image's intrisic sizing.
      // See 'app-image-mixin.js'.
      _shouldResize: {
        type: Boolean,
        computed: '__computeShouldResize(enableAutoSizing, orientation)'
      }
 
    }
  }


  static get observers() {
    return [
      '__enableAutoSizingLazyPlaceholderChanged(enableAutoSizing, _lazyPlaceholder)',
      '__orientationHeightWidthChanged(orientation, _height, _width)',
      '__placeholderErrorChanged(placeholderError)',
      '__placeholderLoadedChanged(placeholderLoaded)',
      '__placeholderSrcChanged(placeholder, src)'
    ];
  }


  __computeShouldResize(enable, orientation) {
    return enable || typeof orientation === 'number';
  }


  async __enableAutoSizingLazyPlaceholderChanged(enable, placeholder) {
    if (!enable || !placeholder || placeholder === '#') { return; }

    const {naturalHeight, naturalWidth} = await naturals(placeholder, this.crossorigin);

    this._naturalHeight = naturalHeight;
    this._naturalWidth  = naturalWidth;
  }


  __orientationHeightWidthChanged(num, height, width) {
    if (typeof num !== 'number' || !height || !width) { return; }

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
    this.fire(`${this._elementType}-placeholder-error-changed`, {value: error});
  }


  __placeholderLoadedChanged(loaded) {
    this.fire(`${this._elementType}-placeholder-loaded-changed`, {value: loaded});
  }


  async __placeholderSrcChanged(placeholder, src) {
    try {
      
      if (!placeholder && !src) { 
        this._lazyPlaceholder = '#';
        this._lazySrc         = '#';
        return; 
      }

      await isOnScreen(this, this.trigger);

      // NOTICE!! - NOT using closure values here to work
      // correctly within template repeaters
      // where data can be changed by the time the 
      // above schedule and isOnScreen have resolved.
      
      // Wait for placeholder to fully load or fail
      // before starting to load the src.
      if (this.placeholder && (this.placeholder !== this._lazyPlaceholder)) {        

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
      if (error === 'Element removed.') { return; } // Noop for isOnScreen rejection.
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

}

window.customElements.define(LazyImage.is, LazyImage);
