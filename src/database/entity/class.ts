import { 
	BaseEntity, 
	Column, 
	CreateDateColumn, 
	Entity, 
	OneToMany, 
	PrimaryGeneratedColumn, 
	UpdateDateColumn
} from "typeorm";
import { User } from "./user";

@Entity()
export class Class extends BaseEntity {

	@PrimaryGeneratedColumn()
	class_id: number;

	@Column()
	name: string;

	@OneToMany(() => User, (user) => user.classe)
	users: User[]

	@CreateDateColumn({type: 'timestamptz'})
	created_at: Date;

	@UpdateDateColumn({type: 'timestamptz'})
	updated_at: Date;
}