
// Path utilities
path = {
    normalizeRE: /[^\.\/]+\/\.\.\//,
    join: function (...args: string[]): string {
        let result = "";
        for (let i = 0, l = args.length; i < l; i++) {
            result = (result + (result === "" ? "" : "/") + args[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    },
    extname: function (pathStr: string): string | null {
        const temp = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(pathStr);
        return temp ? temp[1] : null;
    },
    mainFileName: function (fileName: string): string {
        if (fileName) {
            const idx = fileName.lastIndexOf(".");
            if (idx !== -1)
                return fileName.substring(0, idx);
        }
        return fileName;
    },
    basename: function (pathStr: string, extname?: string): string | null {
        const index = pathStr.indexOf("?");
        if (index > 0) pathStr = pathStr.substring(0, index);
        const reg = /(\/|\\\\)([^(\/|\\\\)]+)$/g;
        const result = reg.exec(pathStr.replace(/(\/|\\\\)$/, ""));
        if (!result) return null;
        let baseName = result[2];
        if (extname && pathStr.substring(pathStr.length - extname.length).toLowerCase() === extname.toLowerCase())
            return baseName.substring(0, baseName.length - extname.length);
        return baseName;
    },
    dirname: function (pathStr: string): string {
        return pathStr.replace(/((.*)(\/|\\|\\\\))?(.*?\..*$)?/, '$2');
    },
    changeExtname: function (pathStr: string, extname?: string): string {
        extname = extname || "";
        let index = pathStr.indexOf("?");
        let tempStr = "";
        if (index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        }
        index = pathStr.lastIndexOf(".");
        if (index < 0) return pathStr + extname + tempStr;
        return pathStr.substring(0, index) + extname + tempStr;
    },
    changeBasename: function (pathStr: string, basename: string, isSameExt?: boolean): string {
        if (basename.indexOf(".") === 0) return this.changeExtname(pathStr, basename);
        let index = pathStr.indexOf("?");
        let tempStr = "";
        let ext = isSameExt ? this.extname(pathStr) : "";
        if (index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        }
        index = pathStr.lastIndexOf("/");
        index = index <= 0 ? 0 : index + 1;
        return pathStr.substring(0, index) + basename + ext + tempStr;
    },
    _normalize: function (url: string): string {
        let oldUrl = url = String(url);
        do {
            oldUrl = url;
            url = url.replace(this.normalizeRE, "");
        } while (oldUrl.length !== url.length);
        return url;
    }
};
