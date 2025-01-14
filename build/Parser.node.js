'use strict';

const isObject = function(item) {
    return item && typeof item === "object" && !Array.isArray(item);
};

const mergeDeep = function(target, source) {
    let output = Object.assign({}, target);
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach((key) => {
            if (isObject(source[key])) {
                if (!(key in target))
                    Object.assign(output, {
                        [key]: source[key],
                    });
                else output[key] = mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, {
                    [key]: source[key],
                });
            }
        });
    }
    return output;
};

const sanitizeHtml = function(markup) {
    markup = markup.replace(/&/g, "&amp;");
    markup = markup.replace(/</g, "&lt;");
    markup = markup.replace(/>/g, "&gt;");
    return markup;
};

const embedMarkups = {
    youtube: `<div class="embed"><iframe class="embed-youtube" frameborder="0" src="<%data.embed%>" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen <%data.length%>></iframe></div>`,

    twitter: `<blockquote class="twitter-tweet" class="embed-twitter" <%data.length%>><a href="<%data.source%>"></a></blockquote> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>`,

    instagram: `<blockquote class="instagram-media" <%data.length%>><a href="<%data.embed%>/captioned"></a></blockquote><script async defer src="//www.instagram.com/embed.js"></script>`,

    codepen: `<div class="embed"><iframe <%data.length%> scrolling="no" src="<%data.embed%>" frameborder="no" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe></div>`,

    defaultMarkup: `<div class="embed"><iframe src="<%data.embed%>" <%data.length%> class="embed-unknown" allowfullscreen="true" frameborder="0" ></iframe></div>`,
};

var defaultParsers = {
    paragraph: function (data, config) {
        return `<p class="${config.paragraph.pClass}"> ${data.text} </p>`;
    },

    header: function (data, config) {
        return `<h${data.level} class="${config.header[data.level].hClass}">${data.text}</h${data.level}>`;
    },

    list: function (data, config) {
        const type = data.style === 'ordered' ? 'ol' : 'ul';
        const items = data.items.reduce(
            (acc, item) => acc + `<li class="${config.list[type].listItemClass}">${item}</li>`,
            ''
        );
        return `<${type} class="${config.list[type].listClass}">${items}</${type}>`;
    },

    quote: function (data, config) {
        let alignment = '';
        if (config.quote.applyAlignment) {
            alignment = `style="text-align: ${data.alignment};"`;
        }
        return `<blockquote ${alignment} class="${config.quote.quoteClass}"><p class="${config.quote.pClass}">${data.text}</p><cite class="${config.quote.citeClass}">${data.caption}</cite></blockquote>`;
    },

    table: function (data, config) {
        const rows = data.content.map((row) => {
            return `<tr class="${config.table.trClass}">${row.reduce(
                (acc, cell) => acc + `<td class="${config.table.tdClass}">${cell}</td>`,
                ''
            )}</tr>`;
        });
        return `<table class="${config.table.tableClass}"><tbody class="${config.table.tbodyClass}">${rows.join('')}</tbody></table>`;
    },
    image: function (data, config) {
        const imageConditions = `${data.stretched ? 'img-fullwidth' : ''} ${
            data.withBorder ? 'img-border' : ''
        } ${data.withBackground ? 'img-bg' : ''}`;
        const imgClass = config.image.imgClass || '';
        let imageSrc;

        if (data.url) {
            // simple-image was used and the image probably is not uploaded to this server
            // therefore, we use the absolute path provided in data.url
            // so, config.image.path property is useless in this case!
            imageSrc = data.url;
        } else if (config.image.path === 'absolute') {
            imageSrc = data.file.url;
        } else {
            imageSrc = config.image.path.replace(
                /<(.+)>/,
                (match, p1) => data.file[p1]
            );
        }

        if (config.image.use === 'img') {
            return `<img class="${imageConditions} ${imgClass}" src="${imageSrc}" alt="${data.caption}">`;
        } else if (config.image.use === 'figure') {
            const figureClass = config.image.figureClass || '';
            const figCapClass = config.image.figCapClass || '';

            return `<figure class="${figureClass}"><img class="${imgClass} ${imageConditions}" src="${imageSrc}" alt="${data.caption}"><figcaption class="${figCapClass}">${data.caption}</figcaption></figure>`;
        }
    },
    code: function (data, config) {
        const markup = sanitizeHtml(data.code);
        return `<pre><code class="${config.code.codeBlockClass}">${markup}</code></pre>`;
    },
    raw: function (data) {
        return data.html;
    },
    checklist: function (data, config) {
        let items;
        data.items.forEach(item => {
            items = items + `<div class="${config.checklist.itemClass}"><input type="checkbox" class="${config.checklist.checkBoxClass}"${item.checked ? ' checked' : ''}> <span class="${config.checklist.contentClass}">${item.text}</span></div>`;
        });
        return `<div class="${config.checklist.containerClass}">${items}</div>`;
    },
    delimiter: function (data, config) {
        return `<${config.delimiter.element} class="${config.delimiter.class}">${config.delimiter.element !== 'hr' && config.delimiter.element !== 'br' ? `${config.delimiter.content ? config.delimiter.content : ''}</${config.delimiter.element}>` : ''}`;
    },
    warning: function (data, config) {
        return `<div class="${config.warning.containerClass}"><strong class="${config.warning.titleClass}">${data.title}</strong><p class="${config.warning.messageClass}">${data.message}</p></div>`;
    },
    embed: function (data, config) {
        if (config.embed.useProvidedLength) {
            data.length = `width="${data.width}" height="${data.height}"`;
        } else {
            data.length = '';
        }
        const regex = new RegExp(/<%data\.(.+?)%>/, 'gm');
        if (config.embedMarkups[data.service]) {
            return config.embedMarkups[data.service].replace(
                regex,
                (match, p1) => data[p1]
            );
        } else {
            return config.embedMarkups['defaultMarkup'].replace(
                regex,
                (match, p1) => data[p1]
            );
        }
    }
};

var defaultConfig = {
    image: {
        use: "figure", // figure or img (figcaption will be used for caption of figure)
        imgClass: "img",
        figureClass: "fig-img",
        figCapClass: "fig-cap",
        path: "absolute",
    },
    paragraph: {
        pClass: "paragraph",
    },
    header: {
        1: {
            hClass: "header1"
        },
        2: {
            hClass: "header2"
        },
        3: {
            hClass: "header3"
        },
        4: {
            hClass: "header4"
        },
        5: {
            hClass: "header5"
        },
        6: {
            hClass: "header6"
        }
    },
    list: {
        "ol": {
            listClass: "ol-list",
            listItemClass: "ol-list-item"
        },
        "ul": {
            listClass: "ol-list",
            listItemClass: "ol-list-item"
        }
    },
    code: {
        codeBlockClass: "code-block",
    },
    embed: {
        useProvidedLength: false,
        // set to true if you want the returned width and height of editorjs to be applied
        // NOTE: sometimes source site overrides the lengths so it does not work 100%
    },
    quote: {
        applyAlignment: false,
        // if set to true blockquote element will have text-align css property set
        quoteClass: "quote",
        pClass: "pQuote",
        citeClass: "cite"
    },
    warning: {
        containerClass: "warning",
        titleClass: "warningTitle",
        messageClass: "messageClass"
    },
    checklist: {
        itemClass: "checklistItem",
        checkBoxClass: "checkBox",
        contentClass: "checklistContent",
        containerClass: "CheckboxContainer"
    },
    delimiter: {
        element: 'br',
        class: 'delimiter',
        content: null
    },
    table: {
        trClass: "tr",
        tableClass: "table",
        tbodyClass: "tbody",
        tdClass: "td"
    }
};

class edjsParser {
    constructor(config = {}, customs = {}, embeds = {}) {
        this.config = mergeDeep(defaultConfig, config);
        this.config.embedMarkups = Object.assign(embedMarkups, embeds);
        this.parsers = Object.assign(defaultParsers, customs);
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
            return this.parsers[block.type](block.data, this.config);
        } catch (err) {
            return err;
        }
    }
}

module.exports = edjsParser;
