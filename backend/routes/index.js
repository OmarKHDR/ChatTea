import { Router } from 'express';
import appController from '../controller/appController';

const routes = Router();
routes.get('/status', appController.checkStatus);
routes.get('/stats', appController.checkStats);


export default routes;
