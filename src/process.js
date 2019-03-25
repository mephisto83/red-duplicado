var fs = require('fs');
var endOfLine = require('os').EOL;
var wordlist = require('./words.json');
var path = require('path');
require('./array');
const puppeteer = require('puppeteer');
var readLine = require('./readline').default;
const DONE_KEY = '@done';
const debugging = false;
function consoleLog(e) {
    if (debugging)
        console.log(e)
}
const clipboardy = require('clipboardy');
function GUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class Process {
    constructor() {
        this.puppeteer = puppeteer;
        this.browser = null;
        this.page = null;
    }
    async load() {
        consoleLog('load puppeteer');
        const browser = await this.puppeteer.launch({
            defaultViewport: {
                height: 800,
                width: 1500
            },
            devtools: true,
            headless: true
        });
        this.browser = browser;
        const page = await this.browser.newPage();
        consoleLog('new page');
        this.page = page;

    }
    async collectWebUrls(file_path) {
        var results = [];
        //  var createTiveMarketUrls = await this.collectCreativeMarketUrls();
        var qodeInteractive = await this.collectQodeInteractive();
        await this.saveUrls(qodeInteractive, file_path)
        var osUrls = await this.collectOSTemplateUrls();
        await this.saveUrls(osUrls, file_path)
        var boostrapMade = await this.collectBootstrapMade();
        await this.saveUrls(boostrapMade, file_path)
        var colorLibUrls = await this.collectColorLibUrls();
        await this.saveUrls(colorLibUrls, file_path)
        var themeco = await this.collectThemeCoUrls();
        await this.saveUrls(themeco, file_path)
        var temp2 = await this.collectFreeTemplates();
        await this.saveUrls(temp2, file_path)
        var grafted = await this.graftGoogleWords(null, file_path);
        await this.saveUrls(grafted, file_path)
        await this.saveUrls((await this.collectMobileRise()), file_path);
        var _randos = await this.randos();
        return await this.saveUrls(_randos, file_path);
    }
    async saveUrls(newurls, file_path) {
        var urls = [];
        try {
            if (await Process.fileExists(file_path)) {
                urls = Process.readJson(file_path);
                if (!urls) {
                    throw 'urls were not retrieved'
                }
            }


            urls = [...newurls, ...urls].unique(e => e);
            consoleLog(`urls : ${urls.length}`)
            await this.saveJsonTo(file_path, urls);
        } catch (e) { consoleLog(e) }
        return urls;
    }
    readWordList() {
        return wordlist.unique(e => e);
    }
    async graftGoogleWords(num, file_path) {
        var result = [];
        var list = this.readWordList();;
        var wikiWorsdd = await this.graftWikipedia();
        list = [...list, ...wikiWorsdd].unique(e => e);
        consoleLog(list.length)
        num = num || list.length;
        for (var i = 0; i < Math.min(list.length, num); i++) {
            var res = await this.graftGoogle(list[i]);
            result = [...result, ...res].unique(e => e);
            await this.saveUrls(result, file_path)
        }
        return result;
    }
    async getSearchKeyWords(urls) {
        var list = [];
        for (var i = 0; i < urls.length; i++) {
            consoleLog('url: ' + urls[i])
            try {
                await this.goto(urls[i]);
                var temp = await this.page.evaluate(() => {
                    var t = []; document.querySelectorAll('.react-table-element.keyword-name').forEach(y => t.push(y.innerText)); JSON.stringify(t)
                    return t;
                });
                list = [...list, ...temp];
            } catch (E) { }
        }
        return list;
    }
    async getSearchKeyWordLinks() {
        await this.goto('https://www.wordstream.com/popular-keywords');
        return await this.page.evaluate(() => {
            var t = []; document.querySelectorAll('ul li a').forEach(x => t.push(x.getAttribute('href'))); JSON.stringify(t)
            return t;
        })

    }
    async maxWait(func, defaultValue, time) {
        var awaitFunc = func();
        var waitfunc = (async () => {
            await this.wait(time || 30000);
            throw 'took too long';
        })
        return Promise.race([awaitFunc, waitfunc()]).catch(e => {
            return defaultValue;
        })
    }
    async graftGoogle(word) {
        var maxRes = await this.maxWait(async () => {
            try {
                await this.goto('http://google.com');
                await this.sendText('input[title="Search"]', word || 'cars');
                await this.wait();
                var res = await this.page.evaluate(() => {
                    var t = [];
                    document.querySelectorAll('.rc .r > a').forEach(y => t.push(y.getAttribute('href')));;
                    return t;
                })
                return res;
            } catch (e) {

            }
            return [];

        }, []);
        return maxRes;
    }

    async graftWikipedia() {
        await this.goto('https://en.wikipedia.org/wiki/Lists_of_brands');
        var res = await this.page.evaluate(() => {
            var t = []; document.querySelectorAll('ul li a').forEach(x => t.push(x.getAttribute('href')));
            t = t.map(y => {
                if (y.startsWith('/wik')) {
                    // /https://en.wikipedia.org/wiki/List_of_anamorphic_format_trade_names
                    return 'https://en.wikipedia.org' + y;
                }
                return y;
            })
            return t;
        });
        var result = [];
        for (var i = 0; i < res.length; i++) {
            try {
                await this.goto(res[i]);
                var temp = await this.page.evaluate(() => {
                    var t = [];
                    document.querySelectorAll('ul li a').forEach(y => {
                        t.push(y.innerText.substr(0, 50));
                    })
                    return t;
                });
                result = [...result, ...temp];
            } catch (e) { }
        }
        return result;
    }
    static async randomWait(timeout) {
        return await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout || Math.random() * 20000);
        })

    }
    async wait(timeout) {
        return await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, timeout || 3000);
        })

    }
    async sendText(select, text, noenter) {
        await this.page.type(select, text, { delay: 20 });
        if (!noenter)
            await this.page.keyboard.press('Enter');
    }
    async enterText(selector, text) {

        await this.page.waitFor(selector);
        await this.page.evaluate((selector, text) => {
            var els = document.querySelectorAll(selector);
            els[0].value = text;
        }, selector, text);
    }
    async collectMobileRise() {
        var results = [];
        for (var pageIndex = 0; pageIndex < 1; pageIndex++) {
            try {
                var urls = [];
                await this.goto(`https://mobirise.com/website-templates/`);


                urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('a.btn.btn-primary')
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        var temp = (buttons[i].getAttribute('href')).split('.').join('');
                        result.push('https://mobirise.com/website-templates/' + temp);
                    }
                    return result;
                });
                urls = urls || [];
            } catch (e) {

            }
            results = [...results, ...urls];
        }
        return results;
    }
    async collectFreeTemplates() {
        var results = [];
        for (var pageIndex = 0; pageIndex < 28; pageIndex++) {
            try {
                var urls = [];
                await this.goto(`https://freewebsitetemplates.com/templates/page-${pageIndex + 1}`);


                urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('a.view');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        if (buttons[i].innerText.indexOf('View') !== -1) {
                            var temp = (buttons[i].getAttribute('href'));
                            result.push(temp);
                        }
                    }
                    return result;
                });
                urls = urls || [];
            } catch (e) {

            }
            results = [...results, ...urls];
        }
        return results;
    }
    async randos() {
        return ['https://theme.co/x/',
            'https://wrappixel.com/demos/admin-templates/material-pro/material/index.html',
            'https://wrappixel.com/demos/admin-templates/material-pro/minisidebar/index2.html',
            'https://wrappixel.com/demos/admin-templates/material-pro/horizontal/index3.html',
            'https://wrappixel.com/demos/admin-templates/material-pro/dark/index5.html',
            'https://wrappixel.com/demos/admin-templates/material-pro/material-rtl/index4.html',
            'https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/index2.html',
            'https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin/index.html',
            'https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-dark/index3.html',
            'https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-horizontal-nav/index.html',
            'https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-material/index3.html',
            'https://www.yahoo.com/',
            'https://nrk.no/',
            'https://www.vg.no/',
            'https://www.kare11.com/',
            "https://www.kare11.com/", "https://kstp.com/", "https://en.wikipedia.org/wiki/News_broadcasting", "https://en.wikipedia.org/wiki/List_of_news_television_channels", "https://minnesota.cbslocal.com/station/wcco-tv/", "https://channelstore.roku.com/browse/news-and-weather", "http://www.allrefer.com/top-10-popular-news-channels-world", "https://www.adweek.com/tvnewser/basic-cable-ranker-week-of-november-6/348489", "https://topyaps.com/top-10-famous-news-channels-of-the-world/", "https://www.quora.com/How-many-news-channels-are-there-in-all-over-the-world", "https://www.vox.com/2018/4/4/17190240/sinclair-local-tv-map-data", "http://www.startribune.com/", "https://www.forbes.com/sites/dennismersereau/2019/03/05/news-stations-wont-stop-covering-a-tornado-because-youre-missing-your-favorite-tv-show/",
            ...["https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/index2.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin/index.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-dark/index3.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-horizontal-nav/index.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-material/index3.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-minimal/index.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-rtl/index3.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/inbox-email.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/app-taskboard.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/app-calendar.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/app-chats.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/app-contacts.html", "https://www.ampleadmin.wrappixel.com/ampleadmin-html/ampleadmin-sidebar/ticket-list.html"]]
    }
    //var t = []; document.querySelectorAll('.btn.btn-danger.live-btn').forEach(x=> t.push(x.getAttribute('href')))
    //JSON.stringify(t.map(y=> 'https://www.ampleadmin.wrappixel.com/'+y))
    async collectThemeCoUrls() {
        var results = [];
        for (var pageIndex = 0; pageIndex < 1; pageIndex++) {
            try {
                var urls = [];
                await this.goto(`https://theme.co/x/`);


                urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('div.links a');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        if (buttons[i].innerText.indexOf('Demo') !== -1) {
                            var temp = (buttons[i].getAttribute('href'));
                            result.push('https://theme.co/x' + temp);
                        }
                    }
                    return result;
                });
                urls = urls || [];
            } catch (e) {

            }
            results = [...results, ...urls];
        }
        return results;
    }
    async collectQodeInteractive() {
        //http://bridgelanding.qodeinteractive.com/
        var results = [];
        for (var pageIndex = 0; pageIndex < 1; pageIndex++) {
            try {
                var urls = [];
                await this.goto(`http://bridgelanding.qodeinteractive.com/`);


                urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('article a[itemprop="url"]');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        var temp = (buttons[i].getAttribute('href'));
                        result.push(temp);
                    }
                    return result;
                });
                urls = urls || [];
            } catch (e) {

            }
            results = [...results, ...urls];
        }
        return results;
    }
    async collectBootstrapMade() {
        var results = [];
        for (var pageIndex = 0; pageIndex < 5; pageIndex++) {
            try {
                var urls = [];
                await this.goto(`https://bootstrapmade.com/page/${pageIndex + 1}/`);


                urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('.buttons a:first-child');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        var temp = (buttons[i].getAttribute('href'));
                        result.push(temp.split('demo/').join('demo/themes/'));
                    }
                    return result;
                });
                urls = urls || [];
            } catch (e) {

            }
            results = [...results, ...urls];
        }
        return results;

    }
    async collectOSTemplateUrls() {
        var results = [];
        for (var pageIndex = 0; pageIndex < 32; pageIndex++) {
            try {
                await this.goto(`https://www.os-templates.com/free-website-templates?start=${pageIndex * 9}`);


                var urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('section ul li > a');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        result.push(buttons[i].getAttribute('href'));
                    }
                    return result;
                });

                var demoUrls = [];
                for (var i = 0; i < urls.length; i++) {
                    await this.goto(urls[i]);
                    var temp = await this.page.evaluate(() => {
                        var btn = document.querySelector('a.button.medium.orange');
                        if (btn)
                            return btn.getAttribute('href');
                    });
                    if (temp)
                        demoUrls.push(temp);
                }

            } catch (e) {

            }
            results = [...results, ...demoUrls];
        }
        return results;

    }
    async collectCreativeMarketUrls() {
        var results = [];
        for (var pageIndex = 1; pageIndex <= 9; pageIndex++) {
            try {
                await this.goto(`https://creativemarket.com/templates/websites/${pageIndex}`);


                var urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('li[data-canonical]');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        result.push(buttons[i].getAttribute('data-canonical'));
                    }
                    return result;
                });

                var demoUrls = [];
                for (var i = 0; i < urls.length; i++) {
                    await this.goto(urls[i]);
                    var temp = await this.page.evaluate(() => {
                        var btn = document.querySelector('div.live-preview a');
                        if (btn)
                            return btn.getAttribute('href');
                    });
                    if (temp)
                        demoUrls.push(temp);
                }

            } catch (e) {

            }
            results = [...results, ...demoUrls];
        }
        return results;
    }
    async collectColorLibUrls() {
        var results = [];
        for (var pageIndex = 1; pageIndex <= 9; pageIndex++) {
            try {
                await this.goto(`https://colorlib.com/wp/templates/page/${pageIndex}/`);


                var urls = await this.page.evaluate(() => {
                    var buttons = document.querySelectorAll('a.theme-button');
                    var result = [];
                    for (var i = 0; i < buttons.length; i++) {
                        if (buttons[i].innerText.indexOf('read more') !== -1) {
                            var temp = (buttons[i].getAttribute('href'));
                            temp = temp.split('wp/template/').join('preview/#');
                            result.push(temp);
                            //https://colorlib.com/preview/#architect
                        }
                    }
                    return result;
                });
                // var demoUrls = [];
                // for (var i = 0; i < urls.length; i++) {
                //     await this.goto(urls[i]);
                //     var temp = await this.page.evaluate(() => {
                //         var btn = document.querySelector('a.vc_btn3-color-purple');

                //         return btn.getAttribute('href');
                //     });
                //     demoUrls.push(temp);
                // }

                results = [...results, ...urls];
            } catch (e) {

            }
        }
        return results;
    }
    async readCssComponents(file) {
        await this.loadScript('./src/duplicado.js');
        var inputFile = await this.readFile(file);
        consoleLog('read css selectors file :  ' + file);
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
    async extractInterestingElementInfo(interestingIndex) {
        return await this.page.evaluate((interestingIndex) => {
            return window.ExtractInterestingElementInfo(interestingIndex);
        }, interestingIndex);

    }
    async getEventsListenedTo(client, list) {
        var _result = []
        for (var i = 0; i < list.length; i++) {
            var itemIndex = list[i];
            var { result } = await client.send('Runtime.evaluate', { expression: `window.GetIntersectingElement(${itemIndex})` })
            const { listeners } = await client.send('DOMDebugger.getEventListeners', { objectId: result.objectId })
            _result.push(Object.keys(listeners).map(t => {
                return listeners[t].type;
            }));
        }
        return _result;
    }
    async filterInterestingElement(client, elCount) {
        var interestingIndexes = [];
        for (var itemIndex = 0; itemIndex < elCount; itemIndex++) {
            var { result } = await client.send('Runtime.evaluate', { expression: `window.GetIntersectingElement(${itemIndex})` })
            const { listeners } = await client.send('DOMDebugger.getEventListeners', { objectId: result.objectId })
            if (Object.keys(listeners).length) {
                interestingIndexes.push(itemIndex);
            }
            else {
                var interesting = await this.page.evaluate((i) => {
                    return window.IsInterestingElement(i);
                }, itemIndex);
                if (interesting) {
                    interestingIndexes.push(itemIndex);
                }
            }
        }
        return interestingIndexes;
    }

    static async ensureDirectoryDeep(root, paths) {
        await Process.ensureDirectory(root);
        var current = root;
        var promise = Promise.resolve();
        if (paths)
            paths.map(async p => {
                current = current + path.sep + p;
                var t = current;
                promise = promise.then(async () => {
                    return await Process.ensureDirectory(t);
                });
            });

        await promise;

        return current;
    }
    static async directoryExists(dir) {
        return await new Promise((resolve, fail) => {
            fs.exists(dir, (res) => {
                return resolve(res);
            });
        });
    }

    static async fileExists(dir) {
        return await new Promise((resolve, fail) => {
            fs.exists(dir, (res) => {
                return resolve(res);
            });
        });
    }
    static async ensureDirectory(dir) {
        var alreadyExists = await Process.directoryExists(dir);
        if (alreadyExists) {
            return;
        }
        consoleLog(dir)
        return await new Promise((resolve, fail) => {
            var res = fs.existsSync(dir)
            if (!res) {
                consoleLog('making dir');
                fs.mkdirSync(dir)
                resolve();
            }
            else {
                resolve();
            }
        })
    }
    async collectUrls(ops) {
        var { url } = ops;
        await this.goto(url);
        return await this.page.evaluate((url) => {
            var res = [];
            var links = document.querySelectorAll('[href]');
            for (var i = 0; i < links.length; i++) {
                res.push(links[i].getAttribute('href'));
            }

            return res.map(t => {
                if (t.startsWith('http') || t.startsWith('https') || t.startsWith('//')) {
                    return t;
                }
                return `${url}/${t}`;
            }).filter(t => {
                return !(t.indexOf('.css') !== -1
                    || t.indexOf('.js') !== -1
                    || t.indexOf('.jpeg') !== -1
                    || t.indexOf('.jpg') !== -1
                    || t.indexOf('.png') !== -1
                    || t.indexOf('.gif') !== -1
                    || t.indexOf('.json') !== -1)



            });
        }, url)
    }
    async collectInterestPoints(ops) {
        var { url, folder } = ops;
        if (!folder) {
            throw 'folder is required';;
        }
        if (!url) {
            throw 'url is required';
        }
        await Process.ensureDirectoryDeep(folder);
        let result = [];
        await this.goto(url);
        const client = await this.page.target().createCDPSession();
        var siteFolder = `${GUID()}`;
        await this.loadScript('./src/duplicado.js');

        await Process.ensureDirectoryDeep(path.join(folder, siteFolder));
        var done = false;
        var maximages = 50;
        do {
            var elCount = await this.page.evaluate(() => {
                return window.CollectHTMLObjectsIntersectingWindow();
            });

            var interestingIndexes = await this.filterInterestingElement(client, elCount)

            consoleLog(`visible elements ${elCount}`);
            consoleLog(`interesting elements ${interestingIndexes.length}`);
            var imageFileName = `image_${GUID()}.png`;
            var interestingPointData = await this.extractInterestingElementInfo(interestingIndexes);

            var events = await this.getEventsListenedTo(client, interestingIndexes);
            if (events.length !== interestingIndexes.length) {
                consoleLog(`events: ${events.length}, interestingIndexes: ${interestingIndexes.length} `)
                throw 'events interesting points mis match'
            }
            interestingIndexes.map((t, _i) => {
                interestingPointData[_i].events = events[_i] || [];
            });
            var filePath = path.join(folder, siteFolder, imageFileName);
            consoleLog('writing screen shot ' + filePath);
            await this.page.screenshot({
                path: filePath,
                type: 'png'
            });
            result.push({
                url,
                screenshot: filePath,
                image: imageFileName,
                data: interestingPointData
            });
            var scrolled = await this.page.evaluate(() => {
                return window.ScrollPage()
            });

            done = !scrolled;
            consoleLog(`scrolled ${scrolled}`);
            ///            await this.readLine();

            await this.page.evaluate(() => {
                return window.ClearDrawnInterestPoints();
            });
            maximages--;
            if (!maximages) {
                done = true;
            }
        } while (!done);

        await this.saveJsonTo(path.join(folder, siteFolder + '.json'), result)
    }
    async collectCssSelectors() {
        await this.loadScript('./src/duplicado.js');
        await this.page.evaluate(() => {
            window.EnableScreen();
        })
        var done = false;
        var category = 'button';
        var cssCollection = [];
        while (!done) {
            var res = await this.readLine(`enter in css selector for ${category}`);
            consoleLog('');
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
                    consoleLog(cssCollection.map(x => x.css).join(`
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
        return await Promise.resolve(JSON.parse(res));
    }
    static readJson(file) {
        var res = fs.readFileSync(file, 'utf8');
        return (JSON.parse(res));
    }
    async saveJsonTo(file, obj) {
        fs.writeFileSync(file, JSON.stringify(obj));
        return Promise.resolve();
    }
    async readLine(q) {
        consoleLog(readLine);;
        return await readLine(q);
    }
    async checksForMatches(cssSelector) {
        var ok = await this.page.evaluate((selector) => {
            try {
                var res = window.document.body.querySelectorAll(selector);
                return res.length;
            } catch (e) {
                consoleLog(e);
                return false;
            }
        }, cssSelector);
        return ok;
    }
    async loadScript(file) {
        consoleLog('loading script ' + file);
        var script = fs.readFileSync(file, 'utf8');
        consoleLog('loaded ' + script.length);
        var ok = await this.page.evaluate((_script) => {
            try {
                eval(_script);
            } catch (e) {
                consoleLog(e);
                return false;
            }
            return true;
        }, script);

        return ok;
    }
    async close() {
        consoleLog('closing ');

        if (this.browser) {
            var pages = await this.browser.pages();
            for (var i = 0; i < pages.length; i++) {
                await pages[i].close();
            }
            this.page = null;
            await this.browser.close();
            consoleLog('closed ');
        }
        this.browser = null;
    }
    async goto(url) {
        await this.page.goto(url);
        consoleLog('opened ' + url);
    }
}

exports.default = Process;