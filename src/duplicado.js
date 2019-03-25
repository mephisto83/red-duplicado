var Html_Elements_Intersecting_Screen = [];
var cssSelectors = [];
var cssSelectorsObjects = [];
var selectedCategory = 'button';
var cssSelectorList = null;
const CATEGORIES = [
    'button',
    'buttongroup',
    'inputgroup',
    'input',
    'alert',
    'badge',
    'breadcrumbs',
    'card',
    'carousel',
    'collapse',
    'dropdown',
    'radio',
    'form',
    'jumbotron',
    'listgroup',
    'mediaobject',
    'modal',
    'navs',
    'navbar',
    'pagination',
    'popover',
    'progress',
    'scrollspy',
    'spinner',
    'toast',
    'tooltips'
];
// var btn = document.querySelectorAll('.bd-example .btn-group')[0];
function Duplicate(htmlElement) {
    var el = htmlElement;
    var style = window.getComputedStyle(htmlElement);
    // console.log(style);
    var properties = Object.keys(style);
    var _style = [];
    properties.map(prop => {
        var val = style.getPropertyValue(prop);
        if (val) {
            // console.log(`${prop}: ${val}`);
            _style.push(`${prop}:${val}`)
        }
    });
    for (var i = 0; i < htmlElement.children.length; i++) {
        try {
            var _child = htmlElement.children[i];
            child = Duplicate(_child);
        } catch (e) {
            // console.log(e);
        }
    }
    el.setAttribute('style', _style.join(';'));
    // console.log('set attribute');
    // console.log(_style);
    return el;
}

function removeClasses(el) {
    var list = [];
    for (var i = 0; i < el.classList.length; i++) {
        list.push(el.classList.item(i));
    }

    list.map(t => {
        btn.classList.remove(t);
    });

}
function drawBox(box, ops) {
    ops = ops || {};
    // console.log('draw box');
    // console.log(box);
    var div = document.createElement('div');
    div.style.position = 'absolute';
    var x = Math.min(box.start.x, box.end.x);
    var y = Math.min(box.end.y, box.start.y);
    var w = Math.abs(box.start.x - box.end.x);
    var h = Math.abs(box.start.y - box.end.y);
    div.style.width = `${w}px`;
    div.style.height = `${h}px`;
    div.classList.add('drawed-box-duplicado');
    div.style.top = y + 'px';
    div.style.left = x + 'px';
    div.style.backgroundColor = ops.bgcolor || '#00ff0033';
    div.style.zIndex = 1000;
    document.body.appendChild(div);
    return div;
}
var _event_listeners = [];
function createSubmitBtn(handler) {
    var btn = document.createElement('button');
    btn.innerText = 'Submit';
    btn.addEventListener('click', () => {
        if (handler)
            handler();
    });
    return btn;
}
function findBestMatchinDomObjects(box, el) {
    var result = [];
    if (!el) {
        el = document.body;
    }
    var overlap = calculateOverlap(convertBox(box), el);
    result.push({ el: el, score: overlap });
    if (el.children) {
        for (var i = 0; i < el.children.length; i++) {
            if (!el.children[i].classList.contains('drawed-box-duplicado')) {
                result = [...result, ...findBestMatchinDomObjects(box, el.children[i])];
            }
        }
    }

    result = result.sort((b, a) => {
        return a.score - b.score;
    }).slice(0, 10);
    return result;
}
function extractCssSelector(el) {
    var names = [];
    for (var i = 0; i < el.classList.length; i++) {
        names.push(el.classList.item(i));
    }
    var _a = (names && names.length ? '.' : '') + names.join('.');
    return `${el.nodeName.toLowerCase()}${_a}`;
}
var currentTargetedElementsBoxes = [];
function drawBoxesAround(selectors) {
    currentTargetedElementsBoxes.map(box => {
        box.parentNode.removeChild(box);
    });
    currentTargetedElementsBoxes = [];
    for (var i = 0; i < selectors.length; i++) {
        var els = document.querySelectorAll(selectors[i]);
        for (var j = 0; j < els.length; j++) {
            currentTargetedElementsBoxes.push(
                drawBox(
                    getBox(els[j])
                    , {
                        bgcolor: '#0000ff22'
                    }));
        }
    }
}
function getBox(el) {

    var scrollLeft = window.pageXOffset;
    var scrollTop = window.pageYOffset;

    var bb = el.getBoundingClientRect();
    return {
        start: {
            x: bb.left + scrollLeft,
            y: bb.top + scrollTop,
        },
        end: {
            x: bb.right + scrollLeft,
            y: bb.bottom + scrollTop
        }
    }
}
function createCategorySelector() {
    var sel = document.createElement('select');
    CATEGORIES.map(cat => {
        var op = document.createElement('option');
        op.innerHTML = cat;
        op.value = cat;
        sel.appendChild(op);
    });
    sel.addEventListener('change', (evt) => {
        selectedCategory = sel.value;
    })
    return sel;
}
function drawCssSelectorList(list) {
    list.innerHTML = '';
    cssSelectorsObjects.map((item, i) => {
        var btn = document.createElement('button');
        btn.innerHTML = `css: ${item.css}`;
        btn.addEventListener('click', (function () {
            cssSelectorsObjects = cssSelectorsObjects.filter(x => x !== item);
            cssSelectors = cssSelectorsObjects.map(t => t.css);
            refresh();
        }))
        list.appendChild(btn);
    });
}
function refresh() {
    drawBoxesAround(cssSelectors);
    drawCssSelectorList(cssSelectorList);
}

var InterestPoints = null;
function collectInterestPoints() {
    // console.log('collecting interest points');
    var interestPoints = _collectInterestPoints();
    InterestPoints = interestPoints;
    // console.log(`interest points ${InterestPoints.length}`)
    return InterestPoints.length;
}
function drawOnInterestsPoints() {
    InterestPoints.map(t => {
        drawBox(
            getBox(t.el), {
                bgcolor: '#0000dd11'
            });
    });
}
function clearDrawnInterestPoints() {
    var obs = document.querySelectorAll('.drawed-box-duplicado');
    for (var i = 0; i < obs.length; i++) {
        obs[i].parentNode.removeChild(obs[i]);
    }
}
function isVisible(htmlElement) {
    var style = window.getComputedStyle(htmlElement);
    var bb = htmlElement.getBoundingClientRect();
    if (bb.width && bb.height && htmlElement !== document.body)
        if (parseFloat(style.opacity)) {
            if (style.visibility !== 'hidden') {
                if (style.display !== 'none') {
                    return true;
                }
            }
        }
    return false;
}
function _collectInterestPoints(root, depth) {
    var results = [];
    if (depth > 255) {
        return results;
    }
    depth = depth || 0;
    root = root || document.body;
    // console.log('collecting points');
    var listeners = getEventListeners(root);
    if (isVisible(root)) {
        if (Object.keys(listeners).length) {
            results.push({
                events: Object.keys(listeners),
                el: root
            });
        }
        else if (root.nodeName === 'A' && root.getAttribute('href')) {
            results.push({
                events: Object.keys(listeners),
                el: root
            });
        }
    }
    for (var i = 0; i < root.children.length; i++) {
        try {
            var temp = _collectInterestPoints(root.children[i], depth + 1);
            results = [...results, ...temp]
        } catch (e) {

        }
    }
    return results;
}

function enableScreen() {

    var btn = createSubmitBtn(() => {
        completedBoxes.map(box => {
            var re = findBestMatchinDomObjects(box);
            // console.log(re[0]);
            if (re && re[0] && re[0].score && re[0].score > .9) {
                var css = extractCssSelector(re[0].el);
                if (cssSelectors.indexOf(css) === -1) {
                    cssSelectors.push(css);
                    cssSelectorsObjects.push({ css, category: selectedCategory })
                }
            }
            drawBoxesAround(cssSelectors);
            drawCssSelectorList(cssSelectorList);
        });
    });
    var btnBag = document.createElement('div');
    var sel = createCategorySelector();
    document.body.appendChild(btnBag);
    btnBag.appendChild(sel);
    btnBag.appendChild(btn);
    cssSelectorList = document.createElement('div');
    btnBag.appendChild(cssSelectorList);
    btnBag.style.zIndex = 111111045;
    btnBag.style.position = 'fixed';
    btnBag.style.top = '10px';
    btnBag.style.left = '10px';

    var div = document.createElement('div');

    div.style.position = 'fixed';
    var intermediaBox = drawBox({
        start: {
            x: 0, y: 0
        },
        end: {
            x: 1, y: 1
        }
    });
    intermediaBox.style.pointerEvents = 'none';
    var w = window.innerWidth;
    var h = window.innerHeight;
    div.style.width = `${w}px`;
    div.style.height = `${h}px`;
    div.style.top = '0px';
    div.style.left = '0px';
    div.style.zIndex = 999;
    div.style.backgroundColor = '#ff000033';
    document.body.appendChild(div);
    window.plasticScreen = div;
    div.tabIndex = 0;
    var tracking = false;
    var trackPosition = null;
    var completedBoxes = [];

    var box = {};
    var listener = ev => {
        switch (ev.code) {
            case 'KeyD':
                tracking = !tracking;
                if (box.start) {
                    box.end = trackPosition;
                    completedBoxes.push(box);
                    drawBox(box);
                    box = {};
                    redraw(intermediaBox, { x: 0, y: 0 }, { x: 1, y: 1 });
                }
                else {
                    box.start = trackPosition;
                }
                break;
            default:
                // console.log(ev.code);
                break;
        }
    };
    document.body.addEventListener('keypress', listener);
    _event_listeners.push({ event: 'keypress', listener });
    div.addEventListener('mousemove', (ev) => {
        var pos = getMouseXY(ev);
        trackPosition = pos;
        if (box && box.start) {
            redraw(intermediaBox, box.start, trackPosition);
        }
    });
}

function redraw(box, p1, p2) {
    var left = Math.min(p1.x, p2.x);
    var top = Math.min(p1.y, p2.y);
    var width = Math.abs(p1.x - p2.x);
    var height = Math.abs(p1.y - p2.y);

    box.style.left = `${left}px`;
    box.style.top = `${top}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
}
function getMouseXY(e) {
    tempX = e.pageX;
    tempY = e.pageY;

    if (tempX < 0) { tempX = 0; }
    if (tempY < 0) { tempY = 0; }

    return { x: tempX, y: tempY };
}
function disableScreen() {
    if (window.plasticScreen) {
        window.plasticScreen.parentNode.removeChild(window.plasticScreen);
    }
    window.plasticScreen = null;
    _event_listeners.map(lst => {
        document.body.removeEventListener(lst.event, lst.listener);
    })
}
function Encapsulate(el, ops) {
    ops = ops || {};
    var _el = el.cloneNode(true);
    el.parentNode.appendChild(_el);
    var dup = Duplicate(_el);
    if (ops.clearCls)
        removeClasses(dup);
    var bb = el.getBoundingClientRect()

    var abs = document.createElement('div');
    abs.style.position = 'absolute';
    abs.style.zIndex = 100;
    abs.style.top = ops.top || '400px';
    abs.style.left = ops.left || '200px';
    abs.style.width = `${bb.width}px`;
    abs.style.height = `${bb.height}px`;
    var rel = document.createElement('div');
    rel.style.width = '100%';
    rel.style.height = '100%';

    abs.appendChild(rel);
    rel.appendChild(dup);

    document.body.appendChild(abs);

    return abs;
}

function PrintDomToString(el) {
    return el.outerHTML;
}
function convertBox(el) {
    return {
        getBoundingClientRect: () => {
            var t = {
                top: Math.min(el.start.y, el.end.y),
                bottom: Math.max(el.start.y, el.end.y),
                left: Math.min(el.start.x, el.end.x),
                right: Math.max(el.start.x, el.end.x)
            };
            return { ...t, width: t.right - t.left, height: t.bottom - t.top };
        }
    }
}
function calculateOverlap(el1, el2) {
    var bb = el1.getBoundingClientRect();
    var l1 = { y: bb.top, x: bb.left, width: bb.width, height: bb.height };
    var r1 = { y: bb.bottom, x: bb.right, width: bb.width, height: bb.height };
    bb = el2.getBoundingClientRect();
    var scrollLeft = window.pageXOffset;
    var scrollTop = window.pageYOffset;
    var l2 = { y: bb.top + scrollTop, x: bb.left + scrollLeft, width: bb.width, height: bb.height };
    var r2 = { y: bb.bottom + scrollTop, x: bb.right + scrollLeft, width: bb.width, height: bb.height };
    if (doOverlap(l1, r1, l2, r2)) {
        var maxArea = l1.width * l1.height;
        var maxArea2 = l2.width * l2.height;
        var a = overLapAmount(l1, r1, l2, r2);
        return ((a / maxArea) + (a / maxArea2)) / 2;
    }
    return 0;
}
function getIntersectingElement(index) {
    return Html_Elements_Intersecting_Screen[index];
}
function extractInterestingElementInfo(indexes) {
    var results = [];
    indexes.map(index => {
        var el = Html_Elements_Intersecting_Screen[index];
        var bb = el.getBoundingClientRect();
        var duplicateElement = Duplicate(el);

        results.push({
            element: duplicateElement.outerHTML,
            boundingBox: { left: bb.left, top: bb.top, right: bb.right, bottom: bb.bottom, width: bb.with, height: bb.height }
        });
    });

    return results;
}
function isInterestingElement(index) {
    var el = Html_Elements_Intersecting_Screen[index];
    return ['input', 'a', 'select', 'textarea', 'button'].indexOf(el.nodeName.toLowerCase()) !== -1;
}

function collectHTMLObjectsIntersectingWindow() {
    var scrollLeft = window.pageXOffset;
    var scrollTop = window.pageYOffset;
    var l1 = { y: scrollTop, x: 0 };
    var r1 = { y: scrollTop + window.innerHeight, x: scrollLeft + window.innerWidth };
    var intersectingElements = _collectHTMLObjectsIntersectingWindow(l1, r1, document.body);

    Html_Elements_Intersecting_Screen = intersectingElements.filter(x => {
        return isVisible(x);
    });
    return Html_Elements_Intersecting_Screen.length;
}
function _collectHTMLObjectsIntersectingWindow(l1, r1, root) {
    var result = [];

    var scrollLeft = window.pageXOffset;
    var scrollTop = window.pageYOffset;
    var bb = root.getBoundingClientRect();
    var l2 = { y: bb.top + scrollTop, x: bb.left + scrollLeft };
    var r2 = { y: bb.bottom + scrollTop, x: bb.right + scrollLeft };
    if (doOverlap(l1, r1, l2, r2)) {
        result.push(root);
    }

    if (root.children && root.children.length) {
        for (var i = 0; i < root.children.length; i++) {
            result = [...result, ..._collectHTMLObjectsIntersectingWindow(l1, r1, root.children[i])];
        }
    }

    return result;
}
function doOverlap(l1, r1, l2, r2) {
    // If one rectangle is on left side of other  
    if (l1.x > r2.x || l2.x > r1.x) {
        return false;
    }

    // If one rectangle is above other  
    if (l1.y > r2.y || l2.y > r1.y) {
        return false;
    }
    return true;
}
function overLapAmount(l1, r1, l2, r2) {
    // If one rectangle is on left side of other  
    // if (l1.x > r2.x || l2.x > r1.x) {
    //     return false;
    // }
    var width = Math.abs(Math.max(l1.x, l2.x) - Math.min(r1.x, r2.x));

    // If one rectangle is above other  
    // if (l1.y < r2.y || l2.y < r1.y) {
    //     return false;
    // }
    var height = Math.abs(Math.max(l1.y, l2.y) - Math.min(r1.y, r2.y));

    return width * height;
}
window.GetCssSelectors = function () {
    return cssSelectorsObjects;
}
// // exports.duplicate = Duplicate; 
// // exports.encapsolate = Encapsulate;
window.Encapsulate = Encapsulate;
window.Duplicate = Duplicate;
window.PrintDomToString = PrintDomToString;
window.EnableScreen = enableScreen;
window.DisableScreen = disableScreen;
window.CollectInterestPoints = collectInterestPoints;
window.DrawOnInterestsPoints = drawOnInterestsPoints;
window.ClearDrawnInterestPoints = clearDrawnInterestPoints;
window.CollectHTMLObjectsIntersectingWindow = collectHTMLObjectsIntersectingWindow;
window.IsInterestingElement = isInterestingElement;
window.GetIntersectingElement = getIntersectingElement;
window.ExtractInterestingElementInfo = extractInterestingElementInfo;
var lastScrollTop = 0;
window.ScrollPage = function () {
    var hasVerticalScrollbar = document.body.scrollHeight > window.innerHeight;
    if (hasVerticalScrollbar) {
        lastScrollTop = window.scrollY;
        window.scroll(0, window.scrollY + (window.innerHeight / 3));
        if (window.scrollY !== lastScrollTop)
            return true;
    }
    return false;
}
// Encapsulate(btn);