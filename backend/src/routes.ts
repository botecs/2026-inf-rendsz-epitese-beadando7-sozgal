import express from 'express';
import { PatientController } from './controller/patient.controller';
import { VisitController } from './controller/visit.controller';

export const appRouter = express.Router();

const patientController = new PatientController();
const visitController = new VisitController();

appRouter.get('/patients', patientController.getAll);
appRouter.get('/patients/:id', patientController.getOne);
appRouter.post('/patients', patientController.create);
appRouter.put('/patients', patientController.update);
appRouter.delete('/patients/:id', patientController.delete);

appRouter.get('/screenings', patientController.getScreenings);

appRouter.get('/visits', visitController.getAll);
appRouter.post('/visits', visitController.create);
appRouter.get('/visits/history/:patientId', visitController.getHistoryByPatientId);
appRouter.put('/visits', visitController.update);
appRouter.delete('/visits/:id', visitController.delete);
