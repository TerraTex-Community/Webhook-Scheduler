import {BaseEntity, CreateDateColumn, UpdateDateColumn} from "typeorm";


export class CreateUpdateBaseEntity extends BaseEntity {


    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;
}