import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";

async function main() {
    await AppDataSource.initialize();
    const app = express();

    app.use(express.json());

    //app.use('/api', appRouter);

    app.listen(3000, (err) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('Server is listening on port 3000.');
    });
}

main().catch(err => console.error(err));
