CREATE TABLE `learners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`display_name` text DEFAULT '' NOT NULL,
	`full_name` text,
	`locale` text DEFAULT 'en' NOT NULL,
	`education_level` text,
	`prior_knowledge` text,
	`study_goal` text,
	`focus_systems` text DEFAULT '[]' NOT NULL,
	`onboarded_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `learners_email_unique` ON `learners` (`email`);--> statement-breakpoint
CREATE TABLE `lesson_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`learner_id` integer NOT NULL,
	`lesson_id` text NOT NULL,
	`organ_id` text NOT NULL,
	`steps_completed` integer DEFAULT 0 NOT NULL,
	`total_steps` integer DEFAULT 0 NOT NULL,
	`questions_correct` integer DEFAULT 0 NOT NULL,
	`questions_answered` integer DEFAULT 0 NOT NULL,
	`total_questions` integer DEFAULT 0 NOT NULL,
	`completed_at` text,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lesson_progress_learner_lesson_unique` ON `lesson_progress` (`learner_id`,`lesson_id`);--> statement-breakpoint
CREATE TABLE `organ_mastery` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`learner_id` integer NOT NULL,
	`organ_id` text NOT NULL,
	`views` integer DEFAULT 0 NOT NULL,
	`lesson_completed` integer DEFAULT 0 NOT NULL,
	`lesson_score` integer DEFAULT 0 NOT NULL,
	`lesson_total` integer DEFAULT 0 NOT NULL,
	`quiz_best` integer DEFAULT 0 NOT NULL,
	`quiz_total` integer DEFAULT 0 NOT NULL,
	`mastery` integer DEFAULT 0 NOT NULL,
	`first_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`last_seen_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organ_mastery_learner_organ_unique` ON `organ_mastery` (`learner_id`,`organ_id`);--> statement-breakpoint
CREATE TABLE `progress_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`learner_id` integer NOT NULL,
	`kind` text NOT NULL,
	`organ_id` text,
	`ref_id` text,
	`correct` integer,
	`value` integer,
	`total` integer,
	`meta` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`learner_id`) REFERENCES `learners`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `progress_events_learner_idx` ON `progress_events` (`learner_id`,`created_at`);