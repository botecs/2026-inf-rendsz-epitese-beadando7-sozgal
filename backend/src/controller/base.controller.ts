import { Request, Response } from "express";
import { DeepPartial, Repository } from "typeorm";

export abstract class Controller<TEntity extends { id: number }> {
    protected abstract repository: Repository<TEntity>;

    getAll = async (_req: Request, res: Response) => {
        try {
            const entities = await this.repository.find();
            res.json(entities);
        } catch (err) {
            this.handleError(res, err);
        }
    };

    getOne = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);

            const entity = await this.repository.findOneBy({ id } as any);
            if (!entity) {
                return this.handleError(res, null, 404, 'No entity exists with the given id.');
            }

            res.json(entity);
        } catch (err) {
            this.handleError(res, err);
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const { id: _ignoredId, ...entityData } = req.body as DeepPartial<TEntity> & { id?: number };
            const entityToCreate = this.repository.create(entityData as DeepPartial<TEntity>);
            const entitySaved = await this.repository.save(entityToCreate);
            res.json(entitySaved);
        } catch (err) {
            this.handleError(res, err);
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const entityToSave = this.repository.create(req.body as DeepPartial<TEntity>);
            if (!entityToSave.id) {
                return this.handleError(res, null, 400, 'Entity id must be defined.');
            }

            const entity = await this.repository.findOneBy({ id: entityToSave.id } as any);
            if (!entity) {
                return this.handleError(res, null, 404, 'No entity exists with the given id.');
            }

            const entitySaved = await this.repository.save(entityToSave);
            res.json(entitySaved);
        } catch (err) {
            this.handleError(res, err);
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            const id = Number(req.params.id);
            const entity = await this.repository.findOneBy({ id } as any);
            if (!entity) {
                return this.handleError(res, null, 404, 'No entity exists with the given id.');
            }

            await this.repository.remove(entity);
            res.send();
        } catch (err) {
            this.handleError(res, err);
        }
    };

    handleError = (res: Response, err: unknown, status = 500, message = 'Unknown server error') => {
        if (err) {
            console.error(err);
        }

        res.status(status).json({ error: message });
    }
}
