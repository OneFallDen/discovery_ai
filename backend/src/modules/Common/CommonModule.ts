import { Module } from "@nestjs/common";
import { UUID_SERVICE } from "./Domain/Services/Contracts/IUuidService";
import { UuidService } from "./Infrastructure/Services/UuidService";

@Module({
    providers: [
        {
            provide: UUID_SERVICE,
            useClass: UuidService,
        },
    ],
    exports: [UUID_SERVICE],
})
export class CommonModule {}
