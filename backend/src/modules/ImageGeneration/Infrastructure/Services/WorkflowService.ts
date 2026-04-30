import { Injectable } from "@nestjs/common";
import { IWorkflowService } from "../../Domain/Services/Contracts/IWorkflowService";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

@Injectable()
export class WorkflowService implements IWorkflowService {
    private readonly WORKFLOWS_DIR = join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "..",
        "workflows",
    );

    public get(workflow: string): string {
        const filePath = `${this.WORKFLOWS_DIR}/base_workflow.json`;

        if (!existsSync(filePath)) {
            throw new Error(`Файл не найден: ${filePath}`);
        }

        return readFileSync(filePath, "utf-8");
    }
}
