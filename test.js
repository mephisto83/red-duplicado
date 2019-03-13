var Process = require('./src/process').default;
const COLLECT_CSS_SELECTORS = '1';
const PRINT_CSS_RESULTS = '2';
const CAPTURE_INTEREST_POINTS = '3';
const proc = CAPTURE_INTEREST_POINTS;
const TEST_URL = 'https://getbootstrap.com/docs/4.3/components/toasts/';
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
    case CAPTURE_INTEREST_POINTS:
        (async () => {
            var process = new Process();
            await process.load();
            var res = await process.collectInterestPoints(TEST_URL);
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