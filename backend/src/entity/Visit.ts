import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Patient } from "./Patient";

@Entity()
export class Visit {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'date' })
    date!: string;

    @Column('text')
    diagnosis!: string;

    @Column('text')
    medications!: string;

    @Column('text')
    treatments!: string;

    @Column('text', { nullable: true })
    documents?: string;

    @ManyToOne(() => Patient, (patient) => patient.visits, {
        onDelete: "CASCADE"
    })
    patient!: Patient;
}
