/**
 * Import Modules
 */
import { Grade } from '../entity/grade'
import { GradePayload } from './GradePayload';
import { CreateGradeInput, LoginInput, UpdateGradeInput} from './input';
import { logger } from '../../logger';
import { dataSource } from '../datasource';
import { jwtConfig } from '../../auth';
import jwt from 'jsonwebtoken';
import { compare } from 'bcrypt'
import { UserRepository } from './UserResolver';

const _GradeRepository = dataSource.getRepository(Grade);

/**
 * Args for FindOne resolvers
 *
 * @interface FindOneGradeArgs
 */
interface FindOneGradeArgs {
	gradeId: number
}
/**
 * Args for Create resolvers
 *
 * @interface CreateGradeArgs
 */
interface CreateGradeArgs {
	grade: CreateGradeInput;
	token: string;
}
/**
 * Args for Update resolvers
 *
 * @interface UpdateGradeArgs
 */
interface UpdateGradeArgs {
	gradeId: number;
	grade: UpdateGradeInput;
	token: string
}
/**
 * Args for Delete resolvers
 *
 * @interface DeleteGradeArgs
 */
interface DeleteGradeArgs {
	gradeId: number;
	token: string;
}

/**
 * GraphQL Resolvers for Grade's data
 *
 * @export
 * @class GradeResolver
 */
export const GradeResolver = {
	Query: {
		Grade: async(): Promise<Grade[]> => {
			return _GradeRepository.find();
		},
		GradeID: (_, args: FindOneGradeArgs): Promise<Grade | null> => {
			return _GradeRepository.findOneBy({ grade_id: args.gradeId });
		}
	},
	
	Mutation: {
		createGrade: async (_, args: CreateGradeArgs): Promise<GradePayload> => {
			try{
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: user.userId})
				if (userDB.role !== "Teacher") {
					throw new Error('Unauthorize Operation')
				}
				const Grade = _GradeRepository.create(args.grade);
				await Grade.save();
				return {
					success: true,
					data: Grade
				}
			} catch (error) {
				logger.error(`[GradeResolver](createGrade) : ${error.message}`)
				return {
					success: false,
					error: error.message
				}
			}

		},
		updateGrade: async (_, args: UpdateGradeArgs): Promise<GradePayload> => {
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
					await _GradeRepository.update(args.gradeId, { ...args.grade})).affected;

				if (nbAffect !== 0){
					return {
						success: true,
					}
				}
				throw new Error('data wasn\'t stored in database');
			} catch (error) {
				logger.error(`[GradeResolver](updateGrade) : ${error.message}`);
				return {
					success: false,
					error: error.message
				}
			}
		},
		deleteGrade: async (_, args: DeleteGradeArgs): Promise<GradePayload> => {
			try {
				if (!args.token) {
					throw new Error('User not Autheticate')
				}
				const user = jwt.decode(args.token, {json: true});
				const userDB = await UserRepository.findOneBy({user_id: user.userId})
				if (userDB.role !== "Teacher") {
					throw new Error('Unauthorize Operation')
				}
				if (!args.token) {
					throw new Error('Grade not Autheticate')
				}
				const Grade = jwt.decode(args.token, {json: true});
				const GradeDB = await _GradeRepository.findOneBy({grade_id: args.gradeId})
				if (Grade.GradeId !== GradeDB.grade_id) {
					throw new Error('Unauthorize Operation')
				}
				const nbAffect = (await _GradeRepository.delete(args.gradeId)).affected;
				if (nbAffect !== 0) {
					return {
						success: true
					};
				}
				throw new Error('data wasn\'t stored in database');
			}catch (error) {
				logger.error(`[GradeResolver](deleteGrade) : ${error.message}`);
				return {
					success: false,
					error: error.message
				}
			}
		}
	}
}