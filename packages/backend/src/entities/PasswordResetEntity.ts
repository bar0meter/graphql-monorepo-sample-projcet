import { Entity, EntityRepositoryType, OneToOne, Property } from "@mikro-orm/core";
import { PasswordResetRepository } from "../repositories/PasswordResetRepository";
import { AbstractEntity } from "./AbstractEntity";
import { User } from "./UserEntity";

@Entity({ customRepository: () => PasswordResetRepository })
export class PasswordReset extends AbstractEntity<PasswordReset> {
    @OneToOne(
        () => User,
        user => user.passwordReset,
        { owner: true, orphanRemoval: false },
    )
    user: User;

    @Property({ type: "uuid" })
    resetToken: string;

    [EntityRepositoryType]?: PasswordResetRepository;
}
