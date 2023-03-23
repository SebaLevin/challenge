import { Router } from "express";
import ActorsRoutes from "./actors.routes.js";
import DirectorsRoutes from "./directors.routes.js";
import MoviesRoutes from "./movies.routes.js";
import TvShowsRoutes from "./tvShows.routes.js";
import AuthRoutes from "./auth.routes.js"
import { authMiddleware } from "../middleware/auth.middleware.js"

const router = Router();


router.use('/auth', AuthRoutes)
router.use('/actors', authMiddleware, ActorsRoutes);
router.use('/directors', authMiddleware, DirectorsRoutes);
router.use('/movies', authMiddleware, MoviesRoutes);
router.use('/tvshows', authMiddleware, TvShowsRoutes);



export default router;