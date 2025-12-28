import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Failed to mount application:", error);
  rootElement.innerHTML = '<div style="color: white; padding: 20px;">애플리케이션을 로드하는 중 오류가 발생했습니다. 개발자 도구(F12)의 콘솔을 확인해주세요.</div>';
}