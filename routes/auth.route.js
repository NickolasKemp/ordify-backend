const express = require("express");

const authController = require("../controllers/auth.controller");
const { body } = require("express-validator");

const router = express.Router();
/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication API
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User registered in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post(
	"/register",
	body("email").isEmail(),
	body("password").isLength({ min: 4, max: 32 }),
	authController.register,
);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication API
 * /auth/activate:
 *   get:
 *     summary: Activate the user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User was activated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.get("/activate/:link", authController.activate);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication API
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/login", authController.login);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication API
 * /auth/logout:
 *   get:
 *     summary: Logout the user
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Token'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/logout", authController.logout);

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication API
 * /auth/refresh:
 *   get:
 *     summary: Refresh the access token
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT refresh token
 *               example:
 *                 accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/refresh", authController.refresh);

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
 *     Token:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *           description: User id
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *       example:
 *         user: 5f1d7f3b0b1e8a1b2c3d4e5f
 *         refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         accessToken:
 *           type: string
 *           description: JWT access token
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token
 *       example:
 *         user:
 *           email: test2@gmail.com
 *           password: $2b$04$Rp3cZEgMtTvrcRxu2Sm0MOoYTfAGrfQUZLEdqV8YvlxfQ4o3tpVIC
 *         accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 */
