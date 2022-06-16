require("dotenv").config();
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
const fs = require("fs");

const upload = (path) => {
    fs.readFile(path, (err, data) => {
        if (err) throw err;
        var params = {
            Key: path.replace("./assets/", ""),
            Body: data,
            Bucket: process.env.AWS_BUCKET_NAME,
            ContentEncoding: "base64",
            ContentType: "image/*",
        };
        s3.upload(params, (e, d) => {
            console.log(e, d);
            fs.unlinkSync(path);
        });
    });
};

const read = (base) => {
    fs.readdir(base, (_, path) => {
        if (_) throw _;
        readOrUpload(base, path);
    });
};

const readOrUpload = (b, path) => {
    for (const p of path) {
        let b_ = b + p;
        if (fs.lstatSync(b_).isFile()) {
            upload(b_);
        } else {
            read(b_ + "/");
        }
    }
};

const readJSON = (base) => {
    fs.readdir(base, (_, path) => {
        if (_) throw _;
        for (const p of path) {
            let b_ = base + p;

            if (p != "shop_product.json" && fs.lstatSync(b_).isFile()) {
                fs.readFile(b_, "utf8", (_, data) => {
                    if (_) throw _;
                    var res = data.replace(
                        /https:\/\/boo\.ilmnmukesh\.me+/gm,
                        `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com`,
                    );
                    fs.writeFile(b_, res, "utf8", function (err) {
                        return err;
                    });
                });
            }
        }
    });
};

if (process.argv[2] == "run") {
    read("./assets/images/");
    readJSON("./dummy/");
}
