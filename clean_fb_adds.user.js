// ==UserScript==
// @name         Remove FB Adds
// @namespace    http://github.com/spartytheturnip/
// @version      1.1
// @description  A Tampermonkey script to remove Sponsored posts from your newsfeed on Facebook.
// @author       spartytheturnip
// @include      https://www.facebook.com*
// @require      http://code.jquery.com/jquery-latest.min.js
// @grant        none
// ==/UserScript==

var notAdds = new Set();

function checkForAdds()
{
    findAdd();
    setTimeout(checkForAdds, 100);
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

function hasSponsored(arr) {

    var map = new Map();
    map.set('S',1);
    map.set('p', 1);
    map.set('o', 2);
    map.set('n',1);
    map.set('s',1);
    map.set('r',1);
    map.set('e',1);
    map.set('d',1);

    var entries = [];
    for (var i = 0; i < arr.length; ++i) {
        var search_char = arr[i].textContent;
        if (map.has(search_char)) {
            entries.push(arr[i]);
            map.set(search_char, map.get(search_char) - 1);
        }
    }

    var valid = true;
    for (const [key, value] of map.entries()) {
        if (value >= 0) {
           valid = false;
           break;
        }
    }
    return valid;
}

function findAdd()
{
    var s = $("span").filter(function() { return ($(this).text() === 'S') });
    for (var i=0; i< s.length; i++)
    {
        var parent = s[i].parentNode;
        if (notAdds.has(parent)) {
            continue;
        }
        var textNodes = [];
        for (var j = 0; j < parent.childNodes.length; j ++) {
            var childNode = parent.childNodes[j];
            if (!isEmpty(childNode.textContent)) {
                textNodes.push(childNode);
            }
        }
        textNodes.sort(function(a, b){
           return a.textContent < b.textContent ? -1 : 1;
        })

        if (hasSponsored(textNodes)) {
            removeAdd(parent);
        } else {
            notAdds.add(parent);
        }
    }
}

function removeAdd(add) {
    var parent;
    var feed = document.querySelector('div[role="feed"]');
    while (true) {
        try {
            parent = add.parentNode;
            if (parent === feed) {
                break;
            }
            add = parent;
        } catch {
            return;
        }
    }
    $(add).remove();
}

checkForAdds();