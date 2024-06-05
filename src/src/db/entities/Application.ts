import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {CreateUpdateBaseEntity} from "../baseEntities/CreateUpdateBaseEntity";
import {Job} from "./Job";
import {SensitiveInfo} from "../decorator/SensitiveInfo";

@Entity()
export class Application extends CreateUpdateBaseEntity {

    /**
     * Represents the identifier of an entity.
     */
    @PrimaryGeneratedColumn()
    id: number;


    /**
     * Represents the name of Application or an description to Identify Applications in Database.
     */
    @Column({
        type: "text"
    })
    name: string;

    /**
     * System Privilege allows Application to manage the system via REST
     */
    @Column({
        type: "boolean",
        default: false
    })
    hasSystemPrivilege: boolean;

    /**
     * Unique Key - default Unique Key Format
     */
    @SensitiveInfo
    @Column({
        type: "varchar",
        length: 50,
        unique: true
    })
    authKey: string;

    /**
     * Secrets should be encrypted / hashed
     */
    @Column({
        type: "varchar",
        length: 256
    })
    @SensitiveInfo
    authSecret: string;

    /**
     * Token that is send as Bearer or as Token field in Webhook/Queue
     */
    @Column({
        type: "varchar",
        length: 256
    })
    @SensitiveInfo
    applicationSecurityToken: string;

    /**
     * URL Where to send POST Call in Case of Job Execution - as it is only required if application has sync Webhooks it is optional here
     */
    @Column({
        type: "varchar",
        length: 128,
        nullable: true
    })
    webhookUrl?: string;

    /**
     * StationName Where to write in Case of Job Execution - as it is only required if application has async execution it is optional here
     */
    @Column({
        type: "varchar",
        length: 64,
        nullable: true
    })
    stationName?: string;

    @OneToMany(() => Job, job => job.application, {
        cascade: true
    })
    jobs: Job[]
}