import { Router, type IRouter } from "express";
import healthRouter from "./health";
import measurementsRouter from "./measurements";
import signsRouter from "./signs";
import routesHandlerRouter from "./routes-handler";
import alertsRouter from "./alerts";
import analyticsRouter from "./analytics";
import reportsRouter from "./reports";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(measurementsRouter);
router.use(signsRouter);
router.use(routesHandlerRouter);
router.use(alertsRouter);
router.use(analyticsRouter);
router.use(reportsRouter);
router.use(uploadRouter);

export default router;
