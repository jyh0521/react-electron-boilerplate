import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SecondPage: React.FC = () => {
  const [text, setText] = useState<string>('');

  return (
    <div className="page second-page">
      <header className="App-header">
        <h1>두 번째 페이지</h1>
        <p>
          리액트와 일렉트론 애플리케이션의 두 번째 페이지입니다.
        </p>

        <div className="input-section">
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="여기에 텍스트를 입력하세요"
          />
          <p>입력한 텍스트: {text}</p>
        </div>

        <div className="navigation">
          <Link to="/" className="nav-button">홈 페이지로 돌아가기</Link>
        </div>
      </header>
    </div>
  );
};

export default SecondPage; 