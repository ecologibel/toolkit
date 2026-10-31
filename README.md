# Toolkit

A [site](https://ecologibel.github.io/toolkit/) hosting a collection of lightweight browser-based tools that keep their content between sessions via localStorage, with optional sync across devices via [Google Drive](https://drive.google.com/).

  1. [**Dashboard**](https://ecologibel.github.io/toolkit/dashboard/): the toolkit's home page, with today's day and date, buttons for each tool, an *at a glance* list of upcoming to dos, and a quote that changes daily.
  2. [**Notes**](https://ecologibel.github.io/toolkit/notes/): block-based notes, similar to Notion, with folders, tags, tables, R code blocks and dated to dos.
  3. [**To dos**](https://ecologibel.github.io/toolkit/to-dos/): to do lists in six views (simple, dates, week, month, year and done).
  4. [**Codepad**](https://ecologibel.github.io/toolkit/codepad/): a syntax-highlighted scratchpad for R code.
  5. [**Focus**](https://ecologibel.github.io/toolkit/focus/): one to do at a time, with a countdown timer and subtasks, based on [Sunsama's focus mode](https://help.sunsama.com/docs/usage-guides/focus-mode/).
  6. *Coming soon*: Google Calendar hours keeper with hours per calendar and simple visualisations.

## Using the toolkit

### Sidebar

  - The sidebar on the left of every page links to each tool; click **to dos** to show its six views. Choosing one folds the list away.
  - The layers icon at the top returns to the dashboard.
  - The controls at the bottom switch between dark and light mode, change the text size and page width (shared by every page; normal is 672px of content, wide is halfway to full), and show sync status.
  - Toggles and expanding menus start closed, and close again when you leave them.
  - Press `Ctrl+K` on any page to jump to a note, folder, to dos view, codepad or focus.

### Dashboard

  - Opens whenever you visit the toolkit's address.
  - **notes** shows all notes, your four most recently edited notes (title and date) and a new note; **to dos** shows its six views. Only one opens at a time, and clicking elsewhere closes it.
  - The *at a glance* sidebar groups dated to dos (including to dos in notes) under today, tomorrow, rest of this week and next week; tick them off there or add a to do for today.
  - Drag the sidebar's dividing line to resize it, or click **>** to fold it away (and **<** to bring it back).

### Notes

  - **Gallery:** search notes, pin notes to the top, colour their cards, sort by last edited, date or title, turn previews on or off (off shows just each note's title, date and tags), and filter by tag.
  - **Folders:** click a folder to show its notes (folders start closed on each visit); drag notes or folders onto a folder to move them; use a folder's **⋯** menu to rename it, add a subfolder, choose an icon or delete it.
  - **Bin:** drag notes onto the bin button at the bottom right, or use a note's **⋯** menu. Click the bin button to list binned notes down the right edge. Notes in the bin are deleted after 30 days.
  - **Note menu:** the **⋯** on each card, and at the top right of an open note: pin, duplicate, copy as md, download as md, move to bin, and colour.
  - **In a note:**
    - Each note has a date (click to change it), tags and a pin toggle, with its last edited time at the bottom left and a word count at the bottom right.
    - Type `/` for a menu of block types, or use markdown shortcuts: `#`, `##` and `###` for headings; `-`, `*` or `+` for bullets; `1.` for numbered lists; `[]` or `/to` for to dos; `>` or `/tog` for toggles; `"` for quotes; ` ``` ` for R code; `---` for a line; `/tab` for a table.
    - Format text with `Ctrl+B`, `Ctrl+I`, `Ctrl+E` (code), `Ctrl+Shift+S` (strikethrough), `Ctrl+Shift+H` (highlight, in teal) and `Ctrl+K` (link), or select text for the floating menu, where **▾** gives a highlight another colour.
    - Click a block's handle for its menu: duplicate, copy as markdown, move to another note, delete, turn into another type, or colour. Arrow keys and `Enter` work in the menu.
    - Drag blocks by their handle, or drop them onto a toggle to put them inside it; press `Tab` and `Shift+Tab` to indent, and `Ctrl+Z` and `Ctrl+Y` to undo and redo.
    - Select several blocks with `Shift`+click, `Ctrl`+click or by dragging down the page, then drag, copy or delete them together; `Ctrl+A` selects a block's text, and again for every block.
    - Toggles start closed each time you open a note; an empty toggle's arrow is dimmed, and opening it gives you a line to type in.
    - Click beside the note to go back to the notes.
    - `@dates` and `#tags` are coloured as in the to dos; dated to dos also appear in the to dos dates view and on the dashboard.

### To dos

  - Add `@dates` (e.g. `@today`, `@friday`, `@2/11`, `@next week`) and `#tags` to any to do.
  - **simple:** one list; **dates:** grouped by when they're due, with your own dates and ranges (toggles start closed on each visit); **week:** two rows (monday to thursday, then friday to sunday and to schedule), each day headed like "mon 26"; **month** and **year:** calendars; **done:** ticked to dos by day.
  - `@today` keeps the date it was typed; once that date passes, the date turns grey-teal to show the to do is overdue.
  - The month view opens with last week at the top.
  - Deleting a to do or date shows an **undo** button for a few seconds.
  - Click the space below a list (or a dates section) to add a to do; there's no standing blank row.
  - Press `Enter` to start a new to do directly beneath; in the middle of a to do, `Enter` splits it in two.
  - Drag a to do by its handle; drag left or right as you go to change how far it's indented.
  - Select several to dos with `Ctrl`+click or `Shift`+click, or `Ctrl+A` twice for the whole view, then drag, copy (`Ctrl+C`) or delete them together.

### Focus

  - Open focus mode from the sidebar or dashboard, then pick one of today's or overdue to dos (each has the focus symbol beside it), search for another, or type a new one (it joins the simple list for `@today`).
  - Or hover over any to do (in the to dos, a note or the dashboard's *at a glance*) and click its timer icon.
  - A teal ring at the top shows the time left and drains as it counts down, breathing gently while it runs; it starts at 10 minutes, or choose 5 to 60 below it.
  - **start**, **pause** and **reset** sit inside the ring, beneath the time; reset returns the countdown to the chosen time.
  - Once started, the minute buttons become **+5** to **+60**, adding time on the fly.
  - The timer keeps running on other pages and after you close the toolkit; a chip at the bottom left shows the time left.
  - At 0, a banner slides down on whichever page is open and a chime plays; add more time with **+5** to **+60**.
  - **choose another task** at the top right goes back to the picker when the timer isn't running.
  - Click the task to edit it; the change shows everywhere. A note's to do keeps its formatting and the notes' shortcuts.
  - Break the task down beside the teal **+** beneath it; press `Enter` to add a step and open a new **+** below. Click a step's **+** to tick it off (it becomes a ✓).
  - Steps stay in focus mode, kept with their task on this device; they don't appear in the to dos or notes.
  - Tick the task and the ring fills in from the top, following the timer's moving edge, then glows with a cheer (they take turns, so none repeats until all have shown); **back to timer** returns to the countdown, with the task still ticked.
  - Click **leave focus** or press `Esc` to leave at any time.

### Codepad

  - R syntax highlighting with rainbow brackets, in [Ubuntu Mono](https://fonts.google.com/specimen/Ubuntu+Mono); notes' R code blocks use the same colours.
  - Content is kept between sessions and synced if you sign in.

## Sync

  - Signing in with Google copies each tool's content to a hidden app folder in your own Google Drive.
  - Sign in with the sync icon at the bottom of the sidebar.
  - The site can only see its own files there, not the rest of your Drive.
  - Each tool syncs its own file: `notes.json`, `to-dos.json` (also synced from the dashboard and focus mode) and `r-codepad.json`.
  - The focus timer stays on each device.
  - Sync compares last-change times. A local copy replaced by a newer Drive copy is kept as `sync-backup-<file>`; a Drive copy replaced by local data is kept as `sync-backup-<file>-remote`.
  - If two different copies have the same change time, the current device's copy is kept and the Drive copy is backed up locally.
  - Mode, size, width and similar settings stay on each device.
  - Alt-click the sync icon to sign out.
  - Sync runs on the hosted site only, not from `file://`.
  - Ticking a note's to do from the to dos or dashboard reaches Drive the next time you open notes.

## Setup

### 1. Check your Google account

  - Open [Google Cloud Console](https://console.cloud.google.com/) and click the avatar at the top right.
  - Confirm you're signed in to the Google account you'll use to sync.
  - If not, click **Switch account** or **Add account** before going further. Projects belong to the account that creates them.

### 2. Create a project

  - Go to [Create a project](https://console.cloud.google.com/projectcreate).
  - **Project name:** `tools`
  - **Location:** No organisation
  - Click **Create**, then select the project in the picker at the top.

### 3. Enable the Drive API

  - Go to the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com) page.
  - Click **Enable**.

### 4. Set up Google Auth Platform

  - Go to [Google Auth Platform](https://console.cloud.google.com/auth/overview) and click **Get started**.
  - **App information**
    - **App name:** `Tools`
    - **User support email:** your Google account
    - Click **Next**.
  - **Audience**
    - Choose **External**.
    - Click **Next**.
  - **Contact information**
    - **Email addresses:** your Google account
    - Click **Next**.
  - **Finish**
    - Tick the box agreeing to the Google API Services User Data Policy.
    - Click **Continue**, then **Create**.
  - Skip the optional **Branding** fields; adding a logo triggers Google verification.

### 5. Add yourself as a test user

  - In the left sidebar, click **Audience**.
  - Leave **Publishing status** on **Testing**, so only listed test users can sign in.
  - Under **Test users**, click **+ Add users**, enter your Google account, and click **Save**.

### 6. Add the Drive scope

  - In the left sidebar, click **Data access**, then **Add or remove scopes**.
  - Under **Manually add scopes**, paste `https://www.googleapis.com/auth/drive.appdata`.
  - Click **Add to table**, then **Update**, then **Save**.

### 7. Create the client ID

  - In the left sidebar, click **Clients**, then **+ Create client**.
  - **Application type:** Web application
  - **Name:** `Tools site`
  - **Authorised JavaScript origins:** click **+ Add URI** twice and enter:
    - `https://ecologibel.github.io`
    - `http://localhost:8000`
  - Leave out `/toolkit` and any trailing slash.
  - Leave **Authorised redirect URIs** empty.
  - Click **Create** and copy the **Client ID** (ends in `.apps.googleusercontent.com`).
  - The client secret isn't needed; keep it out of the code.

### 8. Add the client ID to the site

  - In `sync.js`, replace the placeholder value of `CLIENT_ID` with your client ID.
  - Commit and push.

### 9. Sign in

  - Open each tool on the device whose data you want to keep.
  - Click the sync icon at the bottom of the sidebar and choose your Google account.
  - At "Google hasn't verified this app", click **Continue**, then allow access.
  - The sync icon turns teal.
  - New origins can take from 5 minutes to a few hours to start working.

## Files

  - `index.html`: opens the dashboard.
  - `dashboard/`, `notes/`, `to-dos/`, `codepad/`, `focus/`: one folder per tool.
  - `r-codepad/`: forwards the old codepad address to `codepad/`.
  - `sidebar.js`: the sidebar, quick switcher, tab icon, undo messages and focus timer shared by every page.
  - `sync.js`: Google Drive sync.
  - `dates.js`: reads `@dates` for the dashboard and focus mode.
  - CodeMirror (codepad) loads from [cdnjs](https://cdnjs.com/libraries/codemirror) and Ubuntu Mono from Google Fonts, so these need an internet connection; offline, code falls back to Consolas.

## Test locally

  - From the repo root, run `python -m http.server 8000`.
  - Open [http://localhost:8000](http://localhost:8000).

## Licence

[MIT](LICENSE)
