import React, {useEffect} from 'react';
import './App.css';

import Char from './components/char/char.js'
import Board from './components/board/board.js'

function App() {
  useEffect(() => {
  }, []);

  const isMobile = window.innerWidth <= 768;
  return (
    <div className="App">
      <div className={'key-help'}>
        ↑  ← ↓ →/ w a s d
      </div>
      <Board scale={2}
             sizeX={isMobile ? 5 : 10}
             sizeY={5}
             isMobile={isMobile}>
        <Char model="15"
              id="mychar"
              isMobile={isMobile}
              tilemap="/assets/char_tilemap.png">foo</Char>
      </Board>
    </div>
  );
}

export default App;
