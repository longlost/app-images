

/**
  *
  *   Helper library for flip-image.js.
  *   
  *   These calculations are used to counter any
  *   image distortions created by the FLIP animation.
  *
  *
  **/

const wSideCoverLandscape   = d => d.imgWidth * d.imgAspect;

const wSideCoverPortrait    = d => Math.max(d.imgHeight, d.imgWidth * d.lastAspect);

const wSideContainLandscape = d => d.imgHeight;

const wSideContainPortrait  = d => Math.min(d.imgHeight, d.imgWidth * d.imgAspect);


const xSideCoverLandscape = data => {

  const {
    firstAspect, 
    heightRatio, 
    imgAspect, 
    invFirstAspect, 
    invImgAspect, 
    lastAspect
  } = data;

  if (firstAspect > imgAspect) {
    return heightRatio * Math.max(firstAspect, imgAspect);
  } 

  if (imgAspect > lastAspect) { 

    if (heightRatio > firstAspect) {
      return invImgAspect * heightRatio;
    }

    return heightRatio * firstAspect;
  }

  if (firstAspect > invImgAspect) {
    return firstAspect * heightRatio;
  }

  if (imgAspect > invFirstAspect) {
    return (imgAspect / lastAspect) * heightRatio;
  }

  return invImgAspect * heightRatio;
};


const xSideCoverPortrait = data => {

  const {
    firstAspect, 
    heightRatio, 
    imgAspect, 
    invFirstAspect, 
    invImgAspect, 
    invLastAspect, 
    lastAspect
  } = data;

  if (firstAspect > imgAspect) {

    if (heightRatio > lastAspect) {
      return firstAspect * Math.max(lastAspect, imgAspect);
    }  

  }

  if (heightRatio > lastAspect) {

    if (firstAspect > heightRatio) {
      return imgAspect * firstAspect;
    }

    return invImgAspect / heightRatio;
  }

  if (invImgAspect > firstAspect) {
    return invLastAspect * Math.max(firstAspect, heightRatio);
  }        

  if (imgAspect > invFirstAspect) {
    return firstAspect / lastAspect;
  }

  if (firstAspect > lastAspect) {
    return firstAspect / lastAspect;
  }

  return 1 / (imgAspect * lastAspect);
};


const xSideContainLandscape = data => {

  const {firstAspect, imgAspect, invImgAspect} = data;

  if (firstAspect > invImgAspect) {
    return firstAspect * imgAspect;
  }
  
  return 1; 
};


const xSideContainPortrait = data => {

  const {
    firstAspect, 
    heightRatio, 
    imgAspect, 
    invImgAspect, 
    lastAspect, 
    widthRatio
  } = data;

  if (firstAspect > invImgAspect) {
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


const xUpright = data => {

  const {
    firstAspect, 
    imgAspect, 
    invFirstAspect,
    lastAspect,
    sizing, 
    widthRatio
  } = data;

  if (firstAspect > imgAspect) {
    return widthRatio;
  }

  if (sizing === 'cover') {
    return invFirstAspect * Math.min(lastAspect, imgAspect);
  }

  return invFirstAspect * Math.max(lastAspect, imgAspect);
};


const ySideCoverLandscape = data => {

  const {
    firstAspect, 
    heightRatio, 
    imgAspect, 
    invImgAspect, 
    lastAspect, 
    widthRatio
  } = data;

  if (firstAspect > imgAspect) {
    return widthRatio;
  }

  if (imgAspect > lastAspect) {

    if (heightRatio > firstAspect) {
      return (widthRatio * heightRatio) / firstAspect;
    }

    return widthRatio;
  }

  if (firstAspect > invImgAspect) {
    return lastAspect * heightRatio;
  }

  return invImgAspect / firstAspect;
};


const ySideCoverPortrait = data => {

  const {
    firstAspect, 
    heightRatio, 
    imgAspect, 
    invFirstAspect, 
    invImgAspect, 
    lastAspect
  } = data;

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
      return Math.max(imgAspect, invFirstAspect) * lastAspect;
    }

    if (firstAspect > heightRatio) {
      return invImgAspect;
    }

    return lastAspect / firstAspect;
  }
  
  if (invImgAspect > firstAspect) {
    return 1 / (imgAspect * firstAspect);
  }

  return invImgAspect / heightRatio; 
};


const ySideContainLandscape = data => {

  const {
    firstAspect, 
    imgAspect, 
    invImgAspect, 
    lastAspect
  } = data;

  if (firstAspect > invImgAspect) {
    return lastAspect * imgAspect;
  }

  return lastAspect / firstAspect;
};


const ySideContainPortrait = data => {

  const {
    firstAspect, 
    heightRatio, 
    imgAspect, 
    invImgAspect, 
    lastAspect, 
    widthRatio
  } = data;

  if (firstAspect > invImgAspect) {

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


const yUpright = d => d.heightRatio * Math.max(d.firstAspect, d.imgAspect);


export default info => {

  const {
    first, 
    last, 
    naturalHeight, 
    naturalWidth, 
    rotation, 
    sizing
  } = info;

  const imgAspect   = naturalWidth / naturalHeight;
  const firstAspect = first.width  / first.height;
  const lastAspect  = last.width   / last.height;

  const invImgAspect   = 1 / imgAspect;
  const invFirstAspect = 1 / firstAspect;
  const invLastAspect  = 1 / lastAspect;

  const imgWidth = sizing === 'cover' ? 
    Math.max(last.width, (last.height * imgAspect)) : 
    Math.min(last.width, (last.height * imgAspect));

  const imgHeight = last.height;

  const widthRatio  = last.width  / imgWidth;
  const heightRatio = last.height / imgWidth;

  const data = {
    firstAspect,
    heightRatio,
    imgAspect,
    imgHeight,
    imgWidth,
    invFirstAspect,
    invImgAspect,
    invLastAspect,
    lastAspect,
    rotation,
    sizing,
    widthRatio
  };


  // console.log('imgAspect: ', imgAspect);
  // console.log('firstAspect: ', firstAspect);
  // console.log('lastAspect: ', lastAspect);
  // console.log('inverse imgAspect: ', invImgAspect);
  // console.log('inverse firstAspect: ', invFirstAspect);
  // console.log('inverse lastAspect: ', invLastAspect);
  // console.log('widthRatio: ', widthRatio);
  // console.log('heightRatio: ', heightRatio);
  // console.log('------------------------------------------------');

  // Image orientation is 6 or 8.
  if (rotation === '90' || rotation === '-90') {

    if (sizing === 'cover') {

      // Final position is landscape.
      if (lastAspect >= 1) {
        return {
          w: wSideCoverLandscape(data),
          x: xSideCoverLandscape(data),
          y: ySideCoverLandscape(data)
        };
      }

      // Final position is portrait. 
      return {
        w: wSideCoverPortrait(data),
        x: xSideCoverPortrait(data),
        y: ySideCoverPortrait(data)
      };
    }

    // Sizing is 'contain'.

    // Final position is landscape.
    if (lastAspect > 1) { 
      return {
        w: wSideContainLandscape(data),
        x: xSideContainLandscape(data),
        y: ySideContainLandscape(data)
      };
    }

    // Final position is Portrait.
    return {
      w: wSideContainPortrait(data),
      x: xSideContainPortrait(data),
      y: ySideContainPortrait(data)
    };
  }

  // Image not rotated or rotated 180deg.
  return {
    w: imgWidth,
    x: xUpright(data),
    y: yUpright(data)
  };
};




// Testing a more general approach to the calculations
// based on geometry instead of piecemeal if statements.

// export default info => {

//   const {
//     first, 
//     last, 
//     naturalHeight, 
//     naturalWidth, 
//     rotation, 
//     sizing
//   } = info;

//   const imgAspect = naturalWidth / naturalHeight;  
//   const firstAspect = first.width  / first.height;
//   const lastAspect  = last.width   / last.height;

//   const invImgAspect   = 1 / imgAspect;
//   const invFirstAspect = 1 / firstAspect;
//   const invLastAspect  = 1 / lastAspect;

//   const imgWidth = sizing === 'cover' ? 
//     Math.max(last.width, (last.height * imgAspect)) : 
//     Math.min(last.width, (last.height * imgAspect));

//   const imgHeight = last.height;

//   const widthRatio  = last.width  / imgWidth;
//   const heightRatio = last.height / imgWidth;

//   const data = {
//     firstAspect,
//     heightRatio,
//     imgAspect,
//     imgHeight,
//     imgWidth,
//     invFirstAspect,
//     invImgAspect,
//     invLastAspect,
//     lastAspect,
//     rotation,
//     sizing,
//     widthRatio
//   };


//   const getImgFirst = () => {

//     if (naturalWidth > naturalHeight) {
//       const h = first.height;
//       const w = h * imgAspect;

//       return {imgHFirst: h, imgWFirst: w};
//     }

//     const w = first.width;
//     const h = w / imgAspect;

//     return {imgHFirst: h, imgWFirst: w};
//   };


//   const {imgHFirst, imgWFirst} = getImgFirst();


//   const getScale = ({contFirst, contLast, imgFirst, imgLast}) => {

//     const deltaImg  = imgLast  - imgFirst;
//     const deltaCont = contLast - contFirst;

//     console.log('deltaImg: ', deltaImg);
//     console.log('deltaCont: ', deltaCont);
//     console.log('imgLast: ', imgLast);

//     return 1 - ((deltaImg - deltaCont) / imgLast);
//   };


//   const x = getScale({
//     contFirst: first.width, 
//     contLast:  last.width, 
//     imgFirst:  imgWFirst, 
//     imgLast:   imgWidth
//   });


//   // const y = 1;

//   const y = getScale({
//     contFirst: first.height, 
//     contLast:  last.height, 
//     imgFirst:  imgHFirst, 
//     imgLast:   imgHeight
//   });


//   console.log('x: ', x, ' y: ', y);
//   console.log('target x: ', xUpright(data), ' y: ', yUpright(data));


//   // Image not rotated or rotated 180deg.
//   return {
//     w: imgWidth,
//     x,
//     y
//   };
// };
