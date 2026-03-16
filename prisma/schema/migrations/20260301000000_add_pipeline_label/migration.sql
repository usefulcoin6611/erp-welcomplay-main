-- CreateTable
CREATE TABLE "pipeline_label" (
    "id" TEXT NOT NULL,
    "pipelineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_label_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_label_pipelineId_name_key" ON "pipeline_label"("pipelineId", "name");

-- CreateIndex
CREATE INDEX "pipeline_label_pipelineId_idx" ON "pipeline_label"("pipelineId");

-- AddForeignKey
ALTER TABLE "pipeline_label" ADD CONSTRAINT "pipeline_label_pipelineId_fkey" FOREIGN KEY ("pipelineId") REFERENCES "pipeline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
