
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
} from '@longlost/app-core/app-element.js';

import {
  consumeEvent,
  isOnScreen, 
  schedule,
  wait
} from '@longlost/app-core/utils.js';

import {AppImageMixin} from './app-image-mixin.js';

import htmlString from './responsive-image.html';


class ResponsiveImage extends AppImageMixin(AppElement) {
  
  static get is() { return 'responsive-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      disableAutoSizing: Boolean,

      _elementType: {
        type: String,
        value: 'responsive-image',
        readOnly: true
      },

      // Determines when to use ResizeObserver to size the element
      // based on the image's intrisic sizing.
      // See 'app-image-mixin.js'.
      _shouldResize: {
        type: Boolean,
        computed: '__computeShouldResize(disableAutoSizing, _aspect)'
      }

    };
  }


  static get observers() {
    return [
      '__sizingChanged(sizing)',
      '__srcChanged(src, customElementConnected)'
    ];
  }


  __computeShouldResize(disable, aspect) {

    return !disable && typeof aspect === 'number';
  }


  __sizingChanged(sizing) {

    this.$.placeholder.style.backgroundSize = sizing;
    this.$.sizedImgDiv.style.backgroundSize = sizing;
  }


  async __srcChanged(obj, connected) {

    try {      
      if (!obj || !connected) { return; }

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

      await schedule(); // Wait for dom to stamp.

      // Double check that this and its child are still active dom nodes.
      if (
        this               instanceof Element === false || 
        this.$.placeholder instanceof Element === false
      ) { return; }

      await isOnScreen(this.$.placeholder, this.trigger);

      // NOT using closure values here to work
      // correctly within template repeaters
      // where data can be changed by the time the 
      // above schedule and isOnScreen have resolved.

      const {placeholder} = this.src;
      this.$.placeholder.style.backgroundImage = `url(${placeholder})`;

      await schedule();

      const {src, srcSet} = this.src;
      this.$.image.srcset = srcSet;
      this.$.image.src    = src;
    }
    catch (error) {
      if (error === 'Element removed.') { return; } // Noop for isOnScreen rejection.
      console.error(error);
    }
  }


  __errorHandler(event) {

    consumeEvent(event);

    this.loaded = false;
    this.error  = true;
  }


  async __loadHandler(event) {

    consumeEvent(event);

    this.loaded = true;
    this.error  = false;

    await schedule();

    this.$.sizedImgDiv.style.backgroundImage = `url(${this.$.image.currentSrc})`;
    this.$.sizedImgDiv.style.opacity = '1';

    // Cannot rely on transitionend not getting trampled.
    await wait(300); 

    this.$.placeholder.style.backgroundImage = 'url(#)';
  }

}

window.customElements.define(ResponsiveImage.is, ResponsiveImage);
