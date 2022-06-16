const ENUM_TYPE = {
    SUBCRIPTION: "subscription",
    CLOUD_ORDER: "cloud",
    E_COM_ORDER: "e-commerce",
    KITCHEN_ORDER: "kitchen",
    EVENT_BOOKING: "event_booking",
};

const typeCheck = (e) => {
    return !Object.values(ENUM_TYPE).includes(e);
};

module.exports = { ENUM_TYPE, typeCheck };
