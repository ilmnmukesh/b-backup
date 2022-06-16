const WALLET = "/wallet";

module.exports = {
    get: {
        getWallet: `${WALLET}/get/`,
        getCustomerWallet: `${WALLET}/get/:cid/`,
        generateQRCode: `${WALLET}/qr/:id/`,
        checkQRProcess: `${WALLET}/qr/check/:chid/`,
        searchCustomerWallet: `${WALLET}/search/`,
    },
    post: {
        updateQRStatus: `${WALLET}/qr/update/:chid/`,
    },
};
