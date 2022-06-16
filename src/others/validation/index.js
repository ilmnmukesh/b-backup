const paramsValidation = (props) => {
    var errors = [];
    props.params.map((e) => {
        if (props.body[e] == null || props.body[e] == undefined) {
            let obj = {};
            obj[e] = "This field is required";
            errors.push(obj);
        }
    });
    if (errors.length != 0) {
        throw { errors };
    }
};

const paramsValidationSingleLine = (props) => {
    var errors = "( ";
    props.params.map((e) => {
        if (props.body[e] == null || props.body[e] == undefined) {
            errors += e + " ";
        }
    });
    if (errors != "( ") {
        throw errors + ") fields are required...";
    }
};

const uuidValidator = (string) => {
    const v4 = new RegExp(
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    );
    if (string.match(v4) == null) {
        throw { errors: "Required uuid4" };
    }
};

const orderParamsvalidation = (body) => {
    let props = {
        body: body,
        params: [
            "totalAmount",
            "subTotal",
            "shippingCost",
            "taxes",
            "convenienceFee",
            "tipForDriver",
            "order_products",
        ],
    };
    paramsValidation(props);
    paramsValidation({
        body: body.shipping_details,
        params: ["city", "address", "state", "country", "postalCode"],
    });

    body.order_products.map((e) => {
        props = {
            body: e,
            params: ["price", "quantity", "estimateDelivery", "varientId"],
        };
        paramsValidation(props);
    });
};

module.exports = {
    paramsValidation,
    uuidValidator,
    orderParamsvalidation,
    paramsValidationSingleLine,
};
