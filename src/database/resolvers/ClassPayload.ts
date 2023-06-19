import { Class } from "database/entity/class";

/**
 * Payload contains operation success and data or error
 *
 * @export
 * @interface ClassPayload
 */
export interface ClassPayload {
	success: boolean;
	data?: Class;
	token?: string;
	error?: string;
}