const moment = require("moment");
const { find } = require("geo-tz");

//     if (t < 0 || t >= 10) return "";
//     let assumeDate = new Date();
//     let sTime = moment(new Date().setHours(...start.split(":"))).add(t, "days");
//     if (t != 0) assumeDate = sTime;
//     let eTime = moment(new Date().setHours(...end.split(":"))).add(t, "days");

//     let hour = moment(assumeDate).add(delH, "hours").add(delM, "minutes");
//     if (hour < sTime) {
//         hour = moment(sTime).add(delH, "hours").add(delM, "minutes");
//     }
//     if (hour > eTime) {
//         let obj = moment.duration(hour.diff(eTime));
//         return deliveryCal(start, end, obj.hours(), obj.minutes(), t + 1);
//     } else {
//         return hour.format("dddd, MMMM Do YYYY, H:mm");
//     }

const deliveryCal = (start, end, delH, delM, zone, t = 0, mom = false) => {
    if (t < 0 || t >= 10) return "";
    let assumeDate = moment().tz(zone);
    let [sH, sM] = start.split(":");
    let [eH, eM] = end.split(":");
    let sTime = moment()
        .tz(zone)
        .set({ hour: sH, minute: sM, second: 0 })
        .add(t, "days");
    if (t != 0) assumeDate = sTime;
    let eTime = moment()
        .tz(zone)
        .set({ hour: eH, minute: eM, second: 0 })
        .add(t, "days");

    let hour = moment(assumeDate).add(delH, "hours").add(delM, "minutes");
    if (assumeDate < sTime || hour < sTime) {
        hour = moment(sTime).add(delH, "hours").add(delM, "minutes");
    }
    if (eTime < moment().tz(zone)) {
        return deliveryCal(start, end, delH, delM, zone, 1, mom);
    }
    if (hour > eTime) {
        let obj = moment.duration(hour.diff(eTime));
        return deliveryCal(
            start,
            end,
            obj.hours(),
            obj.minutes(),
            zone,
            t + 1,
            mom,
        );
    } else {
        if (mom) return hour;
        return hour.format("dddd, MMMM Do YYYY, h:mma");
    }
};

const deliveryCalWithExp = (start, end, delH, lat, lng, extraby = 0) => {
    let zones = find(lat, lng);
    let zone = zones.length == 0 ? "Asia/Kolkata" : zones[0];
    let delHourExact = delH > extraby ? extraby : delH;
    return deliveryCal(start, end, delHourExact, 0, zone);
};

const deliveryCalOrder = (start, end, delH, lat, lng, extraby = 1) => {
    let zones = find(lat, lng);
    let zone = zones.length == 0 ? "Asia/Kolkata" : zones[0];
    if (extraby <= 0) extraby = 1;
    let obj = deliveryCal(start, end, delH / extraby, 0, zone, 0, true).format(
        "YYYY-MM-DDTHH:mmZ",
    );
    console.log("T", obj);

    return obj;
};

module.exports = { deliveryCal, deliveryCalWithExp, deliveryCalOrder };
