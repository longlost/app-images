
/**
  * `avatar-image`
  *
  *   Displays a profile image with a placeholder account icon and circular masking.
  *
  *
  *
  * @customElement
  * @polymer
  * @demo demo/index.html
  *
  *
  **/

import {AppElement, html} from '@longlost/app-core/app-element.js';
import {hijackEvent}      from '@longlost/app-core/utils.js';
import htmlString         from './avatar-image.html';
import './app-image.js';
import './app-image-icons.js';


class AvatarImage extends AppElement {

  static get is() { return 'avatar-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {

      // Image alt tag.
      alt: {
        type: String,
        value: 'Profile avatar.'
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

      error: Boolean,

      icon: {
        type: String,
        value: 'app-image-icons:account-circle'
      },

      loaded: Boolean,

      // Disable opacity transitions.
      noFade: Boolean,

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

      // 'app-image' - URL String, or 
      //               an image Object from webpack 'resonsive-loader' or
      //               a file item Object originating from use of 'app-file-system'.
      //
      // 'lazy-image' - Full quality image url string.
      //
      // 'responsive-image' - Image object from webpack responsive-loader import.
      src: Object,

      srcType: String, // Set to 'url', 'file' or 'responsive' to override 'src' auto-detection.

      text: String,

      // The distance in pixels to pad
      // to the carousel trigger threshold.
      //
      // For instance, 0 would mean that the
      // next lazy image would not start to download
      // until a single pixel intersects the edge of
      // the carousel.
      //
      // Or 128 means that the image would start to
      // download 128px before the next image comes
      // into view.
      trigger: {
        type: Number,
        value: 0
      }

    }
  }


  static get observers() {
    return [
      '__errorChanged(error)',
      '__loadedChanged(loaded)'
    ];
  }


  __errorChanged(error) {

    this.fire('avatar-image-error-changed', {value: error});
  }


  __loadedChanged(loaded) {

    this.fire('avatar-image-loaded-changed', {value: loaded});
  }


  __errorChangedHandler(event) {

    hijackEvent(event);

    this.error = event.detail.value;
  }

  
  __loadedChangedHandler(event) {

    hijackEvent(event);

    this.loaded = event.detail.value;
  }


  __avatarClicked(event) {
    
    hijackEvent(event);

    this.fire('avatar-image-clicked');
  }

}

window.customElements.define(AvatarImage.is, AvatarImage);
