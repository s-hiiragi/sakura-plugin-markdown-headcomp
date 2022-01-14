/*
 * (メモ) 入力補完時にComplement.GetCurrentWordが返す文字列
 * ※ `I`はカーソル位置
 * 
 * `#I` ==> `#`
 * `##I` ==> `##`
 * `## hogeI` ==> `hoge`
 * `## ho|ge` ==> `ho`
 *
 * (メモ) パフォーマンスについて
 * - 1万行程度だとキャッシュしなくても速い
 */

function getHeadings() {
    var headings = [];

    // 見出しを取得
    // コードブロック内の`#`で始まる行は読み飛ばす

    var lineCount = Editor.GetLineCount(0);
    var isInCodeBlock = false;

    for (var i = 1; i <= lineCount; i++) {

        var line = Editor.GetLineStr(i);
        if (!line) continue;

        if (line.charAt(0) == '#' && !isInCodeBlock) {
            var heading = line.replace(/^#+\s*|\s+$/g, '');
            if (heading) {
                headings.push(heading);
            }
        }
        else if (line.substring(0, 3) === '```') {
            isInCodeBlock = !isInCodeBlock;
        }
    }

    headings.sort();

    // 重複した見出しを削除
    var tmp = [];
    for (var i = 0; i < headings.length; i++) {
        if (headings[i] !== headings[i-1]) {
            tmp.push(headings[i]);
        }
    }
    headings = tmp;

    return headings;
}

function getCachedHeadings() {
    var s = GetCookieDefault('document', 'headcomp.headings', '');

    if (s === '') {
        return [];
    } else {
        return s.split('\t');
    }
}

function cacheHeadings(headings) {
    var lineCount = Editor.GetLineCount(0);
    var headingsStr = headings.join('\t');

    SetCookie('document', 'headcomp.lastLineCount', String(lineCount));
    SetCookie('document', 'headcomp.headings', headingsStr);
}

(function(){
    var currLine = Editor.GetLineStr(0);

    if (currLine.charAt(0) !== '#') {
        return;
    }

    var lineCount = Editor.GetLineCount(0);
    var lastLineCountStr = GetCookieDefault('document', 'headcomp.lastLineCount', '-1');

    var headings;
    //*
    if (Number(lastLineCountStr) === lineCount) {
        //traceout='get cached headings';
        headings = getCachedHeadings();
    } else {
        //traceout='cache headings';
        headings = getHeadings();
        cacheHeadings(headings);
    }
    /*/
    headings = getHeadings();
    //*/

    var prefix = currLine.replace(/^#+\s*|\s+$/g, '');

    if (prefix) {
        // Filter headings by prefix
        var tmp = [];
        for (var i = 0; i < headings.length; i++) {
            if (headings[i].indexOf(prefix) === 0) {
                tmp.push(headings[i]);
            }
        }
        headings = tmp;

        compPrefix = '';
    } else {
        compPrefix = currLine.replace(/\s+$/g, '') + ' ';
    }

    for (var i = 0; i < headings.length; i++) {
        //traceout='headings['+i+']=[' + headings[i] + ']';
        Complement.AddList(compPrefix + headings[i]);
    }
})();
