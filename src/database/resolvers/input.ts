import { User } from "database/entity/user";

export interface CreateUserInput {
	username: string;
	password: string;
	email: string;
	role: string;
	token?: string;
}

export interface LoginInput {
	username: string;
	password: string;
	token?: string;
}

export interface UpdateUserInput {
	username?: string;
	password?: string;
	email?: string;
	role?: string;
	token?: string;
}

export interface CreateClassInput {
	name: string;
	token?: string;
}

export interface UpdateClassInput {
	name: string;
	token?: string;
}

export interface CreateGradeInput {
	name: string;
	grade: number;
	user: User,
	token?: string;
}

export interface UpdateGradeInput {
	name?: string;
	grade?: number;
	user?: User,
	token?: string;
}