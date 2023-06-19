import { DataSource } from "typeorm";

export const dataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	username: 'admin',
	password: 'admin',
	database: 'dev',
	synchronize: true,
	logging: true,
	entities: [`src/database/entity/**/*.ts`]
});
