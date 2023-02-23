
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

import {AppElement} from '@longlost/app-core/app-element.js';

import {
  consumeEvent, 
  naturals, 
  schedule
} from '@longlost/app-core/utils.js';

import {AppImageMixin} from './app-image-mixin.js';

import template from './lazy-image.html';
import '@polymer/iron-icon/iron-icon.js';
import './app-image-icons.js';


class LazyImage extends AppImageMixin(AppElement) {
  
  static get is() { return 'lazy-image'; }

  static get template() { return template; }


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

      fadedIn: Boolean,

      icon: {
        type: String,
        value: 'app-image-icons:image'
      },

      // Image orientation correction for 
      // photos captured on a device camera.
      orientation: Number,

      // Set this to a base64 string or 
      // thumbnail for fast initial loading.
      placeholder: String,

      placeholderError: Boolean,

      placeholderFadedIn: Boolean,

      placeholderLoaded: Boolean,

      // When a sizing option is used (`cover` or `contain`), 
      // this determines how the image is aligned within the 
      // element bounds.
      position: {
        type: String, 
        value: 'center'
      },

      _elementType: {
        type: String,
        value: 'lazy-image',
        readOnly: true
      },

      _noFadeClass: {
        type: String,
        computed: '__computeNoFadeClass(noFade)'
      },

      _placeholder: {
        type: String,
        computed: '__computeImgSrc(placeholder)'
      },

      // Determines when to use ResizeObserver to size the element
      // based on the image's intrisic sizing.
      // See 'app-image-mixin.js'.
      _shouldResize: {
        type: Boolean,
        computed: '__computeShouldResize(enableAutoSizing, orientation)'
      },

      _src: {
        type: String,
        computed: '__computeImgSrc(src)'
      }
 
    }
  }


  static get observers() {
    return [
      '__enableAutoSizingLazyPlaceholderChanged(enableAutoSizing, _lazyPlaceholder)',
      '__fadedInChanged(fadedIn)',
      '__orientationHeightWidthChanged(orientation, _height, _width)',
      '__placeholderErrorChanged(placeholderError)',
      '__placeholderFadedInChanged(placeholderFadedIn)',
      '__placeholderLoadedChanged(placeholderLoaded)',
      '__positionSizingChanged(position, sizing)',
      '__updatePlaceholderDiv(_placeholder, placeholderLoaded)',
      '__updateSrcDiv(_src, loaded)'
    ];
  }


  __computeNoFadeClass(noFade) {

    return noFade ? 'no-fade' : '';
  }

  // Use hash as a default to clear img tags.
  __computeImgSrc(str = '#') {

    return str;
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


  __fadedInChanged(fadedIn) {

    if (fadedIn) {

      // Release unused resources.
      this.$.placeholderImg.src                    = '#';
      this.$.placeholder.style['background-image'] = 'url(#)';
      this.$.placeholder.classList.remove('show');      

      this.fire(`${this._elementType}-faded-in`);
    }
  }


  __orientationHeightWidthChanged(num, height, width) {

    if (typeof num !== 'number' || !height || !width) { return; }

    const divs = [this.$.placeholder, this.$.src];

    if (num <= 1) {
      divs.forEach(div => {
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

      divs.forEach(div => {
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


  __placeholderFadedInChanged(fadedIn) {

    if (fadedIn) {

      this.fire(`${this._elementType}-placeholder-faded-in`);
    }
  }


  __placeholderLoadedChanged(loaded) {

    this.fire(`${this._elementType}-placeholder-loaded-changed`, {value: loaded});
  }


  __positionSizingChanged(position, sizing) {

    this.$.placeholder.style['background-size'] = sizing;
    this.$.src.style['background-size']         = sizing;

    if (sizing) {
      this.$.placeholder.style['background-position'] = position;
      this.$.src.style['background-position']         = position;
      this.$.placeholder.style['background-repeat']   = 'no-repeat';
      this.$.src.style['background-repeat']           = 'no-repeat';
    }
    else {
      this.$.placeholder.style['background-position'] = '';
      this.$.src.style['background-position']         = '';
      this.$.placeholder.style['background-repeat']   = '';
      this.$.src.style['background-repeat']           = '';
    }
  }


  __updatePlaceholderDiv(placeholder, loaded) {

    if (loaded) {

      this.$.placeholder.style['background-image'] = `url(${placeholder})`;
      this.$.placeholder.classList.add('show');

      return;
    }

    this.$.placeholder.style['background-image'] = 'url(#)';
    this.$.placeholder.classList.remove('show');
  }


  __updateSrcDiv(src, loaded) {

    if (loaded) {
      
      this.$.src.style['background-image'] = `url(${src})`;
      this.$.src.classList.add('show');

      return;
    }

    this.$.src.style['background-image'] = 'url(#)';
    this.$.src.classList.remove('show');
  }


  __placeholderErrorHandler(event) {

    consumeEvent(event);

    this.placeholderError   = true;
    this.placeholderFadedIn = false;
    this.placeholderLoaded  = false;
  }


  async __placeholderLoadHandler(event) {

    consumeEvent(event);

    // An attempt to reduce occurrences of 
    // "loaded but not painted" situations.
    await schedule();  

    this.placeholderError  = false;
    this.placeholderLoaded = true;
  }


  __placeholderAnimationHandler(event) {

    consumeEvent(event);

    this.placeholderFadedIn = true;
  }


  __srcErrorHandler(event) {

    consumeEvent(event);

    this.error   = true;
    this.fadedIn = false;
    this.loaded  = false;
  }


  async __srcLoadHandler(event) {

    consumeEvent(event);

    // An attempt to reduce occurrences of 
    // "loaded but not painted" situations.
    await schedule();

    this.error  = false;
    this.loaded = true;
  }


  __srcAnimationHandler(event) {

    consumeEvent(event);

    this.fadedIn = true;
  }

}

window.customElements.define(LazyImage.is, LazyImage);
