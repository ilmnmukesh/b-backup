module.exports = {
    HOST: process.env.PSQL_HOST,
    USER: process.env.PSQL_USERNAME,
    PASSWORD: process.env.PSQL_PASSWORD,
    DB: process.env.PSQL_DATABASE,
    dialect: "postgres",
    pool: {
        max: 100,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
};
