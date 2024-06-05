import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationMakeBigInt1717594325781 implements MigrationInterface {
    name = 'MigrationMakeBigInt1717594325781'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`calculatedNextRun\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`calculatedNextRun\` bigint NOT NULL DEFAULT '-1'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`job\` DROP COLUMN \`calculatedNextRun\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`job\`
            ADD \`calculatedNextRun\` int NOT NULL DEFAULT -1
        `);
    }

}
