require('./src/array');
var Process = require('./src/process').default;
const COLLECT_CSS_SELECTORS = '1';
const PRINT_CSS_RESULTS = '2';
const CAPTURE_INTEREST_POINTS = '3';
const DO_WORK = '5';
const COLLECT_URLS = '4';
const proc = DO_WORK;
const TEST_URL = 'https://getbootstrap.com/docs/4.3/components/toasts/';
const URL_2 = 'https://colorlib.com/wp/templates/';
const SCREEN_SHOT_FOLDER = 'D:/dev/git/red-data-set/data';
const examples = [
    { url: 'https://getbootstrap.com/docs/4.3/components/alerts/', file: './alerts.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/badge/', file: './badges.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/buttons/', file: './buttons.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/card/', file: './cards.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/dropdowns/', file: './dropdowns.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/forms/', file: './forms.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/forms/', file: './inputs.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/input-group/', file: './inputs-2.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/list-group/', file: './list-group.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/modal/', file: './modal.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/navbar/', file: './navbar.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/progress/', file: './progress.json' },
    { url: 'https://getbootstrap.com/docs/4.3/components/toasts/', file: './toasts.json' }
];
switch (proc) {
    case PRINT_CSS_RESULTS:
        (async () => {
            var process = new Process();
            await process.load();
            await process.goto(TEST_URL);

            var res = await process.readCssComponents('./read_out.json');
            console.log(res);
            await process.saveJsonTo('./read_out_result.json', {
                url: process.page.url(),
                cssSelectors: res
            });
            await process.close();
        })();
        break;
    case DO_WORK:
        (async () => {
            var urls = [URL_2];
            do {
                var url = urls.shift();
                var process = new Process();
                await process.load();
                var res = await process.collectUrls({ url });
                console.log(res);
                urls = [...urls, res].unique(e => e);
                await process.collectInterestPoints({ url, folder: SCREEN_SHOT_FOLDER });
                await process.close();
                urls = [];
            } while (urls.length)
        })();
        break;
    case COLLECT_URLS:
        (async () => {
            var process = new Process();
            await process.load();
            var res = await process.collectUrls({ url: URL_2 });
            console.log(res);
            await process.close();
        })();
        break;
    case CAPTURE_INTEREST_POINTS:
        (async () => {
            var process = new Process();
            await process.load();
            var res = await process.collectInterestPoints({ url: URL_2, folder: SCREEN_SHOT_FOLDER });
            console.log(res);
            await process.saveJsonTo('./interest-points.json', {
                url: process.page.url(),
                cssSelectors: res
            });
            await process.close();
        })();
        break;
    case COLLECT_CSS_SELECTORS:
        (async () => {
            var process = new Process();
            await process.load();
            await process.goto(TEST_URL);

            var res = await process.collectCssSelectors();
            console.log(res);
            await process.saveJsonTo('./toasts.json', {
                url: process.page.url(),
                cssSelectors: res
            });
            await process.close();
        })();
        break;
}