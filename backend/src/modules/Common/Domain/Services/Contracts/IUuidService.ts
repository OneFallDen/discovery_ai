export interface IUuidService {
    generate(): string;
}

export const UUID_SERVICE = Symbol("IUuidService");