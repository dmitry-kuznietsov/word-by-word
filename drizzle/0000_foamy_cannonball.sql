CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`object_key` text NOT NULL,
	`size` integer NOT NULL,
	`format` text NOT NULL,
	`content_type` text NOT NULL,
	`status` text DEFAULT 'ready' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `books_object_key_unique` ON `books` (`object_key`);--> statement-breakpoint
CREATE INDEX `idx_books_created_at` ON `books` (`created_at`);