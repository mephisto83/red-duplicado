var Process = require('./src/process').default;
const COLLECT_CSS_SELECTORS = '1';
const PRINT_CSS_RESULTS = '2';
const proc = PRINT_CSS_RESULTS;
const TEST_URL = 'https://getbootstrap.com/docs/4.3/components/button-group/';
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
    case COLLECT_CSS_SELECTORS:
        (async () => {
            var process = new Process();
            await process.load();
            await process.goto(TEST_URL);

            var res = await process.collectCssSelectors();
            console.log(res);
            await process.saveJsonTo('./out.json', {
                url: process.page.url(),
                cssSelectors: res
            });
            await process.close();
        })();
        break;
}