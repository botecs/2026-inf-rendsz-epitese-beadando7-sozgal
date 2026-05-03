import { Controller } from "./base.controller";
import { AppDataSource } from "../data-source";
import { Visit } from "../entity/Visit";
import { Patient } from "../entity/Patient";
import { Request, Response } from "express";
import { DeepPartial } from "typeorm";

export class VisitController extends Controller<Visit> {
    protected repository = AppDataSource.getRepository(Visit);
    private patientRepository = AppDataSource.getRepository(Patient);

    create = async (req: Request, res: Response) => {
        try {
            if (!req.body.patient?.id) {
                return this.handleError(res, null, 400, 'A beteg azonosítója kötelező.');
            }

            const patient = await this.patientRepository.findOneBy({
                id: req.body.patient.id
            });

            if (!patient) {
                return this.handleError(res, null, 404, 'A megadott beteg nem létezik.');
            }

            const visit = this.repository.create(req.body as DeepPartial<Visit>);
            visit.patient = patient;

            const savedVisit = await this.repository.save(visit);
            res.json(savedVisit);
        } catch (err) {
            this.handleError(res, err);
        }
    }

    // Segédfüggvény: Kórtörténet listázása egy adott beteghez
    getHistoryByPatientId = async (req: Request, res: Response) => {
        try {
            const patientId = Number(req.params.patientId);
            const history = await this.repository.find({
                where: { patient: { id: patientId as any } },
                order: { date: "DESC" }
            });
            res.json(history);
        } catch (err) {
            this.handleError(res, err);
        }
    }

    // Update a visit (override to validate patient references)
    update = async (req: Request, res: Response) => {
        try {
            const visitId = Number(req.body.id);

            if (!visitId) {
                return this.handleError(res, null, 400, 'A vizit azonosítója kötelező.');
            }

            const existing = await this.repository.findOneBy({ id: visitId } as any);
            if (!existing) {
                return this.handleError(res, null, 404, 'A megadott vizit nem található.');
            }

            // If a patient reference is provided, ensure the patient exists
            let patient;
            if (req.body.patient?.id) {
                patient = await this.patientRepository.findOneBy({ id: req.body.patient.id });
                if (!patient) {
                    return this.handleError(res, null, 404, 'A megadott beteg nem létezik.');
                }
            }

            const toSave = this.repository.create(req.body as DeepPartial<Visit>);
            toSave.id = visitId as any;

            if (patient) {
                toSave.patient = patient as any;
            }

            const saved = await this.repository.save(toSave as DeepPartial<Visit>);
            res.json(saved);
        } catch (err) {
            this.handleError(res, err);
        }
    }
}
