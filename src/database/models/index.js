module.exports = (sequelize) => {
    let model = {
        ...require("./token")(sequelize),
        ...require("./scheduler")(sequelize),
        ...require("./tandc")(sequelize),
        ...require("./admin")(sequelize),
        ...require("./customer")(sequelize),
        ...require("./shop")(sequelize),
        ...require("./partner")(sequelize),
        ...require("./product")(sequelize),
        ...require("./varient")(sequelize),
        ...require("./cart")(sequelize),
        ...require("./offer")(sequelize),
        ...require("./order")(sequelize),
        ...require("./cloud")(sequelize),
        ...require("./premium")(sequelize),
        User: "",
        Shop_Product: "",
        Shop_Type: "",
    };

    model.User = model.Customer;
    model.Shop_Product = model.Post;
    model.Shop_Type = model.ShopType;

    // token
    model.Token.belongsTo(model.Customer, { onDelete: "CASCADE" });
    model.Customer.hasOne(model.Token);

    // admin
    model.Partner.hasMany(model.Admin, { onDelete: "CASCADE" });
    model.Admin.belongsTo(model.Partner, { onDelete: "CASCADE" });

    model.Shop.hasOne(model.SellerAuth, { onDelete: "CASCADE" });
    model.SellerAuth.belongsTo(model.Shop);

    model.Shop.hasOne(model.Partner, { onDelete: "CASCADE" });
    model.Partner.belongsTo(model.Shop);

    // customer
    model.Customer.hasMany(model.ProfileInfo, { onDelete: "CASCADE" });
    model.ProfileInfo.belongsTo(model.Customer);

    // premium
    model.Customer.hasOne(model.Subscription, { onDelete: "CASCADE" });
    model.Premium.hasOne(model.Subscription, { onDelete: "CASCADE" });
    model.Subscription.belongsTo(model.Customer);
    model.Subscription.belongsTo(model.Premium);

    // shop
    model.Shop.belongsToMany(model.Category, {
        onDelete: "CASCADE",
        through: model.ShopType,
    });
    model.Category.belongsToMany(model.Shop, {
        onDelete: "CASCADE",
        through: model.ShopType,
    });

    model.ShopState.hasMany(model.Shop, { onDelete: "CASCADE" });
    model.Shop.belongsTo(model.ShopState);

    // product
    model.Category.hasMany(model.Product, { onDelete: "CASCADE" });
    model.Product.belongsTo(model.Category);

    model.Brand.hasMany(model.Product, { onDelete: "CASCADE" });
    model.Product.belongsTo(model.Brand);

    model.Product.belongsToMany(model.Shop, {
        onDelete: "CASCADE",
        through: { model: model.Post, unique: false },
        allowNull: false,
    });
    model.Shop.belongsToMany(model.Product, {
        onDelete: "CASCADE",
        through: { model: model.Post, unique: false },
        allowNull: false,
    });
    model.Varient.belongsToMany(model.Shop, {
        onDelete: "CASCADE",
        through: { model: model.Post, unique: false },
        allowNull: false,
    });
    model.Post.belongsTo(model.Varient);
    model.Post.belongsTo(model.Shop);
    model.Post.belongsTo(model.Product);

    // varient
    model.Product.hasMany(model.Varient, { onDelete: "CASCADE" });
    model.Varient.belongsTo(model.Product);

    model.Unit.hasMany(model.Varient, { onDelete: "CASCADE" });
    model.Varient.belongsTo(model.Unit);

    model.Multipler.hasMany(model.Varient, { onDelete: "CASCADE" });
    model.Varient.belongsTo(model.Multipler);

    // offer
    model.BestDrink.belongsTo(model.Product, { onDelete: "CASCADE" });
    model.Product.hasMany(model.BestDrink);

    //cart
    model.Varient.belongsToMany(model.Customer, {
        onDelete: "CASCADE",
        through: { model: model.Cart, unique: false },
    });
    model.Customer.belongsToMany(model.Varient, {
        onDelete: "CASCADE",
        through: { model: model.Cart, unique: false },
    });
    model.Shop.hasMany(model.Cart, { onDelete: "CASCADE" });

    model.Cart.belongsTo(model.Varient);
    model.Cart.belongsTo(model.Customer);
    model.Cart.belongsTo(model.Shop);

    // Order
    model.Customer.hasMany(model.Order, { onDelete: "CASCADE" });
    model.Order.belongsTo(model.Customer);

    model.Transaction.hasMany(model.Order, { onDelete: "CASCADE" });
    model.Order.belongsTo(model.Transaction);

    model.Shop.hasMany(model.Order, { onDelete: "CASCADE" });
    model.Order.belongsTo(model.Shop);

    model.Order.hasMany(model.OrderProduct, { onDelete: "CASCADE" });
    model.OrderProduct.belongsTo(model.Order);

    model.Varient.hasMany(model.OrderProduct, { onDelete: "CASCADE" });
    model.OrderProduct.belongsTo(model.Varient);

    model.Order.hasOne(model.ShippingDetails, { onDelete: "CASCADE" });
    model.ShippingDetails.belongsTo(model.Order);

    model.Order.hasOne(model.OrderCancel, { onDelete: "CASCADE" });
    model.OrderCancel.belongsTo(model.Order);

    model.MenuType.hasMany(model.MenuItem, { onDelete: "CASCADE" });
    model.MenuItem.belongsTo(model.MenuType);

    model.Partner.hasMany(model.MenuType, { onDelete: "CASCADE" });
    model.MenuType.belongsTo(model.Partner);

    model.Partner.hasMany(model.MenuItem, { onDelete: "CASCADE" });
    model.MenuItem.belongsTo(model.Partner);

    model.MenuItem.belongsToMany(model.Customer, {
        onDelete: "CASCADE",
        through: { model: model.KitchenCart, unique: false },
    });
    model.Customer.belongsToMany(model.MenuItem, {
        onDelete: "CASCADE",
        through: { model: model.KitchenCart, unique: false },
    });

    model.KitchenCart.belongsTo(model.MenuItem);
    model.KitchenCart.belongsTo(model.Customer);

    model.CloudWallet.belongsToMany(model.Customer, {
        onDelete: "CASCADE",
        through: { model: model.KitchenWallet, unique: false },
    });
    model.Customer.belongsToMany(model.CloudWallet, {
        onDelete: "CASCADE",
        through: { model: model.KitchenWallet, unique: false },
    });

    model.KitchenWallet.belongsTo(model.Partner, { onDelete: "CASCADE" });
    model.Partner.hasMany(model.KitchenWallet);

    model.KitchenWallet.belongsTo(model.Customer);
    model.KitchenWallet.belongsTo(model.CloudWallet);

    model.Partner.hasMany(model.Event, { onDelete: "CASCADE" });
    model.Event.belongsTo(model.Partner);

    model.Event.hasMany(model.EventReservation, { onDelete: "CASCADE" });
    model.EventReservation.belongsTo(model.Event);

    model.Customer.hasMany(model.EventReservation, { onDelete: "CASCADE" });
    model.EventReservation.belongsTo(model.Customer);

    model.Transaction.hasMany(model.EventReservation, { onDelete: "CASCADE" });
    model.EventReservation.belongsTo(model.Transaction);

    model.Partner.belongsToMany(model.Amenitites, {
        onDelete: "CASCADE",
        through: model.AmenititesMenu,
    });
    model.Amenitites.belongsToMany(model.Partner, {
        onDelete: "CASCADE",
        through: model.AmenititesMenu,
    });

    model.Review.belongsTo(model.Partner, { onDelete: "CASCADE" });
    model.Partner.hasMany(model.Review, { onDelete: "CASCADE" });

    model.Partner.hasMany(model.Reservation, { onDelete: "CASCADE" });
    model.Reservation.belongsTo(model.Partner, { onDelete: "CASCADE" });

    model.Customer.hasMany(model.Reservation, { onDelete: "CASCADE" });
    model.Reservation.belongsTo(model.Customer, { onDelete: "CASCADE" });

    model.Varient.hasMany(model.CloudWallet, { onDelete: "CASCADE" });
    model.CloudWallet.belongsTo(model.Varient, { onDelete: "CASCADE" });

    model.Product.hasMany(model.CloudWallet, { onDelete: "CASCADE" });
    model.CloudWallet.belongsTo(model.Product, { onDelete: "CASCADE" });

    model.Customer.hasMany(model.CloudWallet, { onDelete: "CASCADE" });
    model.CloudWallet.belongsTo(model.Customer, { onDelete: "CASCADE" });

    model.Post.hasMany(model.CloudWallet, { onDelete: "CASCADE" });
    model.CloudWallet.belongsTo(model.Post, { onDelete: "CASCADE" });

    model.Partner.hasMany(model.CloudHistory, { onDelete: "CASCADE" });
    model.CloudHistory.belongsTo(model.Partner, { onDelete: "CASCADE" });

    model.Event.hasMany(model.EventImage, { onDelete: "CASCADE" });
    model.EventImage.belongsTo(model.Event, { onDelete: "CASCADE" });

    // cloud carts
    model.Varient.belongsToMany(model.Customer, {
        onDelete: "CASCADE",
        through: { model: model.CloudCart, unique: false },
    });
    model.Customer.belongsToMany(model.Varient, {
        onDelete: "CASCADE",
        through: { model: model.CloudCart, unique: false },
    });
    model.Shop.hasMany(model.CloudCart, { onDelete: "CASCADE" });

    model.CloudCart.belongsTo(model.Varient);
    model.CloudCart.belongsTo(model.Customer);
    model.CloudCart.belongsTo(model.Shop);

    //cloud orders
    model.Customer.hasMany(model.CloudOrder, { onDelete: "CASCADE" });
    model.CloudOrder.belongsTo(model.Customer);

    model.Transaction.hasMany(model.CloudOrder, { onDelete: "CASCADE" });
    model.CloudOrder.belongsTo(model.Transaction);

    model.Shop.hasMany(model.CloudOrder, { onDelete: "CASCADE" });
    model.CloudOrder.belongsTo(model.Shop);

    model.CloudOrder.hasMany(model.CloudOrderProduct, { onDelete: "CASCADE" });
    model.CloudOrderProduct.belongsTo(model.CloudOrder);

    model.Varient.hasMany(model.CloudOrderProduct, { onDelete: "CASCADE" });
    model.CloudOrderProduct.belongsTo(model.Varient);

    // cloud wallet
    model.CloudWallet.hasMany(model.CloudHistory, { onDelete: "CASCADE" });
    model.CloudHistory.belongsTo(model.CloudWallet);

    // shop review
    model.ShopReview.belongsTo(model.Shop, { onDelete: "CASCADE" });
    model.Shop.hasMany(model.ShopReview, { onDelete: "CASCADE" });

    // kitchen order
    model.Customer.hasMany(model.KitchenOrder, { onDelete: "CASCADE" });
    model.KitchenOrder.belongsTo(model.Customer, { onDelete: "CASCADE" });

    model.Transaction.hasMany(model.KitchenOrder, { onDelete: "CASCADE" });
    model.KitchenOrder.belongsTo(model.Transaction);

    model.Partner.hasMany(model.KitchenOrder, { onDelete: "CASCADE" });
    model.KitchenOrder.belongsTo(model.Partner);

    model.KitchenOrder.hasMany(model.KitchenOrderProduct, {
        onDelete: "CASCADE",
    });
    model.KitchenOrderProduct.belongsTo(model.KitchenOrder);

    model.MenuItem.hasMany(model.KitchenOrderProduct, { onDelete: "CASCADE" });
    model.KitchenOrderProduct.belongsTo(model.MenuItem);

    return model;
};
