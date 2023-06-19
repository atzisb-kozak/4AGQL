import { User } from "database/entity/user";

/**
 * Payload contains operation success and data or error
 *
 * @export
 * @interface UserPayload
 */
export interface UserPayload {
	success: boolean;
	data?: User;
	token?: string;
	error?: string;
}