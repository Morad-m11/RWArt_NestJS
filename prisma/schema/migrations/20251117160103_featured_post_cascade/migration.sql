-- DropForeignKey
ALTER TABLE "FeaturedPost" DROP CONSTRAINT "FeaturedPost_postId_fkey";

-- CreateIndex
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt");

-- AddForeignKey
ALTER TABLE "FeaturedPost" ADD CONSTRAINT "FeaturedPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
