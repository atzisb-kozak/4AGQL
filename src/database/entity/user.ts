import { 
	BaseEntity, 
	BeforeInsert, 
	Column, 
	CreateDateColumn, 
	Entity, 
	ManyToMany, 
	ManyToOne, 
	OneToMany, 
	PrimaryGeneratedColumn, 
	UpdateDateColumn
} from "typeorm";
import { hash } from 'bcrypt';
import { Grade } from "./grade";
import { Class } from "./class";

@Entity()
export class User extends BaseEntity {

	@PrimaryGeneratedColumn()
	user_id: number;

	@Column()
	username: string;

	@Column()
	password: string;

	@Column()
	email: string;

	@Column()
	role: string;

	@OneToMany(() => Grade, (grade) => grade.user)
	grades: Grade[]

	@ManyToOne(() => Class, (classe) => classe.users)
	classe: Class

	@CreateDateColumn({type: 'timestamptz'})
	created_at: Date;

	@UpdateDateColumn({type: 'timestamptz'})
	updated_at: Date;

	@BeforeInsert()
	async hashPassword() {
		this.password = await hash(this.password, 10); 
	}
}
