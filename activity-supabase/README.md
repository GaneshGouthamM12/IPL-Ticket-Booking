# IPL booking with React and Supabase

## 1. Create the database
Sign in to your Supabase account. Use a new project or an empty class project. If you already wrote SQL and created tables named matches or bookings with different columns, use a separate project for this script. Keep the database password private.

Open SQL Editor, create a new query, paste all of database/setup.sql and click Run. In Table Editor open matches: RCB vs CSK starts with 50 available seats. The bookings table begins empty. Running this script again on this same schema preserves existing seat counts and bookings.

## 2. Connect the app
Copy the Project URL and Publishable key from the project's Connect dialog or project settings. Create .env.local alongside package.json using .env.example as the template. Paste only the public project URL and publishable key. Restart Vite after editing the file.

## 3. Start the app
Use Node 22.12 or later. Right-click the activity-supabase folder in VS Code and open its integrated terminal. Run npm install, then npm run dev. Open the Local URL it prints.

## 4. Verify a real booking
Open the same app URL in two tabs and wait for “Live seat updates connected” in both. Record the starting seat count. Click Book 1 ticket once in the first tab. Both tabs should now show one fewer seat, without a manual refresh. Copy the booking ID from the confirmation. In Supabase Table Editor refresh bookings and find that same ID with status confirmed. Refresh matches and compare available_seats for its match_id. If starting from the seed data, the first RCB vs CSK ticket takes the count from 50 to 49.

## Code to explain
- src/supabase.js creates the client using your two Vite environment variables.
- src/App.jsx loads the schedule with select('*') in useEffect and subscribes to changes on matches. The subscription is removed when the component unmounts.
- book() inserts a pending booking and uses update().eq() on that match to submit its booking ID. The database trigger confirms the request and subtracts one seat together. The browser never chooses the remaining seat count. If interrupted, Retry booking in the same tab reuses the request ID. Pending requests represent unconfirmed tickets.
- database/setup.sql defines the two tables, permissions, trigger and Realtime publication.
- src/components/MatchCard.jsx shows available seats, the price and the booking button.

## Evidence and GitHub
Capture the booking confirmation, the matching confirmed bookings row, and the updated matches seat count. For Realtime evidence, show two windows side by side. Keep keys and passwords out of screenshots.

From the parent IPL repository on main, run git add activity-supabase/, git commit -m "Connect IPL booking to Supabase", then git push origin main. From inside activity-supabase use git add . instead. The project's .gitignore excludes .env.local, node_modules and dist.
