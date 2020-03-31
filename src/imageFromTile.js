import bamboo1 from './assets/bamboo1.svg';
import bamboo2 from './assets/bamboo2.svg';
import bamboo3 from './assets/bamboo3.svg';
import bamboo4 from './assets/bamboo4.svg';
import bamboo5 from './assets/bamboo5.svg';
import bamboo6 from './assets/bamboo6.svg';
import bamboo7 from './assets/bamboo7.svg';
import bamboo8 from './assets/bamboo8.svg';
import bamboo9 from './assets/bamboo9.svg';
import circle1 from './assets/circle1.svg';
import circle2 from './assets/circle2.svg';
import circle3 from './assets/circle3.svg';
import circle4 from './assets/circle4.svg';
import circle5 from './assets/circle5.svg';
import circle6 from './assets/circle6.svg';
import circle7 from './assets/circle7.svg';
import circle8 from './assets/circle8.svg';
import circle9 from './assets/circle9.svg';
import character1 from './assets/character1.svg';
import character2 from './assets/character2.svg';
import character3 from './assets/character3.svg';
import character4 from './assets/character4.svg';
import character5 from './assets/character5.svg';
import character6 from './assets/character6.svg';
import character7 from './assets/character7.svg';
import character8 from './assets/character8.svg';
import character9 from './assets/character9.svg';
import wind1 from './assets/wind1.svg';
import wind2 from './assets/wind2.svg';
import wind3 from './assets/wind3.svg';
import wind4 from './assets/wind4.svg';
import dragon1 from './assets/dragon1.svg';
import dragon2 from './assets/dragon2.svg';
import dragon3 from './assets/dragon3.svg';

const imageMap = {
  CIRCLES: {
    1: circle1,
    2: circle2,
    3: circle3,
    4: circle4,
    5: circle5,
    6: circle6,
    7: circle7,
    8: circle8,
    9: circle9,
  },
  BAMBOO: {
    1: bamboo1,
    2: bamboo2,
    3: bamboo3,
    4: bamboo4,
    5: bamboo5,
    6: bamboo6,
    7: bamboo7,
    8: bamboo8,
    9: bamboo9,
  },
  CHARACTERS: {
    1: character1,
    2: character2,
    3: character3,
    4: character4,
    5: character5,
    6: character6,
    7: character7,
    8: character8,
    9: character9,
  },
  WINDS: {
    1: wind1,
    2: wind2,
    3: wind3,
    4: wind4,
  },
  DRAGONS: {
    1: dragon1,
    2: dragon2,
    3: dragon3,
  },
};

function imageFromTile(tile) {
  return imageMap[tile.suit][tile.value];
}

export default imageFromTile;
