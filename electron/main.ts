import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import * as fs from 'fs';

// 로깅 기능 개선
const log = (message: string, ...args: any[]) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`, ...args);
};

// 전역 참조를 유지하여 JavaScript 가비지 컬렉션이 자동으로 창을 닫지 않도록 합니다.
let mainWindow: BrowserWindow | null;

function createWindow(): void {
  log('Creating main window...');
  // 브라우저 창을 생성합니다.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 개발 환경과 프로덕션 환경에서의 경로 설정
  let indexPath: string;
  
  // 이 앱이 패키지로 실행된건지 개발 모드로 실행된건지 더 정확히 확인
  const isPackaged = app.isPackaged;
  const runningInDev = isDev && !isPackaged;

  if (runningInDev) {
    // 개발 모드에서는 React 개발 서버 URL을 사용
    indexPath = 'http://localhost:3000';
    log('Running in development mode, using URL:', indexPath);
    
    // React 서버 연결 테스트 (실패 시 오류 메시지 표시)
    try {
      // 10초 내에 연결 시도 (최대 5번)
      let attempts = 0;
      const maxAttempts = 5;
      const checkServer = () => {
        attempts++;
        log(`Attempting to connect to React server (${attempts}/${maxAttempts})...`);
        
        if (mainWindow) {
          mainWindow.loadURL(indexPath)
            .then(() => {
              log('Successfully connected to React development server');
              
              // 개발자 도구를 엽니다
              mainWindow?.webContents.openDevTools();
            })
            .catch(err => {
              log(`Failed to connect on attempt ${attempts}:`, err);
              
              if (attempts < maxAttempts) {
                // 2초 후 다시 시도
                setTimeout(checkServer, 2000);
              } else {
                log('Maximum connection attempts reached');
                showErrorDialog('React 서버 연결 실패', 
                  '개발 서버에 연결할 수 없습니다. React 서버가 실행 중인지 확인하세요.\n\n' +
                  '아래 명령어로 React 서버를 먼저 실행해보세요:\n' +
                  'yarn start:react'
                );
              }
            });
        }
      };
      
      checkServer();
    } catch (err) {
      log('Error trying to connect to development server:', err);
    }
  } else {
    // 빌드된 애플리케이션에서 사용할 경로 계산
    log('Running in production mode, locating index.html...');
    
    // 가능한 모든 경로를 시도해봅니다
    const possiblePaths = [
      path.join(__dirname, '../build/index.html'),
      path.resolve(__dirname, '../build/index.html'),
      path.join(__dirname, '../../build/index.html'),
      path.join(app.getAppPath(), 'build/index.html'),
      path.join(process.resourcesPath, 'app/build/index.html'),
      path.join(process.resourcesPath, 'build/index.html'),
      path.join(__dirname, '../../../build/index.html'),
    ];
    
    log('Checking possible index.html paths:');
    
    // 존재하는 첫 번째 파일 경로 찾기
    let foundPath = '';
    for (const p of possiblePaths) {
      const exists = fs.existsSync(p);
      log(`- Path: ${p}, Exists: ${exists}`);
      if (exists) {
        foundPath = p;
        break;
      }
    }
    
    if (foundPath) {
      indexPath = `file://${foundPath}`;
      log('Using path for index.html:', foundPath);
      
      // 파일 로드 시도
      if (mainWindow) {
        mainWindow.loadURL(indexPath).catch(err => {
          log('Failed to load production URL:', err);
          showErrorDialog('빌드 파일 로드 오류', 
            '빌드된 파일을 로드하는 중 오류가 발생했습니다.\n\n' +
            `오류 메시지: ${err.message}\n` +
            `시도한 경로: ${indexPath}`
          );
        });
      }
    } else {
      log('No valid index.html path found!');
      showErrorDialog('빌드 파일 찾기 실패', 
        '애플리케이션의 빌드 파일을 찾을 수 없습니다.\n\n' +
        '애플리케이션이 제대로 빌드되었는지 확인하세요.'
      );
    }
  }

  // 창이 닫힐 때 발생하는 이벤트입니다.
  if (mainWindow) {
    mainWindow.on('closed', () => {
      log('Main window closed');
      mainWindow = null;
    });
  }
}

// 오류 대화 상자 표시 함수
function showErrorDialog(title: string, message: string) {
  log(`Error dialog: ${title} - ${message}`);
  
  // 메인 윈도우가 없으면 새로 생성해 오류 표시
  if (!mainWindow || mainWindow.isDestroyed()) {
    mainWindow = new BrowserWindow({
      width: 500,
      height: 400,
      webPreferences: { nodeIntegration: true }
    });
  }
  
  // HTML 오류 페이지 표시
  mainWindow.loadURL(`data:text/html,
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; padding: 20px; line-height: 1.5; }
          h1 { color: #e74c3c; }
          pre { background: #f8f9fa; padding: 10px; border-radius: 4px; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </body>
    </html>
  `);
  
  // 에러 대화상자 표시
  dialog.showErrorBox(title, message);
}

// 이 메소드는 Electron이 초기화를 마치고
// 브라우저 창을 생성할 준비가 되었을 때 호출됩니다.
// 일부 API는 이 이벤트가 발생한 이후에만 사용할 수 있습니다.
app.whenReady().then(() => {
  log('App is ready, creating window...');
  createWindow();

  app.on('activate', () => {
    // macOS에서는 독(Dock) 아이콘 클릭 시 창이 없으면 다시 생성합니다.
    if (BrowserWindow.getAllWindows().length === 0) {
      log('App activated, creating new window...');
      createWindow();
    }
  });
}).catch(err => {
  log('Failed to initialize app:', err);
});

// 모든 창이 닫히면 앱을 종료합니다. (macOS 제외)
app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    log('Quitting app...');
    app.quit();
  }
});

// 앱이 종료되기 전
app.on('before-quit', () => {
  log('App is about to quit');
  
  // 모든 창과 자원을 명시적으로 해제
  if (mainWindow) {
    log('Closing mainWindow explicitly');
    try {
      mainWindow.removeAllListeners();
      mainWindow.webContents.removeAllListeners();
      if (!mainWindow.isDestroyed()) {
        mainWindow.close();
      }
    } catch (err) {
      log('Error while closing mainWindow:', err);
    }
  }
});

// 앱이 종료될 때
app.on('will-quit', () => {
  log('App will quit');
});

// 앱이 종료된 후
app.on('quit', () => {
  log('App has quit');
}); 