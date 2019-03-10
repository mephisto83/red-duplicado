var fs = require('fs');
const puppeteer = require('puppeteer');
var readLine = require('./readline').default;
const DONE_KEY = '@done';
class Process {
    constructor() {
        this.puppeteer = puppeteer;
        this.browser = null;
        this.page = null;
    }
    async load() {
        console.log('load puppeteer');
        const browser = await this.puppeteer.launch({ devtools: true, headless: false });
        this.browser = browser;
        const page = await this.browser.newPage();
        console.log('new page');
        this.page = page;

    }
    async readCssComponents(file) {
        await this.loadScript('./src/duplicado.js');
        var inputFile = await this.readFile(file);
        console.log('read css selectors file :  ' + file);
        var { cssSelectors } = inputFile;

        var res = await Promise.all(cssSelectors.map(async cssAndCategory => {
            var components = await this.readOutComponents(cssAndCategory.css);
            cssAndCategory.components = components;
            return cssAndCategory
        }));

        return { ...inputFile, cssSelectors: res };
    }
    async readOutComponents(cssSelector) {
        return await this.page.evaluate((selector) => {

            var res = window.document.body.querySelectorAll(selector);
            var result = [];
            for (var i = 0; i < res.length; i++) {
                var ress = PrintDomToString(Encapsulate(res[i]));
                result.push(ress);
            }

            return result;
        }, cssSelector);
    }
    async collectCssSelectors() {
        await this.loadScript('./src/duplicado.js');
        var done = false;
        var category = 'button';
        var cssCollection = [];
        while (!done) {
            var res = await this.readLine(`enter in css selector for ${category}`);
            console.log('');
            if (res !== DONE_KEY) {
                if (res.indexOf('!') === 0) {
                    category = res.substr(1);
                }
                else if (res.indexOf('%') === 0) {
                    await this.enableScreen();
                } else if (res.indexOf('^') === 0) {
                    var res = await this.getCollectedCssSelectors();
                    cssCollection = [...cssCollection, ...res];
                    await this.disableScreen();
                }
                else if (await this.checksForMatches(res)) {
                    cssCollection.push({ category, css: res });
                    console.log(cssCollection.map(x => x.css).join(`
`));
                }
            }
            else {
                done = true;
            }
        }
        return cssCollection;
    }
    async enableScreen() {
        await this.page.evaluate(() => {
            window.EnableScreen();
        });
    }
    async disableScreen() {
        await this.page.evaluate(() => {
            window.DisableScreen();
        });
    }
    async getCollectedCssSelectors() {
        return await this.page.evaluate(() => {
            return window.GetCssSelectors();
        })
    }
    async readFile(file) {
        var res = fs.readFileSync(file, 'utf8');
        return Promise.resolve(JSON.parse(res));
    }
    async saveJsonTo(file, obj) {
        fs.writeFileSync(file, JSON.stringify(obj));
        return Promise.resolve();
    }
    async readLine(q) {
        console.log(readLine);;
        return await readLine(q);
    }
    async checksForMatches(cssSelector) {
        var ok = await this.page.evaluate((selector) => {
            try {
                var res = window.document.body.querySelectorAll(selector);
                return res.length;
            } catch (e) {
                console.log(e);
                return false;
            }
        }, cssSelector);
        return ok;
    }
    async loadScript(file) {
        console.log('loading script ' + file);
        var script = fs.readFileSync(file, 'utf8');
        console.log('loaded ' + script.length);
        var ok = await this.page.evaluate((_script) => {
            try {
                eval(_script);
            } catch (e) {
                console.log(e);
                return false;
            }
            return true;
        }, script);

        return ok;
    }
    async close() {
        console.log('closing ');
        if (this.browser) {
            await this.browser.close();
            console.log('closed ');
        }
        this.browser = null;
    }
    async goto(url) {
        await this.page.goto(url);
        console.log('opened ' + url);
    }
}

exports.default = Process;