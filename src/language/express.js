const express = require("../../node_modules/express");
const fs = require("fs");
const cors = require("../../node_modules/cors");
const server = express();

server.use(cors());
server.use(express.json({ limit: "100kb" }));
server.use(express.static("build"));

server.get("/languages", (req, res) => {
  const data = fs.readFileSync("../lang.json", "utf-8");
  const json = JSON.parse(data);
  /**
   * Checking number of language
   */
  const languages = Object.keys(json);

  /**
   * Making the group
   */
  const groups = [];

  /**
   * The base language to use is en
   */
  const finalArray = [];
  Object.keys(json.en).forEach(key => {
    const [group] = key.split(".");

    if (!groups.includes(group)) {
      groups.push(group);
    }

    const row = { key };
    languages.forEach(langCode => {
      row[langCode] = json[langCode][key] || "";
    });
    finalArray.push(row);
  });

  return res.json({
    languages,
    groups,
    data: finalArray
  });
});

server.post("/languages", (req, res) => {
  const item = req.body;

  const data = fs.readFileSync("../lang.json", "utf-8");

  const json = JSON.parse(data);
  /**
   * Checking number of language
   */
  const languages = Object.keys(json);

  languages.forEach(lang => {
    json[lang][item.key] = item[lang];
  });

  fs.writeFileSync("../lang.json", JSON.stringify(json, null, 4));

  /**
   * Making the group
   */
  const groups = [];

  /**
   * The base language to use is en
   */
  const finalArray = [];
  Object.keys(json.en).forEach(key => {
    const [group] = key.split(".");

    if (!groups.includes(group)) {
      groups.push(group);
    }

    const row = { key };
    languages.forEach(langCode => {
      row[langCode] = json[langCode][key] || "";
    });
    finalArray.push(row);
  });

  return res.json({
    languages,
    groups,
    data: finalArray
  });
});

server.listen(63000, () => {
  console.log("Languages Server Started at 63000");
});
