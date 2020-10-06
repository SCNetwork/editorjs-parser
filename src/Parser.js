const defaultParsers = require("./parsers");
const defaultConfig = require("./config");
const { mergeDeep } = require("./utitlities");

class edjsParser {
    constructor(config = {}, customs = {}) {
        this.config = mergeDeep(defaultConfig, config);
        this.parsers = Object.assign(defaultParsers, customs);
        console.log(this.config);
    }

    parse(EditorJsObject) {
        const html = EditorJsObject.blocks.map((block) => {
            const markup = this.parseBlock(block);
            if (markup instanceof Error) {
                return ""; // parser for this kind of block doesn't exist
            }
            return markup;
        });
        return html.join("");
    }

    parseBlock(block) {
        if (!this.parsers[block.type]) {
            return new Error(
                `${block.type} is not supported! Define your own custom function.`
            );
        }
        try {
            console.log(this.parsers, block.type);
            return this.parsers[block.type](block.data, this.config);
        } catch (err) {
            console.log(err);
        }
    }
}

module.exports = edjsParser;