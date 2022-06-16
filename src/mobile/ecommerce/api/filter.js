const FILTER = "/filter";

module.exports = {
    get: {
        filterDashboard: `${FILTER}/dashboard/`,
    },
    post: {
        rangeFilter: `${FILTER}/range/`,
        combineFilter: `${FILTER}`,
    },
};
