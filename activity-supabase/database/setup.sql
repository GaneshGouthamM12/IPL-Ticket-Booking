-- Run in the SQL Editor of a new Supabase project.
begin;

create table if not exists public.matches (
    id integer primary key,
    teams text not null,
    city text not null,
    date text not null,
    time text not null,
    price integer not null check (price >= 0),
    available_seats integer not null check (available_seats >= 0),
    booking_request uuid
);

create table if not exists public.bookings (
    id uuid primary key,
    match_id integer not null references public.matches(id),
    status text not null default 'pending' check (status in ('pending', 'confirmed')),
    created_at timestamptz not null default now()
);

insert into public.matches (id, teams, city, date, time, price, available_seats) values
    (1, 'RCB vs CSK', 'Bengaluru', '01 April', '7:30 PM', 800, 50),
    (2, 'MI vs KKR', 'Mumbai', '02 April', '7:30 PM', 1000, 40),
    (3, 'SRH vs RR', 'Hyderabad', '03 April', '7:30 PM', 700, 30)
on conflict (id) do nothing;

-- The client sends a booking UUID. PostgreSQL updates the locked match row
-- and confirms the matching request in the same transaction.
create or replace function public.confirm_ticket()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
    booking_status text;
begin
    select status into strict booking_status from public.bookings
        where id = new.booking_request and match_id = old.id for update;

    if booking_status = 'pending' then
        if old.available_seats = 0 then
            raise exception 'This match is sold out.';
        end if;
        new.available_seats := old.available_seats - 1;
        update public.bookings set status = 'confirmed' where id = new.booking_request;
    end if;

    new.booking_request := null;
    return new;
end;
$$;

revoke all on function public.confirm_ticket() from public, anon, authenticated;
drop trigger if exists confirm_ticket_request on public.matches;
create trigger confirm_ticket_request before update of booking_request on public.matches
    for each row execute function public.confirm_ticket();

alter table public.matches enable row level security;
alter table public.bookings enable row level security;
revoke all on public.matches, public.bookings from public, anon, authenticated;
grant select, update (booking_request) on public.matches to anon, authenticated;
grant insert (id, match_id) on public.bookings to anon, authenticated;

drop policy if exists read_matches on public.matches;
create policy read_matches on public.matches for select to anon, authenticated using (true);
drop policy if exists submit_ticket on public.matches;
create policy submit_ticket on public.matches for update to anon, authenticated
    using (true) with check (true);
drop policy if exists request_ticket on public.bookings;
create policy request_ticket on public.bookings for insert to anon, authenticated
    with check (status = 'pending');

do $$
begin
    if not exists (select 1 from pg_publication_tables
                   where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches') then
        alter publication supabase_realtime add table public.matches;
    end if;
end;
$$;
commit;
