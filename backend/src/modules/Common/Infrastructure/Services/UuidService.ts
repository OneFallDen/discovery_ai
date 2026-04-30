import { IUuidService } from "../../Domain/Services/Contracts/IUuidService";
import { uuidv7 } from "uuidv7";

export class UuidService implements IUuidService {
    generate(): string {
        return uuidv7();
    }
}
