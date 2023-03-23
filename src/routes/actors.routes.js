import { Router } from "express";
import { ActorController } from "../controllers/index.js";

const router = Router();
const actorController = new ActorController();

//gets all actors
router.get('/all', actorController.getAll);

//gets a actor based on Id
router.get('/:id', actorController.getById);

//creates a new actor
router.post('/create', actorController.create);

export default router;