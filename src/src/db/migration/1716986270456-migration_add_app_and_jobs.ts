import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationAddAppAndJobs1716986270456 implements MigrationInterface {
    name = 'MigrationAddAppAndJobs1716986270456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`application\` (
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`hasSystemPrivilege\` tinyint NOT NULL DEFAULT 0,
                \`authKey\` varchar(50) NOT NULL,
                \`authSecret\` varchar(256) NOT NULL,
                \`applicationSecurityToken\` varchar(256) NOT NULL,
                \`webhookUrl\` varchar(128) NULL,
                \`stationName\` varchar(64) NULL,
                UNIQUE INDEX \`IDX_4357194f27cb67a0ed2c752aa8\` (\`authKey\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`job\` (
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`taskKey\` varchar(50) NOT NULL,
                \`payload\` json NOT NULL,
                \`lastExecution\` date NULL,
                \`lastFailedCount\` int NOT NULL DEFAULT '0',
                \`jobExecutionType\` enum ('0', '1') NOT NULL DEFAULT '1',
                \`applicationId\` int NOT NULL,
                UNIQUE INDEX \`IDX_83128e2dd13940ca2af6ae6fa6\` (\`applicationId\`, \`taskKey\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD CONSTRAINT \`FK_33a3aa16cb1365067b8729d15e2\` FOREIGN KEY (\`applicationId\`) REFERENCES \`application\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP FOREIGN KEY \`FK_33a3aa16cb1365067b8729d15e2\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_83128e2dd13940ca2af6ae6fa6\` ON \`job\`
        `);
        await queryRunner.query(`
            DROP TABLE \`job\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4357194f27cb67a0ed2c752aa8\` ON \`application\`
        `);
        await queryRunner.query(`
            DROP TABLE \`application\`
        `);
    }

}
