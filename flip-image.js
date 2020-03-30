
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
        type: Number,
        computed: '__computeRotation(orientation)'
      }

    };
  }


  static get observers() {
    return [
      '__measurementsChanged(measurements)'
    ];
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

    const imgHeight = last.height;

    const widthRatio  = last.width  / imgWidth;
    const heightRatio = last.height / imgWidth;




    console.log('firstAspect: ', firstAspect);
    console.log('lastAspect: ', lastAspect);
    console.log('imgAspect: ', imgAspect);
    console.log('widthRatio: ', widthRatio);
    console.log('heightRatio: ', heightRatio);



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

      // Image orientation is 6 or 8.
      if (this._rotation === '90' || this._rotation === '-90') {

        if (this.sizing === 'cover') {

          // Final position is landscape.
          if (lastAspect >= 1) {


            const getXS = () => {

              // iPhoneX/trees
              // 256h lastAspect > imgAspect > 1 / firstAspect > widthRatio > 1 / imgAspect > firstAspect > heightRatio
              // 180h lastAspect > imgAspect > 1 / firstAspect > widthRatio > 1 / imgAspect > firstAspect > heightRatio

              // iPhoneX/couch
              // 256h lastAspect > 1 / firstAspect > imgAspect > widthRatio > 1 / imgAspect > firstAspect > heightRatio
              // 180h lastAspect > 1 / firstAspect > imgAspect > widthRatio > 1 / imgAspect > firstAspect > heightRatio

              if (firstAspect > imgAspect) {
                return ys;
              } 

              if (imgAspect > lastAspect) { 

                if (heightRatio > firstAspect) {
                  return (1 / imgAspect) * heightRatio;
                }

                return heightRatio * firstAspect;
              }


              


              // couch 256h lastAspect > imgAspect > widthRatio === 1 > 1 / imgAspect > heightRatio > firstAspect
              // couch 180h lastAspect > imgAspect > widthRatio === 1 > 1 / imgAspect > firstAspect > heightRatio
              // couch 144h lastAspect > imgAspect > widthRatio === 1 > firstAspect > 1 / imgAspect > heightRatio

              // 144h
              if (firstAspect > (1 / imgAspect)) {
                return firstAspect * heightRatio;
              }


              // 256h/180h


              if (imgAspect > (1 / firstAspect)) {
                return (imgAspect / lastAspect) * heightRatio;
              }


              // return Math.max((1 / imgAspect), (imgAspect / lastAspect)) * heightRatio;


              // return (imgAspect / lastAspect) * heightRatio;


              // return (1 / lastAspect) * firstAspect;

              return (1 / imgAspect) * heightRatio;


            };

            const getYS = () => {

              // iPhoneX/couch
              // 180h lastAspect > imgAspect > widthRatio > 1 / imgAspect > firstAspect > heightRatio



              if (firstAspect > imgAspect) {
                return xs;
              }

              if (imgAspect > lastAspect) {

                if (heightRatio > firstAspect) {
                  return (widthRatio * heightRatio) / firstAspect;
                }


                // 180h
                return widthRatio;

                // return imgAspect * heightRatio;
              }

              // couch 256h lastAspect > imgAspect > widthRatio === 1 > 1 / imgAspect > heightRatio > firstAspect
              // couch 180h lastAspect > imgAspect > widthRatio === 1 > 1 / imgAspect > firstAspect > heightRatio
              // couch 144h lastAspect > imgAspect > widthRatio === 1 > firstAspect > 1 / imgAspect > heightRatio
              
              // 144h
              if (firstAspect > (1 / imgAspect)) {
                return lastAspect * heightRatio;
              }


              // 256h/180h
              return (1 / imgAspect) / firstAspect;

            };


            const x = getXS();
            const y = getYS();

           
            console.log('set scale: ', x, y);

            // console.log('iPhoneX couch 180h target scale(0.345, 1.05469)');
            console.log('iPhoneX trees 256h target scale(0.242, 1.04688)');

            // console.log('trees 180h target scale(0.372, 0.93)');
            // console.log('trees 256h target scale(0.274, 0.98)');
            // console.log('couch 256h target scale(0.423, 1.5)');

            // console.log('couch 180h target scale(0.423, 1.05)');

            // console.log('couch 144h target scale(0.5, 1)');


            // console.log('trees target scale(0.75, 0.935)');

            this.$.img.style['width'] = `${imgWidth * imgAspect}px`;        
            this.$.img.style['transform'] = 
              `translate(-50%, -50%) scale(${x}, ${y})`;
          }

          // Final position is portrait.
          else {

            const getXS = () => {

              // iPhoneX/trees
              // 256w firstAspect > imgAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 180w imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 144w imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 128s imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 144h imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 180h imgAspect > 1 / imgAspect > firstAspect > heightRatio > lastAsepct > widthRatio
              // 256h imgAspect > 1 / imgAspect > heightRatio > firstAspect > lastAspect > widthRatio


              // iPhoneX/couch
              // 256w firstAspect > imgAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 180w firstAspect > imgAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 144w imgAspect > firstAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 128s imgAspect > firstAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 144h imgAspect > firstAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 180h imgAspect > (heightRatio === 1 / imgAspect) > firstAspect > lastAspect > widthRatio
              // 256h imgAspect > (heightRatio === 1 / imgAspect) > firstAspect > lastAspect > widthRatio


              // ipad/trees
              // 256h 1 / firstAspect > imgAspect > lastAspect > (heightRatio === 1 / imgAspect) > firstAspect > widthRatio
              // 180h imgAspect > 1 / firstAsepct > lastAspect > firstAspect > (heightRatio === 1 / imgAspect) > widthRatio

              // ipad/couch
              // 256h 1 / firstAspect > imgAspect > (lastAspect === heightRatio === 1 / imgAspect) > widthRatio > firstAspect
              // 180h 1 / firstAspect > imgAspect > (lastAspect === heightRatio === 1 / imgAspect) > firstAspect > widthRatio


              if (firstAspect > imgAspect) {

                if (heightRatio > lastAspect) {
                  return firstAspect * Math.max(lastAspect, imgAspect);
                }  

              }

              if (heightRatio > lastAspect) {

                // 144h
                if (firstAspect > heightRatio) {

                  console.log('A');

                  return imgAspect * firstAspect;
                }

                console.log('B');

                return (1 / imgAspect) / heightRatio;
              }


              if ((1 / imgAspect) > firstAspect) {
                return (1 / lastAspect) * Math.max(firstAspect, heightRatio);
              }
                

              if (imgAspect > (1 / firstAspect)) {
                return firstAspect / lastAspect;
              }


              if (firstAspect > lastAspect) {
                // 180h trees
                return firstAspect / lastAspect;
              }

              return 1 / (imgAspect * lastAspect);


              // return (1 / lastAspect) * firstAspect;             

            };

            const getYS = () => {

              // iPhoneX/trees
              // 256w firstAspect > imgAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 180w imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 144w imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 128s imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 144h imgAspect > firstAspect > 1 / imgAspect > heightRatio > lastAspect > widthRatio
              // 180h imgAspect > 1 / imgAspect > firstAspect > heightRatio > lastAsepct > widthRatio
              // 256h imgAspect > 1 / imgAspect > heightRatio > firstAspect > lastAspect > widthRatio


              // iPhoneX/couch
              // 256w firstAspect > imgAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 180w firstAspect > imgAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 144w imgAspect > firstAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 128s imgAspect > firstAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 144h imgAspect > firstAspect > (heightRatio === 1 / imgAspect) > lastAspect > widthRatio
              // 180h imgAspect > (heightRatio === 1 / imgAspect) > firstAspect > lastAspect > widthRatio
              // 256h imgAspect > (heightRatio === 1 / imgAspect) > firstAspect > lastAspect > widthRatio

              // ipad/trees
              // 256h 1 / firstAspect > imgAspect > lastAspect > (heightRatio === 1 / imgAspect) > firstAspect > widthRatio
              // 180h imgAspect > 1 / firstAsepct > lastAspect > firstAspect > (heightRatio === 1 / imgAspect) > widthRatio
    // -->    // 256w firstAspect > imgAspect > lastAspect > (heightRatio === 1 / imgAspect) > 1 / firstAspect > widthRatio
              // 180w imgAspect > firstAspect > lastAspect > 1 / firstAspect > (heightRatio === 1 / imgAspect) > widthRatio


              // ipad/couch
              // 256h 1 / firstAspect > imgAspect > (lastAspect === heightRatio === 1 / imgAspect) > widthRatio > firstAspect
              // 180h 1 / firstAspect > imgAspect > (lastAspect === heightRatio === 1 / imgAspect) > firstAspect > widthRatio
              // 256w firstAspect > imgAspect > (lastAspect === heightRatio === 1 / imgAspect) > widthRatio > 1 / firstAspect
              // 180w firstAspect > imgAspect > (lastAspect === heightRatio === 1 / imgAspect) > 1 / firstAspect > widthRatio

              if (firstAspect > imgAspect) {

                if (imgAspect > heightRatio) {

                  if (lastAspect > heightRatio) {
                    return 1;
                  }

                  return imgAspect * lastAspect;
                }

                if (heightRatio > lastAspect) {
                  return heightRatio;
                }

                return Math.min(1, firstAspect / imgAspect);
              }

              if (heightRatio > lastAspect) {

                if (imgAspect > heightRatio) {
                  return Math.max(imgAspect, 1 / firstAspect) * lastAspect;
                }

                // 144h.
                if (firstAspect > heightRatio) {
                  return 1 / imgAspect;
                }

                return lastAspect / firstAspect;
              }
              
              if ((1 / imgAspect) > firstAspect) {
                return 1 / (imgAspect * firstAspect);
              }

              // 180h tree
              return (1 / imgAspect) / heightRatio;
              
            };
            

            const x = getXS();
            const y = getYS();

            console.log('set scale: ', x, y);

            // console.log('iPhoneX trees 256w target scale(3.843, 0.88)');
            // console.log('iPhoneX couch 256w target scale(2.66667, 0.62)');

            // console.log('iPhoneX trees 180w target scale(2.68657, 0.88)');
            // console.log('iPhoneX couch 180w target scale(1, 0.65)');
            // console.log('ipad trees 180h target scale(0.95, 1)');
            // console.log('ipad trees 256w target scale(2.66667, 1)');


            // console.log('trees 180h target scale(1.273, 1)');

            // console.log('trees 256h target scale(0.93, 1.05)');
            // console.log('couch 144h target scale(1.19, 0.75)');
            // console.log('couch 256h target scale(1, 1.13)');

            // console.log('trees target scale(2.53, 1)');
            // console.log('couch target scale(2.6, 0.75)');


            // console.log('width A: ', imgWidth * lastAspect);            
            // console.log('width B: ', imgHeight);

            // console.log('trees target width: 716');
            // console.log('trees target scale(3.48, 1)');



            this.$.img.style['width'] = `${Math.max(imgHeight, imgWidth * lastAspect)}px`;
            this.$.img.style['transform'] = 
              `translate(-50%, -50%) scale(${x}, ${y})`;
          } 
        }

        // Sizing is 'contain'.
        else {          

          // Final position is landscape.
          if (lastAspect > 1) {

            const getXS = () => {

              if (firstAspect > (1 / imgAspect)) {
                return firstAspect * imgAspect
              }
              
              return 1;            
            };

            const getYS = () => {

              if (firstAspect > (1 / imgAspect)) {

                return lastAspect * imgAspect;
              }

              return lastAspect / firstAspect;            
            };


            const x = getXS();
            const y = getYS();

            this.$.img.style['width'] = `${imgHeight}px`;
            this.$.img.style['transform'] = 
              `translate(-50%, -50%) scale(${x}, ${y})`;
          }
          // Final position is Portrait.
          else {

            const getXS = () => {

              if (firstAspect > (1 / imgAspect)) {
                return firstAspect * Math.max(imgAspect, heightRatio);
              }

              if (heightRatio > imgAspect) {

                if (lastAspect > firstAspect) {
                  return imgAspect;
                }

                return 1 / (imgAspect * lastAspect);
              }

              return widthRatio;              
            };

            const getYS = () => {

              if (firstAspect > (1 / imgAspect)) {

                if (imgAspect > heightRatio) {
                  return imgAspect * lastAspect;
                }

                return widthRatio;
              }

              if (heightRatio > imgAspect) {
                return 1 / (imgAspect * firstAspect);
              }

              return lastAspect / firstAspect;              
            };


            const x = getXS();
            const y = getYS();

            this.$.img.style['width'] = `${Math.min(imgHeight, imgWidth * imgAspect)}px`; 
            this.$.img.style['transform'] = 
              `translate(-50%, -50%) scale(${x}, ${y})`;
          }

        }
      }

      // Image not rotated or rotated 180deg.
      else { 
        this.$.img.style['width']     = `${imgWidth}px`; 
        this.$.img.style['transform'] = 
          `translate(-50%, -50%) scale(${xs}, ${ys})`;
      }

      
      this.$.rotate.style['transform'] = `rotate(${this._rotation}deg)`;



      // debugger;



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
