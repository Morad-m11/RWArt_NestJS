-- CreateTable
CREATE TABLE "FeaturedPost" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "featuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeaturedPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FeaturedPost_featuredAt_idx" ON "FeaturedPost"("featuredAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeaturedPost_postId_featuredAt_key" ON "FeaturedPost"("postId", "featuredAt");

-- AddForeignKey
ALTER TABLE "FeaturedPost" ADD CONSTRAINT "FeaturedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
