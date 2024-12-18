import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotEnv from 'dotenv';

dotEnv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
