
Hooks.on('ready', () => {

  game.settings.register('calendar-weather', 'noticeVersion', {
    name: 'Notice Version',
    config: false,
    scope: 'world',
    type: String,
    default: ''
  });

  /* Notification dialog logic */
  let noticeThisVersion = true; //Set to true if this version of Calendar-Weather has a notice to display
  let noticeCheck = game.settings.get("calendar-weather", "noticeVersion"); //Get the last version that the user acknowledged
  let currentVersion = game.modules.get("calendar-weather").data.version; //Quick way to just grab the version of the module registered with Foundry

  if (noticeThisVersion && (!noticeCheck || noticeCheck !== currentVersion)) {
    renderTemplate("modules/calendar-weather/templates/notice-template.html").then(html => {
      new Dialog({
        title: game.i18n.localize("cw.notice.ThankYou"),
        content: html,
        buttons: {
          yes: {
            icon: "<i class='fas fa-check'></i>",
            label: game.i18n.localize("cw.notice.Acknowledge"),
            callback: (html) => {
              game.settings.set("calendar-weather", "noticeVersion", currentVersion);
            }
          }
        }
      }).render(true);
    });
  }
});
