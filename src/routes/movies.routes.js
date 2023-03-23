import { Router } from "express";
import { MovieController } from "../controllers/index.js";

const router = Router();
const movieController = new MovieController();

//gets all movies
router.get('/all', movieController.getAll);

//gets all movies based on query
router.get('/search', movieController.search);

//gets a movie based on Id
router.get('/:id', movieController.getById);

//cretes a new movie
router.post('/create', movieController.create);

export default router;