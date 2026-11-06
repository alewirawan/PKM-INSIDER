import { ConflictError, NotFoundError } from "../../shared/errors/app-error.js";
import type { Post } from "../../db/schema/posts.js";
import type { PostRepository } from "./post.repository.js";
import { parseInput } from "../../shared/http/parse-input.js";
import { postInput } from "./post.schema.js";
import type { PostInput } from "./post.schema.js";
export type { PostInput } from "./post.schema.js";

function toRecord(input: PostInput) {
  input = parseInput(postInput, input);
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    category: input.category.trim(),
    image: input.image.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.map((item) => item.trim()),
    author: input.author.trim(),
    status: input.status,
    publishedAt: new Date(input.publishedAt),
  };
}

function isUniqueViolation(error: unknown) {
  const value = error as { code?: string; cause?: { code?: string } };
  return value?.code === "23505" || value?.cause?.code === "23505";
}

function presentPost(post: Post) {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    category: post.category,
    image: post.image,
    excerpt: post.excerpt,
    content: post.content,
    author: post.author,
    status: post.status,
    publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function createPostService(repository: PostRepository) {
  return {
    async listPublished() {
      return (await repository.listPublished()).map(presentPost);
    },
    async listAdmin() {
      return (await repository.listAdmin()).map(presentPost);
    },
    async getPublishedBySlug(slug: string) {
      const post = await repository.findPublishedBySlug(slug);
      if (!post) throw new NotFoundError("Artikel tidak ditemukan.");
      return presentPost(post);
    },
    async create(input: PostInput) {
      try {
        return presentPost(await repository.create(toRecord(input)));
      } catch (error) {
        if (isUniqueViolation(error)) throw new ConflictError("Slug artikel sudah digunakan.");
        throw error;
      }
    },
    async update(id: string, input: PostInput) {
      if (!(await repository.findById(id))) throw new NotFoundError("Artikel tidak ditemukan.");
      try {
        const post = await repository.update(id, toRecord(input));
        if (!post) throw new NotFoundError("Artikel tidak ditemukan.");
        return presentPost(post);
      } catch (error) {
        if (isUniqueViolation(error)) throw new ConflictError("Slug artikel sudah digunakan.");
        throw error;
      }
    },
    async delete(id: string) {
      if (!(await repository.findById(id))) throw new NotFoundError("Artikel tidak ditemukan.");
      await repository.delete(id);
    },
  };
}
