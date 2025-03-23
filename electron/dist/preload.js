"use strict";
// 모든 Node.js API는 프리로드 프로세스 내에서 사용 가능합니다.
// Chrome 확장 프로그램도 마찬가지입니다.
window.addEventListener('DOMContentLoaded', function () {
    var replaceText = function (selector, text) {
        var element = document.getElementById(selector);
        if (element)
            element.innerText = text;
    };
    for (var _i = 0, _a = ['chrome', 'node', 'electron']; _i < _a.length; _i++) {
        var dependency = _a[_i];
        var version = process.versions[dependency];
        if (version) {
            replaceText("".concat(dependency, "-version"), version);
        }
    }
});
//# sourceMappingURL=preload.js.map