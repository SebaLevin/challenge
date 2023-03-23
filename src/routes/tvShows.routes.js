import { Router } from "express";
import { TvShowController } from "../controllers/index.js";

const router = Router();
const tvShowController = new TvShowController();

//gets all tvshows
router.get('/all', tvShowController.getAll);

//gets a tvshow based on Id
router.get('/:id', tvShowController.getById);

//creates a new tvshow
router.post('/create', tvShowController.create);

export default router;