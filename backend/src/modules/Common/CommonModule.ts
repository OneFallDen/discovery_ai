import { Module } from "@nestjs/common";
import { UUID_SERVICE } from "./Domain/Services/Contracts/IUuidService";
import { UuidService } from "./Infrastructure/Services/UuidService";
import { QueryBus } from "./Infrastructure/Bus/QueryBus";
import { CommandBus } from "./Infrastructure/Bus/CommandBus";

@Module({
    providers: [
        {
            provide: UUID_SERVICE,
            useClass: UuidService,
        },
        CommandBus,
        QueryBus,
    ],
    exports: [UUID_SERVICE, CommandBus, QueryBus],
})
export class CommonModule {}
