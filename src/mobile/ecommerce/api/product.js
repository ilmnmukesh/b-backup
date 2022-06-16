const PRODUCT = "/product";

module.exports = {
    get: {
        searchProduct: `${PRODUCT}/search/`,
        getProductDetails: `${PRODUCT}/:pid/`,
        getProductVarient: `${PRODUCT}/varient/get`,
    },
    post: {
        getCategoryBased: `${PRODUCT}/category/`,
        getBrandBased: `${PRODUCT}/brand/`,
    },
};
