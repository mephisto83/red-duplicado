var path = require('path')
var Process = require('./src/process').default;
require('./src/array');
const DO_WORK = '5';
const proc = DO_WORK;
const URL_2 = 'https://colorlib.com/wp/templates/';
const SCREEN_SHOT_FOLDER = 'D:/dev/git/red-data-set/data';
const TOUCHED_URLS = 'history.json';
const URLS_FOUND = 'future.json';
function getPathFromUrl(url) {
    return url.split("?")[0];
}
function getPathFromUrlComment(url) {
    return url.split("?")[0];
}
switch (proc) {
    case DO_WORK:
        (async () => {
            var process = new Process();

            await process.load();
            await process.collectWebUrls(path.join(SCREEN_SHOT_FOLDER, URLS_FOUND));
            await process.close();
        })();
        break;
}