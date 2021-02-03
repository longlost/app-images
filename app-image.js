

/**
  * `app-image`
  * 
  *   A card-like button with an icon and text.
  *
  *
  *
  *  Properties:
  *
  *
  *    
  *
  *
  *
  *  Events:
  *
  *     'app-image-clicked' - Fired after the `paper-button` ripple animation completes from a click event.
  *   
  *  
  *  Methods:
  *
  *
  *
  *
  *
  *   @customElement
  *   @polymer
  *   @demo demo/index.html
  *
  *
  **/


import {
  AppElement, 
  html
} from '@longlost/app-core/app-element.js';

import {
  consumeEvent,
  getRootTarget, 
  hijackEvent, 
  schedule
} from '@longlost/app-core/utils.js';

import {AppImageMixin} from './app-image-mixin.js';

import htmlString from './app-image.html';
import '@longlost/app-core/app-shared-styles.js';
import '@polymer/paper-button/paper-button.js';


class AppImage extends AppImageMixin(AppElement) {

  static get is() { return 'app-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      // Sets the proportion of width to height.
      //
      // Defaults to 'fill' which grows to fill parent,
      // or use css to set width and height. This is similar
      // to the standard <img> or <iron-image> elements, except
      // with 'fill', width and height are preset to 100%.
      //
      // Can use the following presets - 
      //   'auto', 'classic', 'landscape', 'portrait' or 'square'.
      //
      // 'Auto' uses the image's intrinsic sizes (ie naturalWidth/naturalHeight)
      // to determine the aspect ratio.
      //
      // WARNING! - Use 'auto' carefully as it can lead to poor UX caused by layout shifting.
      //
      // Or pass any apect ratio value, such as '5 / 4' or '33.3%'.
      aspect: {
        type: String,
        value: 'fill',
        reflectToAttribute: true
      },

      // Set to true, to enable the button role mode. 
      //
      // The element will be reachalble via keyboard tabbing, and clickable. 
      // While focused, the 'enter' and 'spacebar' keys tigger click events.
      //
      // Button mode includes a material design ripple.
      //
      // The 'app-image-clicked' custom event is fired 
      // after click and the ripple animation has completed.
      button: {
        type: Boolean,
        value: false
      },

      // Not applicable when using 'responsive' images from webpack.
      crossorigin: {
        type: String,
        value: 'anonymous'
      },

      disabled: Boolean,

      icon: {
        type: String,
        value: 'app-image-icons:image'
      },

      // Image orientation correction for 
      // photos captured on a device camera.
      orientation: Number,

      // Only to be used when 'src' is a url string, 
      // otherwise this is auto-detected from 'src' object.
      //
      // Must be present when using 'aspect' set to 'auto'.
      placeholder: String,

      // The prefered quality level if 'srcType' is 'lazy', or auto-detect
      // determines that 'src' requires 'lazy-image' implementation.
      //
      // This is ignored if 'responsive-image' is being used, since
      // the browser is allowed to determine the quality/size via 'srcSet'.
      quality: {
        type: String,
        value: 'thumbnail' // Or 'optimized' or 'original'.
      },

      // Add a shadow. Passed to `paper-button` 'raised' property.
      raised: Boolean,

      srcType: String, // Set to 'url', 'file' or 'responsive' to override 'src' auto-detection.

      text: String,

      _alt: {
        type: String,
        computed: '__computeAlt(alt, src.description, src.displayName)'
      },

      _detectedType: {
        type: String,
        computed: '__computeDetectedType(src, srcType)'
      },

      // True when 'aspect' is set to 'auto' and '_detectedType' is 'file'.
      _enableLazyImageAutoSizing: {
        type: Boolean,
        value: false,
        computed: '__computeEnableLazyImageAutoSizing(aspect, _detectedType)'
      },

      // True when 'aspect' is set to 'auto' and '_detectedType' is 'responsive'.
      _enableResponsiveImageAutoSizing: {
        type: Boolean,
        value: false,
        computed: '__computeEnableResponsiveImageAutoSizing(aspect, _detectedType)'
      },

      _placeholder: {
        type: String,
        computed: '__computePlaceholder(placeholder, src, _detectedType)'
      },

      _ratio: {
        type: String,
        computed: '__computeRatio(aspect)'
      },

      // Determines when to use ResizeObserver to size the element
      // based on the image's intrisic sizing.
      //
      // True when 'aspect' is set to 'auto' and '_detectedType' is 'file'.
      //
      // See 'app-image-mixin.js'.
      _shouldResize: {
        type: Boolean,
        computed: '__computeShouldResize(aspect, _detectedType)'
      },

      _src: {
        type: String,
        computed: '__computeSrc(src, quality, _detectedType)'
      },

      _stampLazy: {
        type: Boolean,
        value: false,
        computed: '__computeStampLazy(_detectedType)'
      },

      _stampResponsive: {
        type: Boolean,
        value: false,
        computed: '__computeStampResponsive(_detectedType)'
      },

      _tabindex: {
        type: String,
        value: '-1',
        computed: '__computeTabindex(button, disabled)'
      }

    };
  }


  static get observers() {
    return [
      '__ratioChanged(_ratio)',
      '__stampLazyChanged(_stampLazy)',
      '__stampResponsiveChanged(_stampResponsive)'
    ];
  }


  __computeAlt(alt, description, displayName) {

    if (alt) { return alt; }

    if (description) { return description; }

    if (displayName) { return displayName; }

    return;
  }


  __computeDetectedType(src, type) {

    if (type && typeof type === 'string') {

      if (type === 'url' || type === 'file' || type === 'responsive') { 
        return type; 
      }

      throw new TypeError(`app-image 'type' is unknown.`);
    }

    if (!src) { return; }

    if (typeof src === 'string') { return 'url'; }

    if (src?.coll && src?.doc) { return 'file'; }

    if (src?.placeholder && src?.srcSet) { return 'responsive'; }

    throw new TypeError(`app-image 'src' type is unknown.`);
  }


  __computeEnableLazyImageAutoSizing(aspect, type) {

    return aspect === 'auto' && type === 'url';
  }


  __computeEnableResponsiveImageAutoSizing(aspect, type) {

    return aspect === 'auto' && type === 'responsive';
  }


  __computePlaceholder(placeholder, src, type) {

    if (placeholder) { return placeholder; }

    if (!src || !type || type === 'url') { return; }

    return type === 'file' ? src.thumbnail : src.placeholder;
  }

  // See 'app-image-mixin.js'.
  __computeShouldResize(aspect, type) {

    return aspect === 'auto' && type === 'file';
  }


  __computeSrc(src, quality, type) {

    if (!src || !quality || !type) { return; }

    if (type === 'url' || type === 'responsive') { return src; }

    const {_tempUrl, optimized, original, thumbnail} = src;

    // '_placeholder' is already set to this.
    if (quality === 'thumbnail' && thumbnail) { return; } 

    if (quality === 'optimized' && optimized) { return optimized; }

    return original ?? _tempUrl;
  }


  __computeStampLazy(type) {

    return type === 'url' || type === 'file';
  }


  __computeStampResponsive(type) {

    return type === 'responsive';
  }


  __computeTabindex(button, disabled) {

    return button && !disabled ? '0' : '-1';
  }


  __computeRatio(aspect) {

    switch (aspect) {

      case 'classic':
        return '4 / 3'; /* 4:3 ratio */
  
      case 'landscape':
        return '16 / 9'; /* 16:9 ratio */
  
      case 'portrait':
        return '9 / 16'; /* 9:16 ratio */
  
      case 'square':
        return '1'; /* 1:1 ratio */

      default:
        return aspect;
    }
  }


  __ratioChanged(ratio) {

    if (ratio === 'fill') {
      this.updateStyles({
        '--before-height':         'var(--before-fill-height)',
        '--before-padding-bottom': 'var(--before-fill-padding-bottom)'
      });
    }
    else {
      this.updateStyles({
        '--before-aspect-ratio':    ratio,
        '--before-height':         'var(--before-aspect-height)',
        '--before-padding-bottom': 'var(--before-aspect-padding-bottom)'
      });
    }
  }


  __stampLazyChanged(stamp) {

    if (stamp) {
      import(
        /* webpackChunkName: 'lazy-image' */ 
        './lazy-image.js'
      );
    }
  }


  __stampResponsiveChanged(stamp) {

    if (stamp) {
      import(
        /* webpackChunkName: 'responsive-image' */ 
        './responsive-image.js'
      );
    }
  }

  // <lazy-image> / <responsive-image> event handler.
  __errorChangedHandler(event) {

    hijackEvent(event);

    const {value} = event.detail;

    this.error = value;
  }

  // <lazy-image> / <responsive-image> event handler.
  async __loadedChangedHandler(event) {

    hijackEvent(event);

    const {value: loaded} = event.detail;

    this.loaded = loaded;

    if (!this.src || !this._detectedType === 'file') { return; }
    
    const {_tempUrl} = this.src;    

    if (loaded && _tempUrl) {
      await schedule(); // <lazy-image> workaround.
      
      try {
        window.URL.revokeObjectURL(_tempUrl);
      }
      catch (_) { /* noop */ }
    }
  }


  async __transitionendHandler(event) {
    
    try {

      consumeEvent(event);

      if (!this.button) { return; }

      // Guard against 'paper-button' 'box-shadow' transitionend 
      // event, which is erronious.
      if (getRootTarget(event)?.tagName !== 'PAPER-RIPPLE') { return; }

      await this.clicked();

      this.fire('app-image-clicked');
    }
    catch (error) {
      if (error === 'click debounced') { return; }
      console.error(error);
    }
  }

}

window.customElements.define(AppImage.is, AppImage);
