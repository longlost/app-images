
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
} from '@longlost/app-element/app-element.js';

import {
  hijackEvent,
  isOnScreen,
  schedule,
  wait
} from '@longlost/utils/utils.js';

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

      // Image orientation correction for 
      // photos captured on a device camera.
      orientation: Number,

      // Set this to a base64 string or 
      // thumbnail for fast initial loading.
      placeholder: String,

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

      // Fade the src only when there is no placeholder present.
      _fadeSrc: {
        type: Boolean,
        value: true,
        computed: '__computeFadeSrc(placeholder)'
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
      '__fadeScrChanged(_fadeSrc)',
      '__orientationChanged(orientation, _resized)', // '_resized' is only a trigger.
      '__placeholderSrcChanged(placeholder, src, trigger)',
      '__missingAlt(alt, src)'
    ];
  }


  connectedCallback() {
    super.connectedCallback();

    window.addEventListener('resize', this.__resizeHandler.bind(this));
  }


  disconnectedCallback() {
    super.disconnectedCallback();

    window.removeEventListener('resize', this.__resizeHandler.bind(this));
  }


  __computeFadeSrc(placeholder) {
    return !Boolean(placeholder);
  }

  // Fade in the `iron-image` if a placeholder is available,
  // and then instantly switch from placeholder to src when 
  // src is fully loaded. Otherwise, fade the src in.
  __fadeScrChanged(fade) {
    if (fade) {
      this.$.image.classList.remove('fade-placeholder');
    }
    else {
      this.$.image.classList.add('fade-placeholder');
    }
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


  __orientationChanged(num, resized) {
    if (typeof num !== 'number' || typeof resized !== 'boolean') { return; }

    const placeholderDiv = this.select('#placeholder', this.$.image);
    const srcDiv         = this.select('#sizedImgDiv', this.$.image);

    if (num <= 1) {
      [placeholderDiv, srcDiv].forEach(div => {
        div.style.height    = '100%';
        div.style.width     = '100%';
        div.style.top       = '0px';
        div.style.left      = '0px';
        div.style.transform = 'none';
      });
    }
    else {

      const {height, width} = this.$.image.getBoundingClientRect();      

      const rotations = {
        3: '180',
        6: '90',
        8: '-90'
      };

      const deg = rotations[num];

      const hRatio = deg === '180' ? 100 : ((width / height) * 100);
      const wRatio = deg === '180' ? 100 : ((height / width) * 100);

      [placeholderDiv, srcDiv].forEach(div => {
        div.style.height    = `${hRatio}%`;
        div.style.width     = `${wRatio}%`;
        div.style.top       = '50%';
        div.style.left      = '50%';
        div.style.transform = `translate(-50%, -50%) rotate(${deg}deg)`;
      });
    }
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

      this.$.image.classList.remove('fade-in');

      this.__setResized();

      // NOT using closure values here to work
      // correctly within template repeaters
      // where data can be changed by the time the 
      // above schedule and isOnScreen have resolved.
      
      if (this.placeholder) {
        this._lazyPlaceholder = this.placeholder;

        await schedule();

        this.$.image.classList.add('fade-in');

        await wait(550);
      }
      else {
        await schedule();
      }

      // NOT using closure values
      this._lazySrc = this.src || '#';
    }
    catch (error) {
      if (error === 'Element removed.') { return; }
      console.error(error);
    }
  }

  // Release memory resources.
  async __loadedChanged(event) {
    hijackEvent(event);

    const {value: loaded} = event.detail;

    this.fire('lazy-image-loaded-changed', {value: loaded});

    if (loaded) {
      await wait(500); // Wait for src to fade in.
      this._lazyPlaceholder = '#';
    }
  }

}

window.customElements.define(LazyImage.is, LazyImage);
