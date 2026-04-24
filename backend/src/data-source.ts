import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3308,
    username: "root",
    //password: "test",
    database: "medical_db",
    synchronize: true,
    logging: true,
    entities: [], // ide kerül majd a többi entitás is
    subscribers: [],
    migrations: [],
});
