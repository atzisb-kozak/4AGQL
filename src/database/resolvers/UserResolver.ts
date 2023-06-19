/**
 * Import Modules
 */
import { User } from '../entity/user'
import { UserPayload } from './UserPayload';
import { CreateUserInput, LoginInput, UpdateUserInput} from './input';
import { logger } from '../../logger';
import { dataSource } from '../datasource';
import { jwtConfig } from '../../auth';
import jwt from 'jsonwebtoken';
import { compare } from 'bcrypt'

export const UserRepository = dataSource.getRepository(User);

/**
 * Args for FindOne resolvers
 *
 * @interface FindOneUserArgs
 */
interface FindOneUserArgs {
	userId: number;
}
/**
 * Args for Create resolvers
 *
 * @interface CreateUserArgs
 */
interface CreateUserArgs {
	user: CreateUserInput;
	token: string;
}
/**
 * Args for Update resolvers
 *
 * @interface UpdateUserArgs
 */
interface UpdateUserArgs {
	userId: number;
	user: UpdateUserInput;
	token: string;
}
/**
 * Args for Delete resolvers
 *
 * @interface DeleteUserArgs
 */
interface DeleteUserArgs {
	userId: number;
	token: string;
}

interface jwtPayload {
	userId: number;
}

/**
 * Args for login 
 * 
 * @interface LoginArgs
 */
interface LoginArgs{
	login: LoginInput
}
/**
 * GraphQL Resolvers for User's data
 *
 * @export
 * @class UserResolver
 */
export const UserResolver = {
	Query: {
		User: async(): Promise<User[]> => {
			return UserRepository.find();
		},
		UserID: (_, args: FindOneUserArgs): Promise<User | null> => {
			return UserRepository.findOneBy({ user_id: args.userId });
		}
	},
	
	Mutation: {
		createUser: async (_, args: CreateUserArgs): Promise<UserPayload> => {
			try{
				if (args.token) {
					throw new Error('User Autheticated')
				}
				const user = UserRepository.create(args.user);
				await user.save();
				return {
					success: true,
					data: user
				}
			} catch (error) {
				logger.error(`[UserResolver](createUser) : ${error.message}`)
				return {
					success: false,
					error: error.message
				}
			}

		},
		updateUser: async (_, args: UpdateUserArgs): Promise<UserPayload> => {
			try {
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: args.userId})
				if (user.userId !== userDB.user_id) {
					throw new Error('Unauthorize Operation')
				}
				const nbAffect = (
					await UserRepository.update(args.userId, {...args.user})).affected;

				if (nbAffect !== 0){
					return {
						success: true,
					}
				}
				throw new Error('data wasn\'t stored in database');
			} catch (error) {
				logger.error(`[UserResolver](updateUser) : ${error.message}`);
				return {
					success: false,
					error: error.message
				}
			}
		},
		deleteUser: async (_, args: DeleteUserArgs): Promise<UserPayload> => {
			try {
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: args.userId})
				if (user.userId !== userDB.user_id) {
					throw new Error('Unauthorize Operation')
				}
				const nbAffect = (await UserRepository.delete(args.userId)).affected;
				if (nbAffect !== 0) {
					return {
						success: true
					};
				}
				throw new Error('data wasn\'t stored in database');
			}catch (error) {
				logger.error(`[UserResolver](deleteUser) : ${error.message}`);
				return {
					success: false,
					error: error.message
				}
			}
		},
		register: async (_, args: CreateUserArgs): Promise<UserPayload> => {
			try {
				// Check if the email is already registered
				const existingUser = await UserRepository.findOneBy({ email: args.user.email });
				logger.info(existingUser)
				if (existingUser) {
					throw new Error('Email already registered');
				}

				if (args.user.token) {
					throw new Error('User already Connected')
				}
				// Create a new user
				const user = UserRepository.create(args.user);
				await user.save();

				// Generate JWT token
				const payload: jwtPayload = {userId: user.user_id}
				const token = jwt.sign(payload, jwtConfig.secretKey, {
					expiresIn: jwtConfig.expiresIn,
				});

				return {
					success: true,
					token: token,
					data: user,
				};
			} catch (error) {
				logger.error(`[UserResolver](register) : ${error.message}`)
				return {
					success: false,
					token: null,
					error: error.message
				}
			}
		},
		login: async (_, args: LoginArgs): Promise<UserPayload> => {
			try {
				if (args.login.token) {
					throw new Error('User already Connected')
				}
				// Create a new user
				const users = await UserRepository.find({
					where: {
						username: args.login.username
					}
				});
				
				const checkpassword = [];
				users.forEach(user => {
					logger.info(user)
					checkpassword.push(new Promise(resolve => {
						compare(args.login.password, user.password)
					}))
				})

				const result = await Promise.all(checkpassword);
				const index = result.findIndex(value => value === true)
				const user = users[index]
				const payload: jwtPayload = {userId: user.user_id}
				// Generate JWT token
				const token = jwt.sign(payload, jwtConfig.secretKey, {
					expiresIn: jwtConfig.expiresIn,
				});
				return {
					success: true,
					token: token,
					data: user,
				};
			} catch (error) {
				logger.error(`[UserResolver](register) : ${error.message}`)
				return {
					success: false,
					token: null,
					error: error.message
				}
			}
		}
	}
}