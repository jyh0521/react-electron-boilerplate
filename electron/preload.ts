// 모든 Node.js API는 프리로드 프로세스 내에서 사용 가능합니다.
// Chrome 확장 프로그램도 마찬가지입니다.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector: string, text: string): void => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    const version = process.versions[dependency];
    if (version) {
      replaceText(`${dependency}-version`, version);
    }
  }
});