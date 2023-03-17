import { Router } from "express";
import { DirectorController } from "../controllers/index.js";

const router = Router();
const directorController = new DirectorController();

router.get('/all', directorController.getAll )
router.get('/:id', directorController.getById)
router.post('/create', directorController.create)

export default router;