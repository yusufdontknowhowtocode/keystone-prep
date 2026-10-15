-- When we last reached out to each lead (set by the "Contacted today" button in Admin > Pipeline).
alter table leads add column if not exists last_contact date;
