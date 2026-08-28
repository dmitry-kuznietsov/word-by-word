import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  objectKey: text("object_key").notNull().unique(),
  size: integer("size").notNull(),
  format: text("format").notNull(),
  contentType: text("content_type").notNull(),
  status: text("status").notNull().default("ready"),
  createdAt: integer("created_at").notNull(),
}, (table) => [index("idx_books_created_at").on(table.createdAt)]);
