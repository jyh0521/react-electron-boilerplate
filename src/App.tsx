import React, { useState } from 'react';
import './App.css';

const App: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="App">
      <header className="App-header">
        <h1>리액트 + 일렉트론 보일러플레이트</h1>
        <p>
          이것은 리액트와 일렉트론을 함께 사용하는 보일러플레이트입니다.
        </p>
        <div className="electron-info">
          <p>
            현재 사용 중인 Node <span id="node-version"></span>,
            Chromium <span id="chrome-version"></span>,
            그리고 Electron <span id="electron-version"></span> 버전입니다.
          </p>
        </div>
        <div className="counter">
          <button onClick={() => setCount(count - 1)}>-</button>
          <span>{count}</span>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
      </header>
    </div>
  );
};

export default App; 