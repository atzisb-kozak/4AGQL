import { 
	BaseEntity, 
	Column, 
	CreateDateColumn, 
	Entity, 
	ManyToOne, 
	PrimaryGeneratedColumn, 
	UpdateDateColumn
} from "typeorm";
import { User } from "./user";

@Entity()
export class Grade extends BaseEntity {

	@PrimaryGeneratedColumn()
	grade_id: number;

	@Column()
	name: string;

	@Column()
	grade: number;

	@ManyToOne(() => User, (user) => user.grades)
	user: User

	@CreateDateColumn({type: 'timestamptz'})
	created_at: Date;

	@UpdateDateColumn({type: 'timestamptz'})
	updated_at: Date;
}