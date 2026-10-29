# Tools

A [site](https://ecologibel.github.io/tools/) hosting a collection of lightweight browser-based tools that maintain content between sessions via localStorage, with optional sync across devices via [Google Drive](https://drive.google.com/).

1. [**R-codepad**](https://ecologibel.github.io/tools/r-codepad/): syntax-highlighted scratchpad for R code.
2. [**To dos**](https://ecologibel.github.io/tools/to-dos/): to do lists in several styles (simple, toggle, weekly, monthly, and yearly).

## Sync

  - Signing in with Google (button at bottom right) copies each tool's content to a hidden app folder in your own Google Drive.
  - The site can only see its own files there, not the rest of your Drive.
  - The newest edit wins; the overwritten copy is kept in localStorage as `sync-backup-<tool>.json`.
  - Theme, view, and size settings stay on each device.
  - Alt-click the button to sign out.
  - Sync runs on the hosted site only, not from `file://`.

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
  - Leave out `/tools` and any trailing slash.
  - Leave **Authorised redirect URIs** empty.
  - Click **Create** and copy the **Client ID** (ends in `.apps.googleusercontent.com`).
  - The client secret isn't needed; keep it out of the code.

### 8. Add the client ID to the site

- In `sync.js`, replace the placeholder value of `CLIENT_ID` with your client ID.
- Commit and push.

### 9. Sign in

  - Open the [to dos](https://ecologibel.github.io/tools/to-dos/) page on the device whose data you want to keep.
  - Click **Sign in to sync** and choose your Google account.
  - At "Google hasn't verified this app", click **Continue**, then allow access.
  - The button changes to **Synced**.
  - New origins can take from 5 minutes to a few hours to start working.

## Test locally

  - From the repo root, run `python -m http.server 8000`.
  - Open [http://localhost:8000](http://localhost:8000).

## Licence

[MIT](LICENSE)