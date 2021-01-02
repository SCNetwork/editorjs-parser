export default {
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
        quoteClass: "quote"
    },
    table: {
        trClass: "tr",
        tableClass: "table",
        tbodyClass: "tbody",
        tdClass: "td"
    }
};