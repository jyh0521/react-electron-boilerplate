"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var path = __importStar(require("path"));
var isDev = __importStar(require("electron-is-dev"));
var fs = __importStar(require("fs"));
// 로깅 기능 개선
var log = function (message) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    var timestamp = new Date().toISOString();
    console.log.apply(console, __spreadArray(["[".concat(timestamp, "] ").concat(message)], args, false));
};
// 전역 참조를 유지하여 JavaScript 가비지 컬렉션이 자동으로 창을 닫지 않도록 합니다.
var mainWindow;
function createWindow() {
    log('Creating main window...');
    // 브라우저 창을 생성합니다.
    mainWindow = new electron_1.BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // 개발 환경과 프로덕션 환경에서의 경로 설정
    var indexPath;
    // 이 앱이 패키지로 실행된건지 개발 모드로 실행된건지 더 정확히 확인
    var isPackaged = electron_1.app.isPackaged;
    var runningInDev = isDev && !isPackaged;
    if (runningInDev) {
        // 개발 모드에서는 React 개발 서버 URL을 사용
        indexPath = 'http://localhost:3000';
        log('Running in development mode, using URL:', indexPath);
        // React 서버 연결 테스트 (실패 시 오류 메시지 표시)
        try {
            // 10초 내에 연결 시도 (최대 5번)
            var attempts_1 = 0;
            var maxAttempts_1 = 5;
            var checkServer_1 = function () {
                attempts_1++;
                log("Attempting to connect to React server (".concat(attempts_1, "/").concat(maxAttempts_1, ")..."));
                if (mainWindow) {
                    mainWindow.loadURL(indexPath)
                        .then(function () {
                        log('Successfully connected to React development server');
                        // 개발자 도구를 엽니다
                        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.openDevTools();
                    })
                        .catch(function (err) {
                        log("Failed to connect on attempt ".concat(attempts_1, ":"), err);
                        if (attempts_1 < maxAttempts_1) {
                            // 2초 후 다시 시도
                            setTimeout(checkServer_1, 2000);
                        }
                        else {
                            log('Maximum connection attempts reached');
                            showErrorDialog('React 서버 연결 실패', '개발 서버에 연결할 수 없습니다. React 서버가 실행 중인지 확인하세요.\n\n' +
                                '아래 명령어로 React 서버를 먼저 실행해보세요:\n' +
                                'yarn start:react');
                        }
                    });
                }
            };
            checkServer_1();
        }
        catch (err) {
            log('Error trying to connect to development server:', err);
        }
    }
    else {
        // 빌드된 애플리케이션에서 사용할 경로 계산
        log('Running in production mode, locating index.html...');
        // 가능한 모든 경로를 시도해봅니다
        var possiblePaths = [
            path.join(__dirname, '../build/index.html'),
            path.resolve(__dirname, '../build/index.html'),
            path.join(__dirname, '../../build/index.html'),
            path.join(electron_1.app.getAppPath(), 'build/index.html'),
            path.join(process.resourcesPath, 'app/build/index.html'),
            path.join(process.resourcesPath, 'build/index.html'),
            path.join(__dirname, '../../../build/index.html'),
        ];
        log('Checking possible index.html paths:');
        // 존재하는 첫 번째 파일 경로 찾기
        var foundPath = '';
        for (var _i = 0, possiblePaths_1 = possiblePaths; _i < possiblePaths_1.length; _i++) {
            var p = possiblePaths_1[_i];
            var exists = fs.existsSync(p);
            log("- Path: ".concat(p, ", Exists: ").concat(exists));
            if (exists) {
                foundPath = p;
                break;
            }
        }
        if (foundPath) {
            indexPath = "file://".concat(foundPath);
            log('Using path for index.html:', foundPath);
            // 파일 로드 시도
            if (mainWindow) {
                mainWindow.loadURL(indexPath).catch(function (err) {
                    log('Failed to load production URL:', err);
                    showErrorDialog('빌드 파일 로드 오류', '빌드된 파일을 로드하는 중 오류가 발생했습니다.\n\n' +
                        "\uC624\uB958 \uBA54\uC2DC\uC9C0: ".concat(err.message, "\n") +
                        "\uC2DC\uB3C4\uD55C \uACBD\uB85C: ".concat(indexPath));
                });
            }
        }
        else {
            log('No valid index.html path found!');
            showErrorDialog('빌드 파일 찾기 실패', '애플리케이션의 빌드 파일을 찾을 수 없습니다.\n\n' +
                '애플리케이션이 제대로 빌드되었는지 확인하세요.');
        }
    }
    // 창이 닫힐 때 발생하는 이벤트입니다.
    if (mainWindow) {
        mainWindow.on('closed', function () {
            log('Main window closed');
            mainWindow = null;
        });
    }
}
// 오류 대화 상자 표시 함수
function showErrorDialog(title, message) {
    log("Error dialog: ".concat(title, " - ").concat(message));
    // 메인 윈도우가 없으면 새로 생성해 오류 표시
    if (!mainWindow || mainWindow.isDestroyed()) {
        mainWindow = new electron_1.BrowserWindow({
            width: 500,
            height: 400,
            webPreferences: { nodeIntegration: true }
        });
    }
    // HTML 오류 페이지 표시
    mainWindow.loadURL("data:text/html,\n    <html>\n      <head>\n        <title>".concat(title, "</title>\n        <style>\n          body { font-family: sans-serif; padding: 20px; line-height: 1.5; }\n          h1 { color: #e74c3c; }\n          pre { background: #f8f9fa; padding: 10px; border-radius: 4px; white-space: pre-wrap; }\n        </style>\n      </head>\n      <body>\n        <h1>").concat(title, "</h1>\n        <p>").concat(message.replace(/\n/g, '<br>'), "</p>\n      </body>\n    </html>\n  "));
    // 에러 대화상자 표시
    electron_1.dialog.showErrorBox(title, message);
}
// 이 메소드는 Electron이 초기화를 마치고
// 브라우저 창을 생성할 준비가 되었을 때 호출됩니다.
// 일부 API는 이 이벤트가 발생한 이후에만 사용할 수 있습니다.
electron_1.app.whenReady().then(function () {
    log('App is ready, creating window...');
    createWindow();
    electron_1.app.on('activate', function () {
        // macOS에서는 독(Dock) 아이콘 클릭 시 창이 없으면 다시 생성합니다.
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            log('App activated, creating new window...');
            createWindow();
        }
    });
}).catch(function (err) {
    log('Failed to initialize app:', err);
});
// 모든 창이 닫히면 앱을 종료합니다. (macOS 제외)
electron_1.app.on('window-all-closed', function () {
    log('All windows closed');
    if (process.platform !== 'darwin') {
        log('Quitting app...');
        electron_1.app.quit();
    }
});
// 앱이 종료되기 전
electron_1.app.on('before-quit', function () {
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
        }
        catch (err) {
            log('Error while closing mainWindow:', err);
        }
    }
});
// 앱이 종료될 때
electron_1.app.on('will-quit', function () {
    log('App will quit');
});
// 앱이 종료된 후
electron_1.app.on('quit', function () {
    log('App has quit');
});
//# sourceMappingURL=main.js.map