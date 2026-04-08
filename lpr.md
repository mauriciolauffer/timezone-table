# User Stories

👤 1. View Multiple Time Zones
User Story
As a user, I want to view multiple time zones side-by-side so that I can quickly understand time differences.

Acceptance Criteria

- User can add multiple cities/time zones via search
- System displays all selected time zones in a single grid view
- Each column/row shows current local time for each location
- Time updates in real-time
- System auto-detects user’s current time zone by default

🔍 2. Search and Add Locations
User Story
As a user, I want to search for cities or locations so that I can add relevant time zones.

Acceptance Criteria

- User can type city or country names into a search bar
- Autocomplete suggestions are shown
- Selecting a result adds it to the comparison view
- System supports a large set of global locations (cities-based, not just offsets)

🎚️ 3. Interactive Time Slider (Core UX Feature)
User Story
As a user, I want to drag a time slider to see how time changes across zones so that I can find suitable meeting times.

Acceptance Criteria

- A horizontal timeline (“hour ruler”) is displayed
- User can drag/scroll to change the selected time
- All time zones update simultaneously based on selected time
- Current time is visually highlighted

🌗 4. Visual Day/Night & Working Hours
User Story
As a user, I want visual cues for working hours so that I can easily identify suitable meeting times.

Acceptance Criteria

- Time blocks are color-coded (e.g., night, work hours, evening)
- Visual distinction between day and night is clear
- Optional highlighting of weekends or non-working hours

📅 5. Select Time Ranges / Schedule Events
User Story
As a user, I want to select a specific time range so that I can plan meetings or events.

Acceptance Criteria

- User can select a single hour or a time range
- Selected range is visually highlighted
- User can navigate to a dedicated “event view”
- Event view shows selected time across all zones

🔗 6. Shareable Meeting Links
User Story
As a user, I want to share a link with selected times so that others can see the same schedule.

Acceptance Criteria

- System generates a unique URL for selected time + zones
- Opening the link reproduces the same view
- No login required to access shared link

📆 7. Calendar Integration
User Story
As a user, I want to integrate with my calendar so that I can schedule events directly.

Acceptance Criteria

- User can export or sync selected time to calendar tools (e.g., Google Calendar)
- Event includes correct time zone conversions
- Event metadata (time, zones) is preserved

⚙️ 8. Customize Settings
User Story
As a user, I want to customize display preferences so that the tool fits my needs.

Acceptance Criteria

- User can change date/time format (12h/24h)
- User can change default time zone
- User can reorder time zones (e.g., drag-and-drop)
- Preferences persist during session

🔄 9. Reorder & Prioritize Time Zones
User Story
As a user, I want to reorder time zones so that I can prioritize relevant locations.

Acceptance Criteria

- User can drag and drop time zones to reorder
- First/top time zone is treated as the “base” time zone
- All calculations align relative to the base zone

🌐 10. No-Login, Instant Use
User Story
As a user, I want to use the tool without signing up so that I can quickly check times.

Acceptance Criteria

- User can access core features without authentication
- No mandatory onboarding or account creation
- Full functionality available immediately

🧩 11. Cross-Platform Access
User Story
As a user, I want to access the tool across devices so that I can use it anywhere.

Acceptance Criteria

- Tool works in web browsers
- Mobile apps or responsive UI available
- State can be shared via links across devices

🎯 12. Compare Up to Multiple Time Zones
User Story
As a user, I want to compare several time zones at once so that I can coordinate globally.

Acceptance Criteria

- User can add multiple time zones (e.g., up to ~10)
- UI remains readable and usable with multiple zones
- All zones update synchronously
