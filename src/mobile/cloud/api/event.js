const BASE = "/event";

module.exports = {
    get: {
        getEvents: `${BASE}/all`,
    },
    post: {
        generateQR: `${BASE}/qr`,
    },
};
