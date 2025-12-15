const fs = require("fs");

const languages = ["en", "vi", "ja"];

const folders = ["common", "components", "views"];

function getFiles(dir) {
  // get all 'files' in this directory
  var all = fs.readdirSync(dir);

  // process each checking directories and saving files
  return all.map(file => {
    // am I a directory?
    if (fs.statSync(`${dir}/${file}`).isDirectory()) {
      // recursively scan me for my files
      return getFiles(`${dir}/${file}`);
    }
    // WARNING! I could be something else here!!!
    return `${dir}/${file}`; // file name (see warning)
  });
}

/**
 * Read current file
 * @type {(*[]|string)[]}
 */

const data = fs.readFileSync("../lang.json", "utf-8");

const json = JSON.parse(data);

let nextData = { ...json };

const readFile = file => {
  if (Array.isArray(file)) {
    file.forEach(readFile);
  } else {
    const content = fs.readFileSync(file, "utf-8");
    const matches = content.match(/\$t\("\S+\)/g);
    if (matches) {
      matches.forEach(item => {
        const key = item.match(/"\s*([^"]*)\s*"/)[1];
        languages.forEach(lang => {
          if (!nextData[lang][key]) {
            nextData[lang][key] = "";
          }
        });
      });
    }
  }
};

folders.forEach(folder => {
  const arr = getFiles(`../` + folder);
  readFile(arr);
});

fs.writeFileSync("../lang.json", JSON.stringify(nextData, null, 4));

console.log("lang run completed");
