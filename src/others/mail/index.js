const { createTransport } = require("nodemailer");
const FROM_MAIL = "boozeo.test@gmail.com";

const transport = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: FROM_MAIL,
        pass: "Boozeo123@!",
    },
});

const sendMail = async (email, text) => {
    const mail = {
        from: email,
        to: FROM_MAIL,
        subject: "Gmail Testing",
        text: `
        from:
            ${email}        

        message:
            ${text}
          `,
    };
    return await transport.sendMail(mail);
};

module.exports = {
    sendMail,
};
