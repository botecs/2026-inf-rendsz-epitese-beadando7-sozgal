import { Controller } from "./base.controller";
import { AppDataSource } from "../data-source";
import { Patient } from "../entity/Patient";
import { Request, Response } from "express";

export class PatientController extends Controller<Patient> {
    protected repository = AppDataSource.getRepository(Patient);

    getScreenings = async (_req: Request, res: Response) => {
        try {
            const patients = await this.repository.find();
            const currentYear = new Date().getFullYear();

            const screeningList = patients.map(patient => {
                const birthYear = new Date(patient.birthDate).getFullYear();
                const age = currentYear - birthYear;
                const requiredScreenings: string[] = [];

                if (age >= 18) {
                    requiredScreenings.push('Tüdőszűrő vizsgálat (évente)');
                }

                if (patient.gender === 'male' && age >= 35) {
                    requiredScreenings.push('Prosztata vizsgálat (2 évente)');
                }

                if (patient.gender === 'female' && age >= 45) {
                    requiredScreenings.push('Mammográfiai vizsgálat (3 évente)');
                }

                requiredScreenings.push('Általános vizsgálat (5 évente)');

                return {
                    name: patient.name,
                    taj: patient.taj,
                    age: age,
                    screenings: requiredScreenings
                };
            });

            res.json(screeningList);
        } catch (err) {
            this.handleError(res, err);
        }
    }
}
