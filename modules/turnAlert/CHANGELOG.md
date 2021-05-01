# CHANGELOG

## [1.5.1] 2020-10-06

### FIXED

- Fix an issue where an alert that triggered at the top of the round would not properly execute a script macro because the top of the round does not correspond with a specific combatant.

## [1.5.0] 2020-09-30

Ensure compatibility with core version 0.7.3.

### FIXED

- Ensure that module.json correctly adds Korean as an available language (thank you KLO/drdwing).
- Fixed an issue where repeating alerts without a turnId defined would not trigger.

## [1.4.0] 2020-08-05

### ADDED

- Add "Label" field for alerts. This is the label that will be shown in the Combat Alerts window for this alert. Now you can easily identify alerts in the Combat Alerts window, even if they don't specify a chat message.
- Add "Chat Message" and "Whisper To" indicators for alerts in the Combat Alerts window. These indicators designate that the alert has a chat message or whisper recipients defined, and you can hover over them for more information.
- Add "info" links to the Turn Alert Configuration and Combat Alerts window headers that link to the Turn Alert wiki for more information.

For more information on these features, please visit the [User Guide](https://github.com/schultzcole/FVTT-Turn-Alert/wiki/User-Guide).

### API

- Add `name` property on alert data. This property can be used as an identifier for easily finding an alert that pertains to a particular effect.
- Add `TurnAlert#getAlertByName` to easily get the first alert that has a given name on the given combat.

For more information about these API additions, please visit the [Turn Alert API page](https://github.com/schultzcole/FVTT-Turn-Alert/wiki/Turn-Alert-API).

## [1.3.0] 2020-08-01

### ADDED

- Added Korean Language translation. Many thanks to KLO for the translations.
- Players can now view the Combat Alerts window. In this window, players will only be able to see combatants that they own, and will only be able to see alerts that they created.

### API

- Added some convenience methods to make it easier to get alert data for existing alerts. `getAlertById`, `getAlerts`, and `find`.
- Explicitly add the `args` property to alert data.

For more information on these API changes, see <https://github.com/schultzcole/FVTT-Turn-Alert/wiki/Turn-Alert-API>, which has been updated for 1.3.0.

## [1.2.0] 2020-07-29

### ADDED

- Add two macro compendia: One for example alert creation macros, and one for a debug macro that will display all active alerts.

### FIXED

- Fixed an issue that would cause an error when an alert with a message triggered when recipientIds was not set.

### CHANGED

- Change some default turn alert property values, including `combatId`, `createdRound`, `message`, `userId`, `recipientIds`.
  This should not be a breaking change, but it will make it simpler to create new alerts via macro.
- Allow for players to delete alerts even when they do not have permission to update the containing combat.
  There is no UI for this yet, but players should now be able to execute macros that delete turn alerts.

## [1.1.1] 2020-07-27

### ADDED

- Added a slightly more informative error message when an error is thrown while executing a macro triggered from an alert.

### FIXED

- Fixed an issue that prevented alerts created by players from triggering if another player or the GM changed the combat turn.

## [1.1.0] 2020-07-26

### CHANGED

- Make `TurnAlert` and `TurnAlertConfig` globally available for use in macros, etc.
- Move the socket logic allowing for creating new TurnAlerts into the TurnAlert CRUD methods rather than TurnAlertConfig, so that players can create TurnAlerts via macro.

### REMOVED

- Removed `game.TurnAlertManager` as it was outdated and is now eclipsed by `TurnAlert` and `TurnAlertConfig` being global.

## [1.0.1] 2020-07-26

### FIXED

- Fix an issue where players could not create new alerts. (Thanks CRASH1115 for the report!)

## [1.0.0] 2020-07-26

The initial release of Turn Alert!
