# Calendar/Weather

[![Supported Foundry Versions](https://img.shields.io/endpoint?url=https://foundryshields.com/version?url=https://gitlab.com/jstebenne/foundryvtt-weather-control/-/raw/v3.1.8/module.json)](https://gitlab.com/jstebenne/foundryvtt-calendar-weather)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Fcalendar-weather&colorB=4aa94a)](https://forge-vtt.com/bazaar#package=calendar-weather)
[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fcalendar-weather%2Fshield%2Fendorsements)](https://www.foundryvtt-hub.com/package/calendar-weather/)
[![Forge Installs](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Fcalendar-weather%2Fshield%2Fcomments)](https://www.foundryvtt-hub.com/package/calendar-weather/)

A customizable module that accurately tracks and displays dates and time.

## Links:

* Manifest: https://gitlab.com/jstebenne/foundryvtt-calendar-weather/-/raw/master/module.json
* Releases: https://gitlab.com/jstebenne/foundryvtt-calendar-weather/-/releaseszip

This module **REQUIRES** [about-time](https://foundryvtt.com/packages/about-time) v1.0.2 or greater AND [Simple Calendar](https://foundryvtt.com/packages/foundryvtt-simple-calendar) installed and loaded to function correctly.
If you want to have weather effects, you must have [FXMaster](https://gitlab.com/mesfoliesludiques/foundryvtt-fxmaster) by U~Man installed and loaded.

## Features:

* Customizable and draggable calendar that handles arbitrarily long weeks, months, and years.
* Intercalary day handling.
* Moon Phase tracking for an arbitrary amount of moons. Moons can also have eclipses which have fun effects tied to them via FXMaster.
* Real time time tracking at customizable speeds through about-time.
* Event tracking: Calendar/Weather can handle reoccuring yearly events, like holidays as well as one time events that occur once before being deleted. One time events can also be triggered at a specific time, rather than the event triggering at midnight. You can drag and drop journal entries into the text field for events. Furthermore, events can fire macros when they're triggered. The @@JournalEntry[] syntax will send the contents of the journal entry to chat, rather than just the link.
* Weather System: Clicking the sun/cloud icon will pull up a small widget that allows you to change between Farenheit/Celcius, regenerate the days weather, and set the climate your party is currently in. Weather is generated every day at midnight. Each time weather is generated, a message will be displayed to chat, you can turn this off in the settings.
* Day/Night Cycle: If the 'Calendar/Weather - Night Cycle and Weather Effects' setting is enabled, it will begin to grow dark at the specified dusk time for the season, and grow bright at the season's dawn time.
* FXMaster Weather Integration: If you have U~man's FXmaster module installed, each time weather is generated, a corresponding effect will be applied to the current scene. This is enabled on a scene by scene basis by the 'Calendar/Weather - Night Cycle and Weather Effects' setting located in the scene config form.

### Demo:

[![Demo Video](https://img.youtube.com/vi/EZDmYGKMkFI/0.jpg)](https://youtu.be/EZDmYGKMkFI)

### Controls:

![control menu](https://i.imgur.com/1aCVPXG.png)
![weather menu](https://i.imgur.com/ZSRuAub.png)

### Credits:

Calendar/Weather is the result of the effort of many people. Please refer to [CREDITS.md](https://gitlab.com/jstebenne/foundryvtt-calendar-weather/-/blob/master/CREDITS.md) for the full list.
