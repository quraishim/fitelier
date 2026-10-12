import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const consultationRequests = sqliteTable('consultation_requests', {
  id: text('id').primaryKey(),
  payloadHash: text('payload_hash').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  preferredDate: text('preferred_date'),
  timePreference: text('time_preference').notNull(),
  timezone: text('timezone').notNull(),
  preferredTime: text('preferred_time'),
  preferredAdvisor: text('preferred_advisor').notNull().default(''),
  message: text('message').notNull(),
  garment: text('garment').notNull().default('Suit'),
  fabricIds: text('fabric_ids').notNull(),
  design: text('design'),
});
