import { Grade } from "database/entity/grade";

/**
 * Payload contains operation success and data or error
 *
 * @export
 * @interface UserPayload
 */
export interface GradePayload {
	success: boolean;
	data?: Grade;
	token?: string;
	error?: string;
}