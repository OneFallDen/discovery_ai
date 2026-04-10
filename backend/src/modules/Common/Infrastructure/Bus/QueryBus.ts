import { Injectable } from "@nestjs/common";
import { Query } from "../../Application/UseCases/Query";
import { QueryHandler } from "../../Application/Handlers/QueryHandler";

@Injectable()
export class QueryBus {
    private handlers = new Map();

    register(query: new (...args: any[]) => Query, handler: QueryHandler) {
        this.handlers.set(query.name, handler);
    }

    async handle(query: Query): Promise<any> {
        const handler = this.handlers.get(query.constructor.name);
        if (!handler) throw new Error("Handler not found");
        return await handler.handle(query);
    }
}
