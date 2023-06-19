/**
 * Import Modules
 */
import "reflect-metadata";
import express, { Express } from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { json } from 'body-parser';
import cors from 'cors';
import http from 'http';
import { loadSchema } from '@graphql-tools/load';
import { logger } from './logger';
import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { dataSource } from "./database/datasource";

/**
 * Initialize GraphQL API Server (Apollo)
 *
 * @return {*}  {(Promise<{server: ApolloServer, app: Express} | undefined>)}
 */
async function startApolloServer(): Promise<{server: ApolloServer, app: Express} | undefined> {
	try{
		// Setup Connection and Schema for Postgres Database
		await dataSource.initialize();
		const typeDefs = await loadSchema('schema.gql', {
			loaders: [
				new GraphQLFileLoader()
			]
		});
		let userResolver = (
			await import('./database/resolvers/UserResolver')
		).UserResolver;

		let classResolver = (
			await import('./database/resolvers/ClassResolvers')
		).ClassResolver;

		let gradeResolver = (
			await import('./database/resolvers/GradeResolvers')
		).GradeResolver;

		const resolvers = [userResolver, classResolver, gradeResolver];
		const schema = makeExecutableSchema({
			typeDefs,
			resolvers
		}); 

		// Initialize Express + Apollo GraphQL Server
		const app = express();
		const httpServer = http.createServer(app)
		const server = new ApolloServer({
			schema,
			introspection: true,
			plugins: [ApolloServerPluginDrainHttpServer({ httpServer })]
		});
		await server.start();
		app.use('/graphql', cors<cors.CorsRequest>(), json(), expressMiddleware(server, {
			context: async ({req}) => ({ token: req.headers.token	}),
		}));
	
		// TODO: change default port .env 
		// listen port 4000
		new Promise(resolve => httpServer.listen({ port: 4000 }));
		logger.info(`🚀 Server ready at http://localhost:4000`);
		return { server, app };

	} catch (error) {
		// unexcepted Error at launch
		logger.error(`[App](startApolloServer) : ${error.message}`);
	}
}

startApolloServer();