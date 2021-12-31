import React, { useEffect, useState } from 'react';
import './board.css';

function Board(props) {
  const PIXEL_SIZE = 32;
  let myRefs = {};

  let tilesPropMap = {
    blocked : [],
    event : []
  };

  let tilesProp = {
    board_0_0 : 'reserved' // reserved for starting pos;
  };

  const generateRandKey = () => {
    const randX = Math.floor(Math.random() * props.sizeX);
    const randY = Math.floor(Math.random() * props.sizeY);
    const randKey = 'board_' + randX + '_' + randY;
    if(!tilesProp[randKey]) {
      return randKey;
    }
    return generateRandKey();
  };

  const generateRandBoard = () => {
    let NUM_BLOCKED = props.isMobile ? 5 : 19;

    for(let i = 0; i < NUM_BLOCKED; i++) {
      tilesProp[generateRandKey()] = { name : 'blocked' };
    }
  };

  useEffect(() => {
    for(const key in tilesProp) {
      const blockedCoord = myRefs[key + '_ref'].getBoundingClientRect();
      tilesPropMap[tilesProp[key].name].push({
        x : [blockedCoord.left-PIXEL_SIZE, blockedCoord.left+PIXEL_SIZE],
        y : [blockedCoord.top-PIXEL_SIZE, blockedCoord.top+PIXEL_SIZE],
        pos : key
      });
    }
  }, []);

  const getCoord = (value) => {
    return myRefs[value + '_ref'].getBoundingClientRect();
  };

  const checkCoord = (x,y) => {
    //check upper low boundaries
    /* ok this is broken, does not take scale into consideration
    if( x < 0 ||
      x > ((props.sizeX-1) * 32) ||
      y > ((props.sizeY-1) * 32) ||
      y < 0 ) {
      return 0;
    }
    */
    for(const map in tilesPropMap) {
      for(const tile of tilesPropMap[map]) {
        if( x > tile.x[0]+5 && // create some offsets for touching blocks
            x < tile.x[1] &&
            y > tile.y[0] &&
            y < tile.y[1]-5 ) { //offset to accomodate the large top margin
          if(map === 'event' && !tilesProp[tile.pos].triggered) {
            tilesProp[tile.pos].func();
            tilesProp[tile.pos].triggered = true;
          }
          //console.info(x + ' ' + y);
          //console.warn(tile.x[0] + '-' + tile.x[1] +  ' ' + tile.y[0] + '-' + tile.y[1]);
          return map;
        }
      }
    }
    return 0;
  };

  const showMessage = (blockType) => {
    if(blockType === 'event') {
      document.getElementById('messageBox').style.display = 'block';
    }
  };

  const createBoard = () => {
    generateRandBoard();
    //generate an event tile
    tilesProp[generateRandKey()] = {
      name : 'event',
      func : () => {
        document.dispatchEvent(new KeyboardEvent('keyup'));
        window.open('https://github.com/justcallmedk/justcallmedk');
      },
      triggered : false,
      image : '/assets/github_logo.png'
    };
    delete tilesProp['board_0_0']; // delete reserved

    let tiles = [];

    for(let i = 0; i < props.sizeY; i++){
      for (let j = 0; j < props.sizeX; j++) {
        const key = 'board_' + j + '_' + i;
        const prop = tilesProp[key];
        tiles.push(
          <div key={key}
               ref={ ref => { myRefs[`${key}_ref`] = ref } }
               style={{
                 zoom : props.scale,
                 backgroundImage : prop ? 'url(' + prop.image + ')': ''
               }}
               onClick={() => {
                 if(!prop) return;
                 showMessage(prop.name);}
               }
               className={key + ' board ' + (prop ? prop.name : '') }>{
          }</div>
        );
      }
    }
    return tiles;
  };

  return (
    <div className={'board-parent'}
         id="boardParent"
         style={{
           width: PIXEL_SIZE * props.sizeX * props.scale
         }}>
      { createBoard() }

      { React.cloneElement(
          props.children, {
            scale : props.scale,
            getCoord: getCoord,
            checkCoord: checkCoord
          }
        )
      }
      <div className="message" id="messageBox">
        <div className="close"
             onClick={() => { document.getElementById('messageBox').style.display = 'none'; }}>
          X
        </div>
        <div className="inner">
          Use the arrow keys to navigate to here!
        </div>
      </div>
    </div>
  );
}

export default Board;
