/**
 * Import Modules
 */
import { Class } from '../entity/class'
import { ClassPayload } from './ClassPayload';
import { CreateClassInput, LoginInput, UpdateClassInput} from './input';
import { logger } from '../../logger';
import { dataSource } from '../datasource';
import { jwtConfig } from '../../auth';
import jwt from 'jsonwebtoken';
import { compare } from 'bcrypt'
import { UserRepository } from './UserResolver';

const _ClassRepository = dataSource.getRepository(Class);

/**
 * Args for FindOne resolvers
 *
 * @interface FindOneClassArgs
 */
interface FindOneClassArgs {
	classId: number
}
/**
 * Args for Create resolvers
 *
 * @interface CreateClassArgs
 */
interface CreateClassArgs {
	classe: CreateClassInput;
	token: string;
}
/**
 * Args for Update resolvers
 *
 * @interface UpdateClassArgs
 */
interface UpdateClassArgs {
	ClassId: number;
	Class: UpdateClassInput;
	token: string;
}
/**
 * Args for Delete resolvers
 *
 * @interface DeleteClassArgs
 */
interface DeleteClassArgs {
	ClassId: number;
	token: string;
}


/**
 * GraphQL Resolvers for Class's data
 *
 * @export
 * @class ClassResolver
 */
export const ClassResolver = {
	Query: {
		Class: async(): Promise<Class[]> => {
			return _ClassRepository.find();
		},
		ClassID: (_, args: FindOneClassArgs): Promise<Class | null> => {
			return _ClassRepository.findOneBy({ class_id: args.classId });
		}
	},
	
	Mutation: {
		createClass: async (_, args: CreateClassArgs): Promise<ClassPayload> => {
			try{
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: user.userId})
				if (userDB.role !== "Teacher") {
					throw new Error('Unauthorize Operation')
				}
				const Class = _ClassRepository.create(args.classe);
				await Class.save();
				return {
					success: true,
					data: Class
				}
			} catch (error) {
				logger.error(`[ClassResolver](createClass) : ${error.message}`)
				return {
					success: false,
					error: error.message
				}
			}

		},
		updateClass: async (_, args: UpdateClassArgs): Promise<ClassPayload> => {
			try {
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: user.userId})
				if (userDB.role !== "Teacher") {
					throw new Error('Unauthorize Operation')
				}
				const nbAffect = (
					await _ClassRepository.update(args.ClassId, {...args.Class})).affected;

				if (nbAffect !== 0){
					return {
						success: true,
					}
				}
				throw new Error('data wasn\'t stored in database');
			} catch (error) {
				logger.error(`[ClassResolver](updateClass) : ${error.message}`);
				return {
					success: false,
					error: error.message
				}
			}
		},
		deleteClass: async (_, args: DeleteClassArgs): Promise<ClassPayload> => {
			try {
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: user.userId})
				if (userDB.role !== "Teacher") {
					throw new Error('Unauthorize Operation')
				}
				const nbAffect = (await _ClassRepository.delete(args.ClassId)).affected;
				if (nbAffect !== 0) {
					return {
						success: true
					};
				}
				throw new Error('data wasn\'t stored in database');
			}catch (error) {
				logger.error(`[ClassResolver](deleteClass) : ${error.message}`);
				return {
					success: false,
					error: error.message
				}
			}
		}
	}
}