ALTER TABLE `consultation_requests` ADD `preferred_time` text;--> statement-breakpoint
ALTER TABLE `consultation_requests` ADD `preferred_advisor` text DEFAULT '' NOT NULL;