import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initialize1718092999981 implements MigrationInterface {
  name = 'Initialize1718092999981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "account_transactions" ("hash" character varying NOT NULL, "timestamp" integer NOT NULL, "lt" character varying NOT NULL, "totalFees" character varying NOT NULL, "source" character varying NOT NULL, "destination" character varying NOT NULL, "value" character varying NOT NULL, "message" character varying NOT NULL, CONSTRAINT "PK_128c1f9fa229d6ce6d0818a87f1" PRIMARY KEY ("hash"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "account_transactions"`);
  }
}
