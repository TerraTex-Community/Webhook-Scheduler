import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationAddNameToApplication1717159053508 implements MigrationInterface {
    name = 'MigrationAddNameToApplication1717159053508'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`application\`
            ADD \`name\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`application\` DROP COLUMN \`name\`
        `);
    }

}
