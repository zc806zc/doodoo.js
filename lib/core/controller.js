const fs = require("fs");
const path = require("path");
const assert = require("assert");

module.exports = class Controller {
    constructor(ctx, next) {
        assert(ctx, "SyntaxError: missing super(ctx) call in constructor");
        assert(next, "SyntaxError: missing super(next) call in constructor");

        this.ctx = ctx;
        this.next = next;

        for (const name in ctx) {
            if (typeof ctx[name] !== "function") {
                Object.defineProperty(this, name, {
                    get: () => {
                        return this.ctx[name];
                    },
                    set: value => {
                        this.ctx[name] = value;
                    }
                });
            } else {
                this[name] = ctx[name];
            }
        }
    }

    isGet() {
        if (this.ctx.method === "GET") {
            return true;
        }
        return false;
    }

    isPost() {
        if (this.ctx.method === "POST") {
            return true;
        }
        return false;
    }

    isAjax() {
        return this.ctx.get("X-Requested-With") === "XMLHttpRequest";
    }

    isPjax() {
        return this.ctx.get("X-PJAX") || false;
    }

    isMethod(method) {
        return this.ctx.method === method.toUpperCase();
    }

    view(data) {
        this.ctx.body = data;
    }

    json(data, msg, code) {
        this.view({
            data: data,
            msg: msg,
            code: code
        });
    }

    success(data, msg) {
        this.json(data, msg, 1);
    }

    error(data, msg) {
        this.json(data, msg, 0);
    }

    download(file) {
        const filename = path.relative(path.dirname(file), file);

        this.ctx.set("Content-disposition", "attachment; filename=" + filename);
        this.view(fs.createReadStream(file));
    }
};