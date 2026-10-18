/**
 * @file passwordReset.routes.js
 * @description Authentication password reset routes aliasing server/routes/member/otpRoute.js
 */

import otpRoute from "../member/otpRoute.js";
export * from "../../controller/Authentication/passwordReset.controller.js";
export default otpRoute;
