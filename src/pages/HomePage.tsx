import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="page">
      <header className="App-header">
        <h1>메인 페이지</h1>
        <p>
          리액트와 일렉트론을 함께 사용하는 보일러플레이트의 첫 페이지입니다.
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

        <div className="navigation">
          <Link to="/second" className="nav-button">두 번째 페이지로 이동</Link>
        </div>
      </header>
    </div>
  );
};

export default HomePage; 