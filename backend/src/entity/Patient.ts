import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Visit } from "./Visit";

@Entity()
export class Patient {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column()
    taj!: string;

    @Column({ type: 'date' })
    birthDate!: string;

    @Column()
    gender!: string;

    @OneToMany(() => Visit, (visit) => visit.patient)
    visits!: Visit[];
}
