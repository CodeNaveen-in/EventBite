# 🎊 EventBite: Global Celebration & Gift Helper

**Eventbite** is a lightweight, client-side web application designed to help users navigate over 30 global festivals. It provides a one-stop shop for **gift ideas**, **party planning checklists**, and **activity suggestions** tailored to specific cultural, religious, and secular events.

## 🚀 Features

* **Global Festival Explorer:** Browse a database of 30+ international festivals with details on their significance and timing.
* **Smart Gift Filter:** Get gift suggestions based on festival type (Religious, Cultural, Secular), age group, and budget.
* **Interactive Party Checklist:** A dynamic task manager to help you plan your event from concept to cleanup.
* **Activity Suggestions:** Universal and festival-specific ideas to make your celebration memorable.
* **Portable Planning:** Generate and download your custom party checklist as a `.txt` or `.json` file for offline use.
* **Zero Backend:** Runs entirely in the browser using Vanilla JavaScript and local JSON data.

## 📂 Project Structure

The project is organized to be simple and easy to deploy:

```text
/Eventbite
│
├── index.html          # Main application structure
├── style.css           # Custom styling and layout
├── script.js           # Core logic (Filtering, Fetching, UI)
│
└── /data               # JSON Data Store
    ├── festivals.json  # List of 30+ worldwide festivals
    ├── gifts.json      # Gift filtering logic & categories
    ├── checklist.json  # Default party planning templates
    └── activities.json # Universal and specific activity ideas

```

## 🛠️ How it Works

1. **Data Fetching:** The app uses the JavaScript `fetch()` API to load data from the `/data` folder asynchronously when the page loads.
2. **Dynamic UI:** Based on the festival selected from the `festivals.json`, the app updates the **Activity** and **Gift** modules to show relevant content.
3. **Checklist Management:** Users can toggle tasks. The "Download" feature uses a `Blob` object in JS to allow the user to save their current progress to their device.

## 📥 Installation & Usage

Since this project uses pure HTML/CSS/JS, no complex installation is required:

1. Clone the repository or download the files.
2. Ensure your folder structure matches the tree above.
3. **Note:** Because the app uses `fetch()` to load local JSON files, it must be run via a local server (like **Live Server** in VS Code) to avoid CORS policy restrictions.
4. Open `index.html` in your browser.

## 📝 Data Example

The app relies on structured JSON like this to generate gift ideas:

```json
{
  "type": "Religious",
  "suggested_gift_themes": ["Devotional items", "Traditional sweets"],
  "festivals_included": ["Diwali", "Eid al-Fitr"]
}

```