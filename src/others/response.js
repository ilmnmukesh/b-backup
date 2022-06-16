class ResponseObj {
    constructor(_s = false, _d = {}, _e = {}, _ds = "") {
        this.success = _s;
        this.data = _d;
        this.errors = _e;
        this.description = _ds;
    }

    data() {
        return {
            success: this.success,
            data: this.data,
            errors: this.errors,
            description: this.description,
        };
    }
}

module.exports = { ResponseObj };
