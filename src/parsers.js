import { sanitizeHtml } from "./utitlities";

export default {
    paragraph: function(data, config) {
        return `<p class="${config.paragraph.pClass}"> ${data.text} </p>`;
    },

    header: function(data, config) {
        return `<h${data.level} class="${config.header[data.level].hClass}">${data.text}sdf</h${data.level}>`;
    },

    list: function(data, config) {
        const type = data.style === "ordered" ? "ol" : "ul";
        const items = data.items.reduce(
            (acc, item) => acc + `<li class="${config.list[type].listItemClass}">${item}</li>`,
            ""
        );
        return `<${type} class="${config.list[type].listClass}">${items}</${type}>`;
    },

    quote: function(data, config) {
        let alignment = "";
        if (config.quote.applyAlignment) {
            alignment = `style="text-align: ${data.alignment};"`;
        }
        return `<blockquote ${alignment} class="${config.quote.quoteClass}"><p class="${config.quote.pClass}">${data.text}</p><cite class="${config.quote.citeClass}">${data.caption}</cite></blockquote>`;
    },

    table: function(data, config) {
        const rows = data.content.map((row) => {
            return `<tr class="${config.table.trClass}">${row.reduce(
                (acc, cell) => acc + `<td class="${config.table.tdClass}">${cell}</td>`,
                ""
            )}</tr>`;
        });
        return `<table class="${config.table.tableClass}"><tbody class="${config.table.tbodyClass}">${rows.join("")}</tbody></table>`;
    },
    image: function (data, config) {
        const imageConditions = `${data.stretched ? "img-fullwidth" : ""} ${
            data.withBorder ? "img-border" : ""
        } ${data.withBackground ? "img-bg" : ""}`;
        const imgClass = config.image.imgClass || "";
        let imageSrc;

        if (data.url) {
            // simple-image was used and the image probably is not uploaded to this server
            // therefore, we use the absolute path provided in data.url
            // so, config.image.path property is useless in this case!
            imageSrc = data.url;
        } else if (config.image.path === "absolute") {
            imageSrc = data.file.url;
        } else {
            imageSrc = config.image.path.replace(
                /<(.+)>/,
                (match, p1) => data.file[p1]
            );
        }

        if (config.image.use === "img") {
            return `<img class="${imageConditions} ${imgClass}" src="${imageSrc}" alt="${data.caption}">`;
        } else if (config.image.use === "figure") {
            const figureClass = config.image.figureClass || "";
            const figCapClass = config.image.figCapClass || "";

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
    delimiter: function (data) {
        return "<br />";
    },

    warning: function (data, config) {
        return `<div class="${config.warning.containerClass}"><strong class="${config.warning.titleClass}">${data.title}</strong><p class="${config.warning.messageClass}">${data.message}</p></div>`;
    },

    embed: function (data, config) {
        if (config.embed.useProvidedLength) {
            data.length = `width="${data.width}" height="${data.height}"`;
        } else {
            data.length = "";
        }
        const regex = new RegExp(/<%data\.(.+?)%>/, "gm");
        if (config.embedMarkups[data.service]) {
            return config.embedMarkups[data.service].replace(
                regex,
                (match, p1) => data[p1]
            );
        } else {
            return config.embedMarkups["defaultMarkup"].replace(
                regex,
                (match, p1) => data[p1]
            );
        }
    },
};