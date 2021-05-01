Hooks.on("getSceneControlButtons", (controls) => {
    if (!canvas) {
        Hooks.once("canvasReady", () => {
            addControls(controls);
        })
    } else {
        addControls(controls);
    }
});

// fix for 07x by @ardittristan
function addControls(controls) {
    console.log('Parallaxia | Setting up Parallaxia controls here!');
    if (game.user.isGM) {
        let tb = controls.find(c => c.name === "tiles");
        tb.tools.push({
            name: "Parallaxia",
            title: "Irreversibly de-parallaxilize all Parallaxia tiles in the scene",
            icon: "fab fa-centos",
            onClick: canvas.parallaxiaManager.clearAllTiles,
            button: true
        });
    }
}
