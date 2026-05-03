import { DataSource } from "typeorm";
import { Patient } from "./entity/Patient";
import { Visit } from "./entity/Visit";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3308,
    username: "root",
    //password: "test",
    database: "medical_db",
    synchronize: true,
    logging: true,
    entities: [Patient, Visit],
    subscribers: [],
    migrations: [],
});
