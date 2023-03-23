import { Router } from "express";
import { DirectorController } from "../controllers/index.js";

const router = Router();
const directorController = new DirectorController();

//gets a;; directors
router.get('/all', directorController.getAll);

//gets a director based on Id
router.get('/:id', directorController.getById);

//creates a new director
router.post('/create', directorController.create);

export default router;