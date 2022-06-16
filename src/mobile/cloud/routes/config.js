const decorator = require("../../../others/decorator");

module.exports = (router, service, controller) => {
    for (const obj of Object.getOwnPropertyNames(service.get)) {
        router.get(service.get[obj], decorator(controller[obj]));
    }
    for (const obj of Object.getOwnPropertyNames(service.post)) {
        router.post(service.post[obj], decorator(controller[obj]));
    }
};

// module.exports = (cnt = 0) => {
//     const decorator = require("../../others/decorator");
//     const routerFunc = (router, service, controller) => {
//         for (const obj of Object.getOwnPropertyNames(service.get)) {
//             cnt++;
//             router.get(service.get[obj], decorator(controller[obj]));
//         }
//         console.log(Object.getOwnPropertyNames(service.post));
//         for (const obj of Object.getOwnPropertyNames(service.post)) {
//             cnt++;
//             router.post(service.post[obj], decorator(controller[obj]));
//         }
//         return cnt;
//     };
//     return routerFunc;
// };
