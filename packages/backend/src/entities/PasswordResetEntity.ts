import { Entity, EntityRepositoryType, OneToOne, Property } from "@mikro-orm/core";
import { PasswordResetRepository } from "../repositories/PasswordResetRepository";
import { AbstractEntity } from "./AbstractEntity";
import { User } from "./UserEntity";

@Entity({ customRepository: () => PasswordResetRepository })
export class PasswordReset extends AbstractEntity<PasswordReset> {
    @OneToOne(() => User)
    user: User;

    @Property({ type: "uuid" })
    resetToken: string;

    [EntityRepositoryType]?: PasswordResetRepository;

    constructor(user: User) {
        super();
        this.user = user;
    }
}
