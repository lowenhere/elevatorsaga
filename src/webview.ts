import * as fs from "fs";
import * as path from "path";

import { parse } from 'node-html-parser';

import { isValidUrl } from './utils';

interface UriGenerator {
    (filePath: string): string;
}

/**
 * returns a HTML string for display in the webview
 * @param rootDir root directory. this should be where index.html is
 * @param uriGenerator function that generates a webview URI based on the file path (relative to the root)
 */
export const getWebViewContent = (rootDir: string, uriGenerator: UriGenerator): string => {
    const root = parse(
        fs.readFileSync(rootDir + "/index.html").toString(),
    );

    // find and replace links with webview URIs
    // stylesheets (link element with href tag)
    root.querySelectorAll("link").forEach((el) => {
        if (el.getAttribute("rel") !== "stylesheet") {
            return;
        }

        const href = el.getAttribute("href");
        if (!href || isValidUrl(href)) {
            return;
        }

        const filePath = path.join(rootDir, href);
        if (!fs.existsSync(filePath)) {
            return;
        }

        el.setAttribute("href", uriGenerator(filePath));
    });

    // scripts (script element with src tag)
    root.querySelectorAll("script").forEach((el) => {
        if (el.getAttribute("type") !== "text/javascript") {
            return;
        }

        const src = el.getAttribute("src");
        if (!src || isValidUrl(src)) {
            return;
        }

        const filePath = path.join(rootDir, src);
        if (!fs.existsSync(filePath)) {
            return;
        }

        el.setAttribute("src", uriGenerator(filePath));
    });

    return root.toString();
}
