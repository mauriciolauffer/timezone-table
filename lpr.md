# User Stories - Time Zone Converter

## 1. Add Time Zone

**As a** user who works with global teams
**I want to** add multiple time zones to my dashboard
**So that** I can easily see the current time in different locations.

### Acceptance Criteria:

- User can search for a time zone by city or region name.
- Adding a time zone displays it in a list/table.
- The list shows the location name, current time, and offset from UTC.
- Duplicate time zones should be handled gracefully (e.g., prevented or warned).

## 2. Remove Time Zone

**As a** user with changing project locations
**I want to** remove time zones from my list
**So that** I can keep my dashboard relevant and uncluttered.

### Acceptance Criteria:

- Each time zone entry has a clear "Remove" or "Delete" action.
- Removing a time zone immediately updates the UI without requiring a page reload.

## 3. Convert Time

**As a** user scheduling a meeting
**I want to** adjust the time in one time zone and see the corresponding time in all other added zones
**So that** I can find a suitable time for all participants.

### Acceptance Criteria:

- User can change the time (hours/minutes) for any time zone in the list.
- Changing the time in one zone updates the times in all other zones proportionally based on their offsets.
- A date picker or "today/tomorrow" indicator is present if the conversion crosses a day boundary.

## 4. Persist Configuration

**As a** frequent user
**I want to** have my selected time zones saved between sessions
**So that** I don't have to re-add them every time I open the application.

### Acceptance Criteria:

- Selected time zones are saved in the browser's local storage.
- On page reload, the application restores the list of previously selected time zones.

## 5. Responsive Design

**As a** mobile user
**I want to** use the time zone converter on my phone
**So that** I can check times while on the go.

### Acceptance Criteria:

- The UI adapts to different screen sizes (mobile, tablet, desktop).
- Tables or lists remain readable and functional on small screens.
