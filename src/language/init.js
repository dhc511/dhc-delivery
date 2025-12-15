const fs = require("fs");

let data = fs.readFileSync("../lang.json", "utf-8");
data = JSON.parse(data);

const final = {};
let nextObj = {};

function recurse(obj, current) {
    for (var key in obj) {
        var value = obj[key];
        var newKey = current ? current + "." + key : key; // joined key with dot
        if (value && typeof value === "object") {
            recurse(value, newKey); // it's a nested object, so do it again
        } else {
            nextObj[newKey] = value; // it's not an object, so set the property
        }
    }
}

Object.keys(data).forEach(locale => {
    recurse(data[locale]);
    final[locale] = nextObj;
    nextObj = {};
});

fs.writeFileSync("../lang.json", JSON.stringify(final, null, 4));
