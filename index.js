var btn = document.querySelectorAll('.bd-example .btn-group button.btn.btn-secondary')[0];
function Duplicate(htmlElement) {
    var el = htmlElement;
    var style = window.getComputedStyle(htmlElement);
    console.log(style);
    var properties = Object.keys(style);
    var _style = [];
    properties.map(prop => {
        var val = style.getPropertyValue(prop);
        if (val) {
            console.log(`${prop}: ${val}`);
            _style.push(`${prop}:${val}`)
        }
    });
    for (var i = 0; i < htmlElement.children.length; i++) {
        try {
            var _child = htmlElement.children[i];
            child = Duplicate(_child);
        } catch (e) {
            console.log(e);
        }
    }
    el.setAttribute('style', _style.join(';'));
    console.log('set attribute');
    console.log(_style);
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

function Encapsul(el, ops) {
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
    abs.style.top = '400px';
    abs.style.left = '200px';
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

// exports.duplicate = Duplicate; 
// exports.encapsolate = Encapsul;

Encapsul(btn);