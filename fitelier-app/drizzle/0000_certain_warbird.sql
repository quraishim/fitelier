CREATE TABLE `consultation_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`payload_hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`preferred_date` text,
	`time_preference` text NOT NULL,
	`timezone` text NOT NULL,
	`message` text NOT NULL,
	`fabric_ids` text NOT NULL,
	`design` text
);
