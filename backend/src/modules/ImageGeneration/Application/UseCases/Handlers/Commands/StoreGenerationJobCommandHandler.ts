import { CommandHandler } from "../../../../../Common/Application/Handlers/CommandHandler";
import { Inject, Injectable } from "@nestjs/common";
import { StoreGenerationJobCommand as Command } from "../../../Input/Commands/StoreGenerationJobCommand";
import { GenerationJob as Aggregate } from "../../../../Domain/Model/Aggregates/GenerationJob";
import {
    type IUuidService,
    UUID_SERVICE,
} from "../../../../../Common/Domain/Services/Contracts/IUuidService";
import { JobId } from "../../../../Domain/Model/ValueObjects/JobId";
import { GenerationParameters } from "../../../../Domain/Model/ValueObjects/GenerationParameters";
import { Workflow } from "../../../../Domain/Model/ValueObjects/Workflow";
import {
    type IWorkflowService,
    WORKFLOW_SERVICE,
} from "../../../../Domain/Services/Contracts/IWorkflowService";
import { ConfigService } from "@nestjs/config";
import { StoreGenerationJobDTO } from "../../../DTO/StoreGenerationJobDTO";
import {
    GENERATION_JOB_REPOSITORY,
    type IGenerationJobRepository,
} from "../../../../Domain/Factories/Contracts/IGenerationJobRepository";
import { Job, Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bull";
import { QueueGenerationJobDTO as JobDTO } from "../../../DTO/QueueGenerationJobDTO";

@Injectable()
export class StoreGenerationJobCommandHandler extends CommandHandler {
    constructor(
        @Inject(UUID_SERVICE)
        private readonly uuidService: IUuidService,
        @Inject(WORKFLOW_SERVICE)
        private readonly workflowService: IWorkflowService,
        private readonly config: ConfigService,
        @Inject(GENERATION_JOB_REPOSITORY)
        private readonly repository: IGenerationJobRepository,
        @InjectQueue("image_queue") private queue: Queue,
    ) {
        super();
    }

    public async execute(command: Command): Promise<void> {
        const workflow = this.workflowService.get(
            this.config.get<string>("DEFAULT_GENERATION_WORKFLOW") ||
                "base.json",
        );

        const aggregate = Aggregate.create(
            new JobId(this.uuidService.generate()),
            new GenerationParameters(
                command.dto.positivePrompt,
                command.dto.negativePrompt,
                command.dto.seed,
                command.dto.width,
                command.dto.height,
                command.dto.steps,
                command.dto.cfg,
                command.dto.nsfwEnabled,
                command.dto.model,
                command.dto.sampler,
                command.dto.scheduler,
            ),
            new Workflow(this.replaceParamsInWorkflow(workflow, command.dto)),
        );

        await this.repository.store(aggregate);

        const dto: JobDTO = new JobDTO(aggregate.getId().value());

        await this.queue.add("queue_image", dto, {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
        });
    }

    private replaceParamsInWorkflow(
        rawWorkflow: string,
        params: StoreGenerationJobDTO,
    ): string {
        const wf = JSON.parse(rawWorkflow);

        /* --------------------------------------------------------------------
         * 3 – KSampler (seed/steps/cfg/sampler_name/scheduler)
         * 4 – CheckpointLoaderSimple (ckpt_name – имя модели)
         * 5 – EmptyLatentImage (width/height/batch_size)
         * 6 – CLIPTextEncode (positive prompt)
         * 7 – CLIPTextEncode (negative prompt)
         * -------------------------------------------------------------------- */

        if (wf["3"]?.inputs) {
            wf["3"].inputs.seed = params.seed;
            wf["3"].inputs.steps = params.steps;
            wf["3"].inputs.cfg = params.cfg;
            wf["3"].inputs.sampler_name = params.sampler;
            wf["3"].inputs.scheduler = params.scheduler;
        }

        if (wf["4"]?.inputs) {
            const modelName = params.model ?? "";
            wf["4"].inputs.ckpt_name = modelName.endsWith(".safetensors")
                ? modelName
                : `${modelName}.safetensors`;
        }

        if (wf["5"]?.inputs) {
            wf["5"].inputs.width = params.width;
            wf["5"].inputs.height = params.height;
            wf["5"].inputs.batch_size = 1;
        }

        if (wf["6"]?.inputs) {
            wf["6"].inputs.text = params.positivePrompt;
        }

        if (wf["7"]?.inputs) {
            wf["7"].inputs.text = params.negativePrompt;
        }

        return JSON.stringify(wf);
    }
}
