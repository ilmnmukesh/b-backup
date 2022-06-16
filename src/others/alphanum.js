const SIZE = 16;
// abcdefghijklmnopqrstuvwxyz
const ALPHANUM = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const randomAlphaNum = () => {
    var resRead = "";
    var res = "";
    let cnt = 0;
    for (var i = SIZE; i > 0; --i) {
        if (cnt == parseInt(SIZE / 4)) {
            resRead += "-";
            cnt = 0;
        }
        let val = ALPHANUM[Math.floor(Math.random() * ALPHANUM.length)];
        res += val;
        resRead += val;
        cnt += 1;
    }
    return [res, resRead];
};

module.exports = {
    randomAlphaNum,
};
