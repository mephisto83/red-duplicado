var path = require('path')
var Process = require('./src/process').default;
require('./src/array');
const DO_WORK = '5';
const proc = DO_WORK;
const URL_2 = 'https://colorlib.com/wp/templates/';
const SCREEN_SHOT_FOLDER = ['//192.168.1.113', 'Public', 'data-set', 'web'].join('/');// 'D:/dev/git/red-data-set/data';
// const SCREEN_SHOT_FOLDER = 'D:/dev/git/red-data-set/data';
const TOUCHED_URLS = 'history.json';
const URLS_FOUND = 'future.json';
function getPathFromUrl(url) {
    return url.split("?")[0];
}
function getPathFromUrlComment(url) {
    return url.split("?")[0];
}
var threads = [];
var processes = [];
var threadCount = 5;
switch (proc) {
    case DO_WORK:
        (async () => {
            let usedUrls = []
            var urls = [URL_2];

            if (await Process.fileExists(path.join(SCREEN_SHOT_FOLDER, URLS_FOUND))) {
                urls = Process.readJson(path.join(SCREEN_SHOT_FOLDER, URLS_FOUND));
                if (!urls) {
                    throw 'urls were not retrieved'
                }
            }
            for (var i = 0; i < threadCount; i++) {
                threads.push(Promise.resolve().then(async () => {
                    var process = new Process();
                    await process.load();
                    processes.push(process);
                }))
            }
            await Promise.all(threads);
            var allThreads = threads.map(async (thread, i) => {
                await Process.randomWait();
                var process = processes[i];
                do {

                    var url = urls.shift();
                    usedUrls.push(url);
                    console.log(`urls: ${urls.length}`)
                    if (await Process.fileExists(path.join(SCREEN_SHOT_FOLDER, TOUCHED_URLS))) {
                        usedUrls = Process.readJson(path.join(SCREEN_SHOT_FOLDER, TOUCHED_URLS));
                        if (!usedUrls) {
                            throw 'used urls were not retrieved'
                        }
                    }
                    try {
                        await process.saveJsonTo(path.join(SCREEN_SHOT_FOLDER, TOUCHED_URLS), usedUrls);
                        console.log('collecting urls')
                        console.log(url)
                        console.log(usedUrls);
                        console.log(`urls: ${urls.length}`)
                        await process.collectInterestPoints({ url, folder: SCREEN_SHOT_FOLDER });
                        urls = [...urls].unique(e => getPathFromUrl(e)).unique(e => getPathFromUrlComment(e));
                        await process.saveJsonTo(path.join(SCREEN_SHOT_FOLDER, URLS_FOUND), urls);
                    } catch (e) {
                        console.log(e);
                    }
                    finally {
                    }
                } while (urls.length);
                await process.close();

            });
            await Promise.all(allThreads);
        })();
        break;
}