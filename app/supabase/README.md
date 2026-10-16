# Hazard warning database

Apply `migrations/202610160001_hazard_warnings.sql` to the Supabase project before using the DMC warning workflow. Run it from the Supabase SQL Editor or with the Supabase CLI (`supabase db push`) after linking this project.

The migration creates `hazards` and `hazard_warnings`, enables row level security, and inserts three repeatable sample hazard records for Colombo, Kandy, and Matara. Active hazard records are readable publicly; issued warnings are readable publicly; creating warnings requires an authenticated user. The app saves drafts and issued warning records, but does not send them to push, SMS, or siren gateways.
