# Editorjs-parser

editorjs-parser is a NPM package for parsing the output object of [EditorJs](https://github.com/codex-team/editor.js) to HTML.

This is a fork of the [original package](https://github.com/MichaelMikeJones/editorjs-parser) and has the following changes:
* Support for more classes for blocks (so you can set a class for every element - useful for frameworks live tailwindcss)
* Support for more blocks (eg. checklist)


# Installation

### CDN

Only supported by the [original package](https://github.com/MichaelMikeJones/editorjs-parser).

### NPM

Use the package manager [npm](https://www.npmjs.com/) to install editorjs-parser.

```bash
npm install --save @SCNetwork/editorjs-parser
```

# Usage

To use the package in a browser, import Browser version through CDN to your HTML file and just call `edjsParser` class:

```javascript
const parser = new edjsParser(config, customParsers, embedMarkup);
```

To import the package in Node and Front-end code:

```javascript
const edjsParser = require("editorjs-parser");
const parser = new edjsParser(config, customParsers, embedMarkup);
```

**NOTE:** **Parameters are optional**. If you want to only pass the second parameter, set the first parameter to `undefined`.

To parse all blocks, pass the exact EditorJs' output object:

```javascript
const markup = parser.parse(output);
```

To parse one block, pass a complete block:

```javascript
const markup = parser.parseBlock(block);
```

**NOTE:** HTML markup in code blocks are already sanitized and ready to be sent to browser. You don't have to do anything.

**NOTE:** Code blocks are compatible with [highlight.js](https://github.com/highlightjs/highlight.js/)

## Supported blocks

- Paragraph
- Header
- Table
- Raw
- Delimiter
- Code
- Quote
- List
- Embed
- Image
- Simple-image
- Checklist  
- Warning (you may need to style that yourself)

  **NOTE:** It is pointless to use both `image` and `simple-image` block types in the same editor instance, but this parser supports both of them, and you can use any of them that fulfills your needs.

## Custom or overriding parser methods

If you have a custom block like so:

```javascript
{
   type: "customBlock",
   data: {
       // Your data
   }
}
```

You can pass an object of custom parsers or override existing parsers of supported blocks as the second argument, like so:

```javascript
const customParsers = {
    customBlock: function(data, config) {
        // parsing functionality
        // the config arg is user provided config merged with default config
    },
    image: function(data, config): {
        return `<img src="${data.file.url}" alt="${data.caption}" >`;
    }
}

const parser = new edjsParser(undefined, customParsers);
```

**NOTE:** The config arg is user provided config merged with default configuration.

## Configuration

This is the default configuration. You can override any of these properties by passing a config object.

```javascript
{
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
        element: 'br', // Element of the delimeter, supports every element (eg. br, hr, p, h1)
        class: 'delimiter',
        content: null  // Only availble if the selected element can contain a value  
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
    table: {
        trClass: "tr",
        tableClass: "table",
        tbodyClass: "tbody",
        tdClass: "td"
    }
};
```

### Relative path (images)

To use the relative path, you should return the filename of the uploaded image from your backend, alongside the url (for more info [docs](https://github.com/editor-js/image#backend-response-format-)).

Then include the property name of filename in config like so: (for example the property name of the returned filename is `imageFileName`)

```javascript
const config = {
  image: {
    path: "/img/<imageFileName>";
  }
};

const parser = new edjsParser(config);
```

**NOTE:** Images will have class `img`.

**NOTE:** If the image is stretched, the parsed `img` tag will have `img-fullwidth` as class.

**NOTE:** If image is set to have a border, the parsed `img` tag will have `img-border` as class.

**NOTE:** If `withBackground` is set to true, the parsed `img` tag will have `img-bg` as class.

You can style, according to these classes.

### Apply provided lengths (embeds)

If you want the returned width and height of embedded element to be applied, set `useProvidedLength` option to true in the config:

```javascript
const config = {
  embed: {
    useProvidedLength: true,
  },
};

const parser = new edjsParser(config);
```

### Custom embed markup (embeds)

If you want to render a custom markup for your embed service, pass it in an object in third argument. For example if you want your own markup to be rendered for Youtube video embed, you got to do this:

```javascript
const parser = new edjsParser(undifined, undifined, {
  youtube: `Your markup in string`,
});
```

You also have access to `data` object. To use that you should put variable names in placeholders, like so:

```javascript
const customEmbeds = {
  youtube: `<iframe src="<%data.embed%>" width="<%data.width%>"><%data.caption%></iframe>`,
};

const parser = new edjsParser(undifined, undifined, customEmbeds);
```

**NOTE:** If you want to have [useProvidedLength](#apply-provided-lengths-embeds) functionality, use `<%data.length%>` instead of `<%data.width%>` and `<%data.height%>` in embed markups.

`<%data.length%>` returns string like this: `width="300" height="500"`

### Quote Alignment (quotes)

If you need the returned alignment of blockquotes to be set, set `applyAlignment` to true in the config:

```javascript
const config = {
  quote: {
    applyAlignment: true;
  }
};

const parser = new edjsParser(config);
```

# Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Please make sure to update tests as appropriate.

For any issue or feature request, please open an issue.

# License

[MIT](https://choosealicense.com/licenses/mit/)
