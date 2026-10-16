# Hazard warning database

Apply the migrations in order before using the DMC warning workflow. Run them from the Supabase SQL Editor or with the Supabase CLI (`supabase db push`) after linking this project. The second migration removes the latitude and longitude columns from databases that already applied the initial schema.

The initial migration creates `hazards` and `hazard_warnings`, enables row level security, and inserts three repeatable sample hazard records for Colombo, Kandy, and Matara. Active hazard records are readable publicly; issued warnings are readable publicly; creating warnings requires an authenticated user. Coverage selection uses active hazard rows, and chosen distribution channels are stored in each warning's `channels` array. The app saves drafts and issued warning records, but does not send them to push, SMS, or siren gateways.
