import React, {useEffect, useRef, useState} from 'react';
import './char.css';

function Char(props) {
  let myRefs = {};

  const PIXEL_SIZE = 32;
  const MOVING_SPEED = 5;
  const KEY_MAP = {
    ArrowDown : 'ArrowDown',
    ArrowUp : 'ArrowUp',
    ArrowRight : 'ArrowRight',
    ArrowLeft : 'ArrowLeft',
    w:'ArrowUp',
    a:'ArrowLeft',
    s:'ArrowDown',
    d:'ArrowRight'
  };
  const KEY_MAP_SIMPLE = {
    ArrowDown : {
      DIR_POSITION : 0,
      MOVING_POSITION : PIXEL_SIZE * -3,
      MOVING_OFFSET : {
        dir : 'top',
        offset : 1
      }
    },
    ArrowUp : {
      DIR_POSITION : PIXEL_SIZE * -1,
      MOVING_POSITION : PIXEL_SIZE * -2,
      MOVING_OFFSET : {
        dir : 'top',
        offset : -1
      }
    },
    ArrowRight : {
      DIR_POSITION : PIXEL_SIZE * -2,
      MOVING_POSITION : PIXEL_SIZE * -1,
      MOVING_OFFSET : {
        dir : 'left',
        offset : 1
      },
    },
    ArrowLeft : {
      DIR_POSITION : PIXEL_SIZE * -3,
      MOVING_POSITION : PIXEL_SIZE * -4,
      MOVING_OFFSET : {
        dir : 'left',
        offset : -1
      },
    }
  };
  const MODEL_Y_POSITION = PIXEL_SIZE * props.model * -5;
  let MOVING_TIMEOUT;

  const [position, _setPosition] = useState({
    x : 0,
    y : MODEL_Y_POSITION,
    left : undefined,
    top : undefined
  });

  const posRef = useRef(position);

  const setPosition = (pos) => {
    posRef.current = pos;
    _setPosition(pos);
  };

  useEffect(() => {
    //sets starting position
    const coord = props.getCoord('board_0_0');
    const pos = Object.assign({},position);
    pos.left = coord.left;
    pos.top = coord.top;
    setPosition(pos);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

  }, []);

  const handleKeyDown = (event) => {
    //if there's an ongoing moving animation OR key unknown, ignore
    const key = KEY_MAP[event.key]
    if(MOVING_TIMEOUT || !KEY_MAP_SIMPLE[key]){
      return;
    }

    if(KEY_MAP_SIMPLE[key].MOVING_POSITION !== undefined) {
      //initiate moving animation
      let counter = 0;

      function move() {
        const newPos = Object.assign({},posRef.current);
        newPos.y = MODEL_Y_POSITION + KEY_MAP_SIMPLE[key].MOVING_POSITION;
        //assuming the sprite sheet has 8 animations for directional moving ...
        if(counter >= 8){
          counter = 0;
        }
        newPos.x = PIXEL_SIZE * counter * -1;
        newPos[KEY_MAP_SIMPLE[key].MOVING_OFFSET.dir] += (KEY_MAP_SIMPLE[key].MOVING_OFFSET.offset * MOVING_SPEED);
        const blockState = props.checkCoord(newPos.left,newPos.top);
        if(blockState === 'blocked') {
          clearTimeout(MOVING_TIMEOUT);
          MOVING_TIMEOUT = undefined;
          return;
        }
        setPosition(newPos);
        counter++;
      }

      move();
      MOVING_TIMEOUT = setInterval(function() {
        move();
      },125);

    }
  };

  const handleKeyUp = (event) => {
    clearTimeout(MOVING_TIMEOUT);
    //clearing timeout doesn't set this to undefined, so we are going to force it.
    MOVING_TIMEOUT = undefined;

    const key = KEY_MAP[event.key]
    //if key unknown, quit
    if(!KEY_MAP_SIMPLE[key]){
      return;
    }

    if(KEY_MAP_SIMPLE[key].DIR_POSITION !== undefined) {
      //change direction
      const newPos = Object.assign({},posRef.current);
      newPos.x = KEY_MAP_SIMPLE[key].DIR_POSITION;
      newPos.y = MODEL_Y_POSITION;
      setPosition(newPos);
    }
  };

  const controllerClick = (key) => {
    handleKeyDown({key:key});
    handleKeyUp({key:key});
  };

  return (
    <React.Fragment>
      <div className="char"
           alt="nada"
           ref={ ref => { myRefs[`${props.id}_ref`] = ref } }
           style={{
             width:PIXEL_SIZE + 'px',
             height:PIXEL_SIZE + 'px',
             backgroundImage : 'url(' + props.tilemap + ')',
             zoom : props.scale,
             backgroundPositionX : position.x + 'px',
             backgroundPositionY : position.y + 'px',
             position : 'absolute',
             left : position.left + 'px',
             top : position.top + 'px'
           }}
      />
      { props.isMobile &&
        <div className="controller">
          <div className="up key"
               onClick={() => {
                 controllerClick('w')
               }}>↑
          </div>
          <div className="left key"
               onClick={() => {
                 controllerClick('a')
               }}>←
          </div>
          <div className="right key"
               onClick={() => {
                 controllerClick('d')
               }}>→
          </div>
          <div className="down key"
               onClick={() => {
                 controllerClick('s')
               }}>↓
          </div>
        </div>
      }
    </React.Fragment>
  );
}

export default Char;
