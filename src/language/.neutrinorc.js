const standard = require("@neutrinojs/standardjs");
const react = require("@neutrinojs/react");
const jest = require("@neutrinojs/jest");

module.exports = {
    options: {
        root: __dirname,
    },
    use: [
        null,
        react({
            html: {
                title: "BI Language Management Tool",
            },
        }),
        jest(),
    ],
};
