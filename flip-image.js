
/**
  * `flip-image`
  * 
  *   Image entry animation intersticial 
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
  *   @customElement
  *   @polymer
  *   @demo demo/index.html
  *
  *
  **/


import {
  AppElement, 
  html
}                 from '@longlost/app-element/app-element.js';
import {flip}     from '@longlost/animation/animation.js';
import {schedule} from '@longlost/utils/utils.js';
import htmlString from './flip-image.html';


const getImgNaturals = src => {

  const img = new Image();

  return new Promise((resolve, reject) => {

    img.onload = () => {
      resolve({
        naturalHeight: img.naturalHeight, 
        naturalWidth:  img.naturalWidth
      });
    };

    img.onerror = reject;

    img.src = src;
  });
};


class FlipImage extends AppElement {
  static get is() { return 'flip-image'; }

  static get template() {
    return html([htmlString]);
  }


  static get properties() {
    return {      

      // Initial placement of chosen photo to animate from.
      // A getBoundingClientRect object.
      measurements: Object,

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
      }

    };
  }


  static get observers() {
    return [
      '__measurementsChanged(measurements)'
    ];
  }


  __measurementsChanged(measurements) {
    if (!measurements) { return; }

    const {height, left, top, width} = measurements;

    this.updateStyles({
      '--first-top' :    `${top}px`,
      '--first-left' :   `${left}px`,
      '--first-height' : `${height}px`,
      '--first-width' :  `${width}px`
    });   
  }


  async play() {

    const {naturalHeight, naturalWidth} = await getImgNaturals(this.src);

    this.style['display'] = 'flex';

    // FLIP process scales the container up or down to match
    // its starting size, so these calculations counter-act
    // the distortion that it creates.

    const first = this.measurements;
    const last  = this.getBoundingClientRect();

    const firstAspect = first.width  / first.height;
    const lastAspect  = last.width   / last.height;
    const imgAspect   = naturalWidth / naturalHeight;

    const imgWidth = this.sizing === 'cover' ? 
      Math.max(last.width, (last.height * imgAspect)) : 
      Math.min(last.width, (last.height * imgAspect));

    const widthRatio  = last.width  / imgWidth;
    const heightRatio = last.height / imgWidth;

    const getXS = () => {

      if (firstAspect > imgAspect) {
        return widthRatio;
      }

      const inverse = 1 / firstAspect;

      if (this.sizing === 'cover') {
        return inverse * Math.min(lastAspect, imgAspect);
      }

      return inverse * Math.max(lastAspect, imgAspect);
    };

    const xs = getXS();
    const ys = heightRatio * Math.max(firstAspect, imgAspect);

    
    const correctionPromise = async () => { 

      this.$.img.style['width'] = `${imgWidth}px`; 
      this.$.img.style['transform'] = 
          `translate(-50%, -50%) scale(${xs}, ${ys})`;
      
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
