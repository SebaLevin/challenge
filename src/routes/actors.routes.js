import { Router } from "express";
import { ActorController } from "../controllers/index.js";

const router = Router();
const actorController = new ActorController();

router.get('/all', actorController.getAll);
router.get('/:id', actorController.getById);
router.post('/create', actorController.create);

export default router;