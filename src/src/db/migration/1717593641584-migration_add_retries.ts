import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationAddRetries1717593641584 implements MigrationInterface {
    name = 'MigrationAddRetries1717593641584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`cronExpression\` varchar(64) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`maxRetries\` smallint NOT NULL DEFAULT '3'
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`lastRetries\` int NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`calculatedNextRun\` int NOT NULL DEFAULT '-1'
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`payload\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`payload\` json NOT NULL DEFAULT '{}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`payload\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`payload\` longtext COLLATE "utf8mb4_bin" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`calculatedNextRun\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`lastRetries\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`maxRetries\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`cronExpression\`
        `);
    }

}
