Hooks.on("init", () => {
    let ct_config = new CombatTrackerConfig();
    let attr_choices = ct_config.getAttributeChoices();
    let arr = [];

    Object.keys(attr_choices).forEach(function(item, index) {
        arr = arr.concat(attr_choices[item]);
    });

    let option_choices = {};

    arr.forEach(function(item, index) {
        option_choices[item] = item;
    });

    game.settings.register("combat-effects-tracker", "trackedResource", {
        name: "Tracked resource",
        hint: "Specify which resource you track in your combat trackers.",
        scope: "world",
        config: true,
        default: 1,
    type: String,
    choices: option_choices
    });  

});