import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import { appRouter } from "./routes";

const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:4200";

async function main() {
    await AppDataSource.initialize();
    const app = express();

    app.use(express.json());
    app.use(cors({ origin: frontendOrigin }));
    app.use('/api', appRouter);

    app.use((err: any, _req: any, res: any, _next: any) => {
        console.error('Unhandled error:', err);
        res.status(500).json({ error: 'Internal server error' });
    });

    app.listen(3000, (err) => {
        if (err) {
            console.error(err);
            return;
        }

        console.log('Server is listening on port 3000.');
    });
}

main().catch(err => console.error(err));
