
/**
  * `flip-image`
  * 
  *   Image entry animation interstitial 
  *   that uses the FLIP method which was
  *   created by Paul Lewis (aerotwist).
  *
  *   An image of any size and location on screen can be
  *   enlarged and placed in a new location with this animation.
  *
  *
  *
  *
  *  Properites:
  *
  *
  *   measurements - <Object>, required.
  *
  *     Initial placement of chosen photo to animate from.
  *     A getBoundingClientRect object.
  *
  *
  *   src - <String>, required.
  *
  *     HTML <img/> element src string.
  *
  *
  *   transition - <String>, optional.
  *
  *     Default - 'transform 0.5s cubic-bezier(0.49, 0.01, 0, 1)'.
  *     Css transition string.
  *
  *
  *
  *   
  *  
  *  Methods:
  *
  *
  *    play() - Void --> Promise --> Void
  *     
  *      Run the FLIP animation.
  *
  *
  *
  *    reset() - Void --> Promise --> Void
  *     
  *      Closes/resets FLIP element. Must be called before further animations
  *
  *
  *
  *   @customElement
  *   @polymer
  *   @demo demo/index.html
  *
  *
  **/


import {AppElement, html}   from '@longlost/app-element/app-element.js';
import {flip}               from '@longlost/animation/animation.js';
import {naturals, schedule} from '@longlost/utils/utils.js';
import correction           from './flip-correction.js';
import htmlString           from './flip-image.html';


class FlipImage extends AppElement {
  static get is() { return 'flip-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return { 

      // <img/> alt property.
      alt: {
        type: String,
        value: 'FLIP animation interstitial.'
      }, 

      // Initial placement of chosen photo to animate from.
      // A getBoundingClientRect object.
      measurements: Object,

      // Image orientation correction.
      orientation: Number,

      sizing: {
        type: String,
        value: 'cover' // Or 'contain'.
      },

      // Img element src string.
      src: String,

      // Css transition string.
      transition: {
        type: String,
        value: 'transform 0.5s cubic-bezier(0.49, 0.01, 0, 1)'
      },

      _rotation: {
        type: String,
        computed: '__computeRotation(orientation)'
      }

    };
  }


  __computeRotation(orientation) {
    switch (orientation) {
      case 3:
        return '180';
      case 6:
        return '90';
      case 8:
        return '-90';
      default:
        return '0';
    } 
  }


  async play() {

    // Load image to get natural sizing and 
    // guarantee image is rendered before 
    // performing animation.
    const {naturalHeight, naturalWidth} = await naturals(this.src);

    this.style['display'] = 'flex';

    const first = this.measurements;
    const last  = this.getBoundingClientRect();

    // Not setting these styles directly on this.$.outter
    // because the flip animation uses css classes to override
    // styles from initial size and placement, to final state.
    this.updateStyles({
      '--first-top' :    `${first.top}px`,
      '--first-left' :   `${first.left}px`,
      '--first-height' : `${first.height}px`,
      '--first-width' :  `${first.width}px`
    }); 


    // FLIP process scales the container up or down to match
    // its starting size, so these calculations counter-act
    // the distortion that it creates.
    const info = {
      first, 
      last, 
      naturalHeight, 
      naturalWidth, 
      rotation: this._rotation, 
      sizing:   this.sizing
    };

    const {w, x, y} = correction(info);
    
    const correctionPromise = async () => {

      if (this._rotation) {
        this.$.rotate.style['transform'] = `rotate(${this._rotation}deg)`;
      }      

      this.$.img.style['width']     = `${w}px`; 
      this.$.img.style['transform'] = `translate(-50%, -50%) scale(${x}, ${y})`;

      await schedule();

      this.$.img.style['transform']  = '';
      this.$.img.style['transition'] = this.transition;
    };


    const flipPromise = flip({
      css:       'last',
      element:    this.$.outter,
      transition: this.transition
    });

    return Promise.all([correctionPromise(), flipPromise]);
  }

  // Use this method to clear the element 
  // once it is not needed anymore, 
  // or if it is to be played again.
  reset() {
    this.style['display'] = 'none';

    this.$.outter.classList.remove('last');
    this.$.outter.style['transition'] = 'none';

    this.$.img.style['transform']  = '';
    this.$.img.style['transition'] = 'none';  
    this.$.img.style['width']      = '100%';
  }

}

window.customElements.define(FlipImage.is, FlipImage);
