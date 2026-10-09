create table brands(id serial primary key, name text not null);
create table accounts(id serial primary key, brand_id int references brands on delete cascade, platform text, handle text, external_id text, refresh_token text, status text default 'Connected', unique(brand_id,platform,external_id));
create table posts(id serial primary key, account_id int references accounts on delete cascade, external_id text, title text, kind text, format text, published_at timestamptz, impressions int default 0, engagements int default 0, unique(account_id,external_id));
create table snapshots(post_id int references posts on delete cascade, day date, impressions int, engagements int, primary key(post_id,day));
