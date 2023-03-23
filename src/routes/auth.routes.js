import { Router } from "express";
import {AuthController } from "../controllers/index.js";

const router = Router();
const authController = new AuthController();

//creates an auth token
router.get('/token', authController.getToken);

//refreash auth token
router.post('/refresh-token', authController.getRefreshToken);

export default router;