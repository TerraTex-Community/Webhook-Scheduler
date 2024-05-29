import {Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique} from "typeorm";
import {CreateUpdateBaseEntity} from "../baseEntities/CreateUpdateBaseEntity";
import {Application} from "./Application";


export enum JobExecutionType {
    asyncQueue,
    webhook
}

@Unique(["application", "taskKey"])
@Entity()
export class Job extends CreateUpdateBaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    /**
     * Unique taskKey per Application that will be sent during Schedule Webhook Call
     */
    @Column({
        type: "varchar",
        length: 50
    })
    taskKey: string;

    @Column({
        type: "json"
    })
    payload: any;

    @Column({
        type: "date",
        nullable: true,
        default: null
    })
    lastExecution: Date|null;

    @Column({
        default: 0
    })
    lastFailedCount: number = 0;

    @Column({
        type: "enum",
        enum: JobExecutionType,
        default: JobExecutionType.webhook
    })
    jobExecutionType: JobExecutionType

    @ManyToOne(() => Application, (app) => app.jobs, {
        onDelete: "CASCADE",
        nullable: false
    })
    application: Application;
}