import React from 'react';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import './App.css';

// 페이지 컴포넌트 가져오기
import HomePage from './pages/HomePage';
import SecondPage from './pages/SecondPage';

// 해시 라우터 설정 (Electron 애플리케이션에 더 적합함)
const router = createHashRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/second',
    element: <SecondPage />,
  }
]);

const App: React.FC = () => {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
};

export default App; 