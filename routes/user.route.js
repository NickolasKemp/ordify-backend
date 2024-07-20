const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");

const router = express.Router();

router.get("/", authMiddleware, userController.getUsers);

module.exports = router;

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *           format: password
 *         isActivated:
 *           type: boolean
 *           description: Whether the user is activated
 *         activationLink:
 *           type: string
 *           description: Activation link for the user
 *       example:
 *         email: user@example.com
 *         password: password1234
 *         isActivated: false
 *         activationLink: "34337f07-c2b0-49fc-ad06-a799ce9e1aa9"
 */
