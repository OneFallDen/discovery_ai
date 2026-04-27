import { Injectable } from "@nestjs/common";
import { GetLastGenerationJobQuery as Query } from "../Input/Queries/GetLastGenerationJobQuery";

@Injectable()
export class GetLastGenerationJobMapper {
    public map(): Query {
        return new Query();
    }
}
