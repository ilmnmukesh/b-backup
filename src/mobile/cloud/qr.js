const QRCode = require("qrcode");
const { createCanvas, loadImage } = require("canvas");
const speakeasy = require("speakeasy");

const createQRWithCenterLogo = async (data, logo, QRwidth, logoWidth) => {
    const canvas = createCanvas(QRwidth, QRwidth);
    QRCode.toCanvas(canvas, data, {
        errorCorrectionLevel: "h",
        quality: 0.95,
        color: {
            dark: "#172121",
            light: "#FFFFFF",
        },
    });

    const ctx = canvas.getContext("2d");
    const img = await loadImage(logo);
    const center = (canvas.width - logoWidth) / 2;
    ctx.drawImage(img, center, center, logoWidth, logoWidth);
    return canvas.toDataURL("image/png");
};
const createQRurl = async (chId, t, alphaNum) => {
    let secret = speakeasy.generateSecret();

    let top = speakeasy.totp({
        secret: secret.base32,
        encoding: "base32",
        step: 60,
    });
    let url = `${process.env.HOST}/admin/pages/verify?ch=${chId}&t=${t}&sc=${top}&s=${secret.base32}&alnu=${alphaNum}`;
    return [
        await createQRWithCenterLogo(
            url,
            `${process.env.HOST}/images/brand.jpg`,
            210,
            40,
        ),
        url,
    ];
};

const validateQR = async (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: "base32",
        token: token,
        step: 60,
    });
};

module.exports = { createQRWithCenterLogo, createQRurl, validateQR };
