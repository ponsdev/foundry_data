'use strict';

class MinimalUICamera {
    static initSettings() {
        game.settings.register("minimal-ui", "hidePlayerCameras", {
            name: game.i18n.localize("MinimalUI.HidePlayerCameraName"),
            hint: game.i18n.localize("MinimalUI.HidePlayerCameraHint"),
            scope: "world",
            config: true,
            default: "default",
            type: String,
            choices: {
                "default": game.i18n.localize("MinimalUI.SettingsDefault"),
                "hidden": game.i18n.localize("MinimalUI.HidePlayerCameraSetting")
            },
            onChange: _ => {
                window.location.reload();
            }
        });
    }

    static initHooks() {
        Hooks.on('renderCameraViews', async function() {
            switch(game.settings.get('minimal-ui', 'hidePlayerCameras')) {
                case 'hidden': {
                    $("#camera-views > div").each(function(i, box) {
                        if (!game.users.get($(box).attr("data-user")).isGM) {
                            $(box).remove();
                        }
                    });
                }
            }
        });
    }
}

const rootStyle = document.querySelector(':root').style;

class MinimalUIControls {

    static controlsLocked = false;
    static fakeDisabled = false;
    static cssControlsLastPos = '0px';

    static controlToolsHoverTransition;

    static cssControlsStartVisible = '0px';
    static cssControlsHiddenPositionSmall = '-62px';
    static cssControlsHiddenPositionStandard = '-72px';

    static cssControlsSubMenuSmall = '55px';
    static cssControlsSubMenuStandard = '65px';
    static cssControlsSubMenuDndUi = '65px';

    static cssControlsPaddingDefault = '7px';
    static cssControlsPaddingHidden = '26px';

    static cssControlsSmallWidth = '25px';
    static cssControlsSmallHeight = '28px';
    static cssControlsSmallLineHeight = '30px';
    static cssControlsSmallFontSize = '15px';

    static revealControls() {
        rootStyle.setProperty('--controlspad', MinimalUIControls.cssControlsPaddingDefault);
        rootStyle.setProperty('--controlsxpos', MinimalUIControls.cssControlsStartVisible);
    }

    static revealControlTools() {
        if (game.settings.get('minimal-ui', 'controlsSize') === 'small') {
            rootStyle.setProperty('--controlssubleft', MinimalUIControls.cssControlsSubMenuSmall);
        } else {
            rootStyle.setProperty('--controlssubleft', MinimalUIControls.cssControlsSubMenuStandard);
        }
        // Special compatibility DnD-UI
        if (game.modules.get('dnd-ui') && game.modules.get('dnd-ui').active) {
            rootStyle.setProperty('--controlssubleft', MinimalUIControls.cssControlsSubMenuDndUi);
        }
        // ---
    }

    static hideControls() {
        rootStyle.setProperty('--controlspad', MinimalUIControls.cssControlsPaddingHidden);
        if (game.settings.get('minimal-ui', 'controlsSize') === 'small') {
            rootStyle.setProperty('--controlsxpos', MinimalUIControls.cssControlsHiddenPositionSmall);
        } else {
            rootStyle.setProperty('--controlsxpos', MinimalUIControls.cssControlsHiddenPositionStandard);
        }
    }

    static hideControlTools() {
        if (game.settings.get('minimal-ui', 'controlsSize') === 'small') {
            rootStyle.setProperty('--controlssubleft', MinimalUIControls.cssControlsHiddenPositionSmall);
        } else {
            rootStyle.setProperty('--controlssubleft', MinimalUIControls.cssControlsHiddenPositionStandard);
        }
    }

    static lockControls(unlock) {
        const sidebarLock = $("#sidebar-lock > i");
        if (!MinimalUIControls.controlsLocked) {
            MinimalUIControls.controlsLocked = true;
            MinimalUIControls.cssControlsLastPos = rootStyle.getPropertyValue('--controlsxpos');
            MinimalUIControls.revealControls();
            MinimalUIControls.revealControlTools();
            sidebarLock.removeClass("fa-lock-open");
            sidebarLock.addClass("fa-lock");
        } else if (unlock) {
            MinimalUIControls.controlsLocked = false;
            sidebarLock.removeClass("fa-lock");
            sidebarLock.addClass("fa-lock-open");
            MinimalUIControls.hideControls();
            MinimalUIControls.hideControlTools();
        }
    }

    static positionSidebar() {
        let availableHeight = parseInt($("#board").css('height'));
        switch(true) {
            case (game.settings.get('minimal-ui', 'controlsPosition') === 'top' || game.settings.get('minimal-ui', 'controlsStyle') === 'column'): {
                rootStyle.setProperty('--controlsypos', ((availableHeight/3)-(availableHeight/9)-(availableHeight/9))+'px');
                break;
            }
            case (game.settings.get('minimal-ui', 'controlsPosition') === 'center'): {
                rootStyle.setProperty('--controlsypos', ((availableHeight/3)-(availableHeight/9))+'px');
                break;
            }
            case (game.settings.get('minimal-ui', 'controlsPosition') ===  'lower'): {
                rootStyle.setProperty('--controlsypos', ((availableHeight/3))+'px');
                break;
            }
            case (game.settings.get('minimal-ui', 'controlsPosition') ===  'bottom'): {
                rootStyle.setProperty('--controlsypos', ((availableHeight/3)+(availableHeight/9))+'px');
                break;
            }
        }
    }

    static addLockButton() {
        const locked = MinimalUIControls.controlsLocked ? 'fa-lock' : 'fa-lock-open';
        const SidebarLockButton =
            $(`
            <li id="sidebar-lock" class="scene-control"
            title="${game.i18n.localize("MinimalUI.PinSidebar")}">
            <i class="fas ${locked}" style="color: red"></i>
            </li>
            `);
        if (game.settings.get('minimal-ui', 'controlsBehaviour') === 'autohide') {
            SidebarLockButton
                .click(() => MinimalUIControls.lockControls(true))
                .appendTo("#controls");
        }
    }

    static initSettings() {

        game.settings.register('minimal-ui', 'controlsBehaviour', {
            name: game.i18n.localize("MinimalUI.ControlsBehaviourName"),
            hint: game.i18n.localize("MinimalUI.ControlsBehaviourHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "always": game.i18n.localize("MinimalUI.SettingsAlwaysVisible"),
                "autohide": game.i18n.localize("MinimalUI.SettingsAutoHide")
            },
            default: "autohide",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'controlsSize', {
            name: game.i18n.localize("MinimalUI.ControlsSizeName"),
            hint: game.i18n.localize("MinimalUI.ControlsSizeHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "small": game.i18n.localize("MinimalUI.SettingsSmall"),
                "standard": game.i18n.localize("MinimalUI.SettingsStandard")
            },
            default: "small",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'controlsStyle', {
            name: game.i18n.localize("MinimalUI.ControlsStyleName"),
            hint: game.i18n.localize("MinimalUI.ControlsStyleHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "default": game.i18n.localize("MinimalUI.ControlsStyleExpandRight"),
                "column": game.i18n.localize("MinimalUI.ControlsStyleSingleColumn")
            },
            default: "default",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'controlsPosition', {
            name: game.i18n.localize("MinimalUI.ControlsPositionName"),
            hint: game.i18n.localize("MinimalUI.ControlsPositionHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "top": game.i18n.localize("MinimalUI.ControlsPositionTopLeft"),
                "center": game.i18n.localize("MinimalUI.ControlsPositionUpperLeft"),
                "lower": game.i18n.localize("MinimalUI.ControlsPositionLowerLeft"),
                "bottom": game.i18n.localize("MinimalUI.ControlsPositionBottomLeft")
            },
            default: "center",
            onChange: _ => {
                window.location.reload();
            }
        });

    }

    static initHooks() {
        Hooks.once('renderSceneControls', async function() {
            if (game.settings.get('minimal-ui', 'controlsSize') === 'small') {
                rootStyle.setProperty('--controlsw', MinimalUIControls.cssControlsSmallWidth);
                rootStyle.setProperty('--controlsh', MinimalUIControls.cssControlsSmallHeight);
                rootStyle.setProperty('--controlslh', MinimalUIControls.cssControlsSmallLineHeight);
                rootStyle.setProperty('--controlsfs', MinimalUIControls.cssControlsSmallFontSize);
            }
            MinimalUIControls.positionSidebar();
        });

        Hooks.on('canvasPan', function() {
            MinimalUIControls.positionSidebar();
        });

        Hooks.once('renderSceneControls', async function() {

            switch(game.settings.get('minimal-ui', 'controlsStyle')) {
                case 'default': {
                    rootStyle.setProperty('--controlssubstyle', 'block');
                    break;
                }
                case 'column': {
                    rootStyle.setProperty('--controlssubstyle', 'contents');
                    break;
                }
            }

        });

        Hooks.on('renderSceneControls', async function() {

            const controls = $("#controls");
            const controlSettings = game.settings.get('minimal-ui', 'controlsBehaviour');

            // Hide controls altogether when they're disabled
            if (!MinimalUIControls.fakeDisabled && controls.hasClass('disabled')) {
                controls.hide();
            } else {
                controls.show();
            }

            if (controlSettings === 'autohide') {
                controls.hover(
                    function () {
                        if (!MinimalUIControls.controlsLocked) {
                            MinimalUIControls.revealControls();
                            MinimalUIControls.revealControlTools();
                            clearTimeout(MinimalUIControls.controlToolsHoverTransition);
                        }
                    },
                    function () {
                        if (!MinimalUIControls.controlsLocked) {
                            MinimalUIControls.controlToolsHoverTransition = setTimeout(function () {
                                MinimalUIControls.hideControls();
                                MinimalUIControls.hideControlTools();
                            }, 500);
                        }
                    }
                );
            }

            if (controlSettings === 'autohide' && !MinimalUIControls.controlsLocked) {
                MinimalUIControls.hideControls();
                MinimalUIControls.hideControlTools();
            } else {
                MinimalUIControls.revealControls();
                MinimalUIControls.revealControlTools();
            }

            MinimalUIControls.addLockButton();

            // --------------- COMPATIBILITY SECTION ------------------
            // Here we add workarounds for minimal UI to work well with modules that affect UI components

            // Give a little time for other modules to add their controls first, and reapply changes
            await new Promise(waitABit => setTimeout(waitABit, 1));

            $("#controls > li.scene-control").on('click', function() {
                MinimalUIControls.lockControls(false);
                $("#controls > li.scene-control.active > ol > li").on('click', function() {
                    MinimalUIControls.lockControls(false);
                });
            });
            $("#controls > li.scene-control.active > ol > li").on('click', function() {
                MinimalUIControls.lockControls(false);
            });

            // Delete and add lock button if needed, so the lock is always at the bottom
            const controlsList = $("#controls > li");
            const sidebarLock = $("#sidebar-lock");
            if (controlsList.index(sidebarLock) !== controlsList.length) {
                sidebarLock.remove();
                MinimalUIControls.addLockButton();
            }

            // Support for Simple Dice Roller
            if (game.modules.has('simple-dice-roller') && game.modules.get('simple-dice-roller').active) {
                $("#controls > li.scene-control.sdr-scene-control").click(function() {
                    let olControl = $("#controls > li.scene-control.sdr-scene-control.active > ol")[0];
                    if (olControl) {
                        olControl.style.setProperty('display', 'inherit');
                    }
                });
            }

            // ----------------------------------------------------------------------

        });
    }

}

class MinimalUIHotbar {

    static hotbarLocked = false;

    static cssHotbarHidden = '-48px';
    static cssHotbarReveal = '1px';
    static cssHotbarShown = '10px';

    static cssHotbarLeftControlsLineHeight = '24px';
    static cssHotbarRightControlsLineHeight = '12px';
    static cssHotbarRightControlsLineHeightDnDUi = '10px';
    static cssHotbarControlsAutoHideHeight = '100%';
    static cssHotbarAutoHideHeight = '1px';
    static cssHotbarAutoHideShadow = '-1px';
    static cssHotbarControlsMargin = '0px';

    static htmlHotbarLockButton =
        `
        <a id="bar-lock">
          <i class="fas fa-lock-open"></i>
        </a>
        `

    static collapseHotbar(toggleId) {
        let target = document.getElementById(toggleId);
        if (target) {
            target.click();
        }
    }

    static lockHotbar(unlock) {
        const barLock = $("#bar-lock > i");
        if (MinimalUIHotbar.hotbarLocked && unlock) {
            rootStyle.setProperty('--hotbarypos', MinimalUIHotbar.cssHotbarHidden);
            barLock.removeClass("fa-lock");
            barLock.addClass("fa-lock-open");
            MinimalUIHotbar.hotbarLocked = false;
        } else {
            rootStyle.setProperty('--hotbarypos', MinimalUIHotbar.cssHotbarReveal);
            barLock.removeClass("fa-lock-open");
            barLock.addClass("fa-lock");
            MinimalUIHotbar.hotbarLocked = true;
        }
    }

    static positionHotbar() {
        let availableWidth = parseInt($("#board").css('width'));
        switch(game.settings.get('minimal-ui', 'hotbarPosition')) {
            case 'default': {
                rootStyle.setProperty('--hotbarxpos', '220px');
                break;
            }
            case 'left': {
                rootStyle.setProperty('--hotbarxpos', ((availableWidth/2.5)-(availableWidth/9)-(availableWidth/9))+'px');
                break;
            }
            case 'center': {
                rootStyle.setProperty('--hotbarxpos', ((availableWidth/2.5)-(availableWidth/9))+'px');
                break;
            }
            case 'right': {
                rootStyle.setProperty('--hotbarxpos', ((availableWidth/2.5))+'px');
                break;
            }
            case 'manual': {
                rootStyle.setProperty('--hotbarxpos', game.settings.get('minimal-ui', 'hotbarPixelPosition')+'px');
                break;
            }
        }
    }

    static configureHotbar() {
        switch(game.settings.get('minimal-ui', 'hotbar')) {
            case 'collapsed': {
                MinimalUIHotbar.collapseHotbar("bar-toggle");
                if (game.modules.has("custom-hotbar") && game.modules.get('custom-hotbar').active) {
                    MinimalUIHotbar.collapseHotbar("custom-bar-toggle");
                }
                break;
            }
            case 'autohide': {
                if (!(game.modules.has("custom-hotbar") && game.modules.get('custom-hotbar').active)) {
                    rootStyle.setProperty('--hotbarypos', MinimalUIHotbar.cssHotbarHidden);
                    rootStyle.setProperty('--hotbarlh1', MinimalUIHotbar.cssHotbarLeftControlsLineHeight);
                    rootStyle.setProperty('--hotbarlh2', MinimalUIHotbar.cssHotbarRightControlsLineHeight);
                    if (game.modules.get('dnd-ui') && game.modules.get('dnd-ui').active) {
                        rootStyle.setProperty('--hotbarlh2', MinimalUIHotbar.cssHotbarRightControlsLineHeightDnDUi);
                    }
                    rootStyle.setProperty('--hotbarmg', MinimalUIHotbar.cssHotbarControlsMargin);
                    rootStyle.setProperty('--hotbarhh', MinimalUIHotbar.cssHotbarControlsAutoHideHeight);
                    rootStyle.setProperty('--hotbarhv', MinimalUIHotbar.cssHotbarAutoHideHeight);
                    rootStyle.setProperty('--hotbarshp', MinimalUIHotbar.cssHotbarAutoHideShadow);
                    $("#hotbar-directory-controls").append(MinimalUIHotbar.htmlHotbarLockButton);
                    $("#macro-directory").click(function() {MinimalUIHotbar.lockHotbar(false);});
                    $("#bar-lock").click(function() {MinimalUIHotbar.lockHotbar(true);});
                    if (MinimalUIHotbar.hotbarLocked) {
                        MinimalUIHotbar.lockHotbar(false);
                    }
                }
                $("#bar-toggle").remove();
                break;
            }
        }
    }
    
    static initSettings() {

        game.settings.register('minimal-ui', 'hotbar', {
            name: game.i18n.localize("MinimalUI.HotbarStyleName"),
            hint: game.i18n.localize("MinimalUI.HotbarStyleHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "shown": game.i18n.localize("MinimalUI.SettingsStartVisible"),
                "autohide": game.i18n.localize("MinimalUI.SettingsAutoHide"),
                "collapsed": game.i18n.localize("MinimalUI.SettingsCollapsed"),
                "onlygm": game.i18n.localize("MinimalUI.SettingsOnlyGM"),
                "hidden": game.i18n.localize("MinimalUI.SettingsHide")
            },
            default: "autohide",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'hotbarSize', {
            name: game.i18n.localize("MinimalUI.HotbarSizeName"),
            hint: game.i18n.localize("MinimalUI.HotbarSizeHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "slots_3": game.i18n.localize("MinimalUI.HotbarSlots3"),
                "slots_6": game.i18n.localize("MinimalUI.HotbarSlots6"),
                "slots_10":game.i18n.localize("MinimalUI.HotbarSlots10")
            },
            default: "slots_10",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'hotbarPosition', {
            name: game.i18n.localize("MinimalUI.HotbarPositionName"),
            hint: game.i18n.localize("MinimalUI.HotbarPositionHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "default": game.i18n.localize("MinimalUI.SettingsDefault"),
                "left": game.i18n.localize("MinimalUI.HotbarPositionCenterLeft"),
                "center": game.i18n.localize("MinimalUI.HotbarPositionCenter"),
                "right": game.i18n.localize("MinimalUI.HotbarPositionCenterRight"),
                "manual": game.i18n.localize("MinimalUI.HotbarPositionManual")
            },
            default: "center",
            onChange: _ => {
                MinimalUIHotbar.positionHotbar();
            }
        });

        game.settings.register('minimal-ui', 'hotbarPixelPosition', {
            name: game.i18n.localize("MinimalUI.HotbarPPositionName"),
            hint: game.i18n.localize("MinimalUI.HotbarPPositionHint"),
            scope: 'world',
            config: true,
            type: String,
            default: "400",
            onChange: _ => {
                MinimalUIHotbar.positionHotbar();
            }
        });
    }

    static initHooks() {
        Hooks.on('canvasPan', function() {
            MinimalUIHotbar.positionHotbar();
        });

        Hooks.once('ready', async function() {

            MinimalUIHotbar.positionHotbar();

            if (game.settings.get('minimal-ui', 'hotbar') !== 'hidden') {
                const gmCondition = game.settings.get('minimal-ui', 'hotbar') === 'onlygm';
                if (gmCondition) {
                    if (game.user.isGM)
                        rootStyle.setProperty('--hotbarvis', 'visible');
                } else
                    rootStyle.setProperty('--hotbarvis', 'visible');
            }

        });

        Hooks.on('renderHotbar', async function() {

            MinimalUIHotbar.configureHotbar();

            switch(game.settings.get('minimal-ui', 'hotbarSize')) {
                case "slots_3": {
                    $("#macro-list > li").each(function(i, slot) {
                        if (i > 2) {
                            rootStyle.setProperty('--hotbarwf', '152px');
                            $(slot).remove();
                        }
                    });
                    break;
                }
                case "slots_6": {
                    $("#macro-list > li").each(function(i, slot) {
                        if (i > 5) {
                            rootStyle.setProperty('--hotbarwf', '302px');
                            $(slot).remove();
                        }
                    });
                    break;
                }
            }

        });

    }

}

class MinimalUILogo {

    static hiddenInterface = false;

    static hideAll(alsoChat) {
        $('#logo').click(_ => {
            if (!MinimalUILogo.hiddenInterface) {
                if (alsoChat) {
                    $('#sidebar').hide();
                }
                $('#navigation').hide();
                $('#controls').hide();
                $('#players').hide();
                $('#hotbar').hide();
                MinimalUILogo.hiddenInterface = true;
            } else {
                if (alsoChat) {
                    $('#sidebar').show();
                }
                $('#navigation').show();
                $('#controls').show();
                $('#players').show();
                $('#hotbar').show();
                MinimalUILogo.hiddenInterface = false;
            }
        });
    }

    static updateImageSrc(srcimg) {
        const logoSetting = game.settings.get('minimal-ui', 'foundryLogoSize');
        if (!game.modules.get('mytab')?.active && logoSetting !== 'hidden') {
            $("#logo")
                .attr('src', srcimg)
                .on('error', function () {
                    if (game.user.isGM)
                        ui.notifications.warn(
                            "Minimal UI: Your Logo Image could not be found. Restoring to Default Foundry Logo"
                        );
                    MinimalUILogo.updateImageSrc("icons/fvtt.png");
                });
        }
    }

    static initSettings() {

        game.settings.register('minimal-ui', 'foundryLogoSize', {
            name: game.i18n.localize("MinimalUI.LogoStyleName"),
            hint: game.i18n.localize("MinimalUI.LogoStyleHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "hidden": game.i18n.localize("MinimalUI.SettingsHide"),
                "small": game.i18n.localize("MinimalUI.SettingsSmall"),
                "standard": game.i18n.localize("MinimalUI.SettingsStandard")
            },
            default: "hidden",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'foundryLogoBehaviour', {
            name: game.i18n.localize("MinimalUI.LogoBehaviourName"),
            hint:  game.i18n.localize("MinimalUI.LogoBehaviourHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "toggleAll": game.i18n.localize("MinimalUI.LogoBehaviourToggle"),
                "toggleButChat": game.i18n.localize("MinimalUI.LogoBehaviourToggleNoChat")
            },
            default: "toggleButChat",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'foundryLogoImage', {
            name: game.i18n.localize("MinimalUI.LogoImageName"),
            hint: game.i18n.localize("MinimalUI.LogoImageHint"),
            scope: 'world',
            config: true,
            type: String,
            default: "icons/fvtt.png",
            onChange: _ => {
                MinimalUILogo.updateImageSrc(game.settings.get('minimal-ui', 'foundryLogoImage'));
            }
        });
    }

    static initHooks() {

        Hooks.once('renderSceneNavigation', async function() {
            MinimalUILogo.updateImageSrc(game.settings.get('minimal-ui', 'foundryLogoImage'));
        });

        Hooks.once('ready', async function() {

            if (game.settings.get('minimal-ui', 'foundryLogoSize') !== 'hidden') {
                switch (game.settings.get('minimal-ui', 'foundryLogoBehaviour')) {
                    case 'toggleAll': {
                        MinimalUILogo.hideAll(true);
                        break;
                    }
                    case 'toggleButChat': {
                        MinimalUILogo.hideAll(false);
                        break;
                    }
                }
            }

            switch (game.settings.get('minimal-ui', 'foundryLogoSize')) {
                case 'small': {
                    rootStyle.setProperty('--logovis', 'visible');
                    rootStyle.setProperty('--logoh', '25px');
                    rootStyle.setProperty('--logow', '50px');
                    break;
                }
                case 'standard': {
                    rootStyle.setProperty('--logovis', 'visible');
                    break;
                }
            }

            // Compatibility Workaround for bullseye module
            if (game.modules.has('bullseye') && game.modules.get('bullseye').active) {
                rootStyle.setProperty('--logovis', 'visible');
                rootStyle.setProperty('--logoh', '50px');
                rootStyle.setProperty('--logow', '100px');
            }

        });

    }

}

class MinimalUINavigation {

    static cssSceneNavNoLogoStart = '5px';
    static cssSceneNavSmallLogoStart = '75px';
    static cssSceneNavBullseyeStart = '125px';

    static naviHoverTransition;

    static collapseNavigation(toggleId) {
        let target = document.getElementById(toggleId);
        if (target) {
            target.click();
        }
    }

    static positionPreview() {
        rootStyle.setProperty('--navithumbh', document.querySelector("#navigation").offsetHeight + 'px');
    }

    static prepareScenePreview(i, sceneTab, sceneId) {
        if (sceneId) {
            let sceneThumbUrl = game.scenes.get(sceneId).data.thumb;
            if (sceneThumbUrl) {
                new Image().src = sceneThumbUrl;
                MinimalUINavigation.positionPreview();
                $(sceneTab).append(
                    `
                    <div class="hover_preview_container">
                    <img
                      id="hover_preview_${i}"
                      class="navi-preview"
                      src='${sceneThumbUrl}' alt="Scene Preview">
                    </div>
                    `
                );
                $(sceneTab).hover(
                    function() {
                        if (!$(sceneTab).hasClass('view')) {
                            const minimized = game.settings.get('minimal-ui', 'organizedMinimize');
                            $(`#hover_preview_${i}`).show();
                            clearTimeout(MinimalUINavigation.naviHoverTransition);
                            if (['top', 'topBar'].includes(minimized)) {
                                $("#minimized-bar")?.hide();
                                $(".minimized").hide();
                            }
                        }
                    },
                    function() {
                        if (!$(sceneTab).hasClass('view')) {
                            const minimized = game.settings.get('minimal-ui', 'organizedMinimize');
                            $(`#hover_preview_${i}`).hide();
                            if (['top', 'topBar'].includes(minimized)) {
                                MinimalUINavigation.naviHoverTransition = setTimeout(function() {
                                    const minimizedApps = $(".minimized");
                                    if (minimizedApps.length > 0) {
                                        $("#minimized-bar")?.fadeIn('fast');
                                        minimizedApps.fadeIn('fast');
                                    }
                                }, 500);
                            }
                        }
                    }
                );
            }
        }
    }
    
    static initSettings() {

        game.settings.register('minimal-ui', 'sceneNavigation', {
            name: game.i18n.localize("MinimalUI.NavigationStyleName"),
            hint: game.i18n.localize("MinimalUI.NavigationStyleHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "shown": game.i18n.localize("MinimalUI.SettingsStartVisible"),
                "collapsed": game.i18n.localize("MinimalUI.SettingsCollapsed"),
                "hidden": game.i18n.localize("MinimalUI.SettingsHide")
            },
            default: "shown",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'sceneNavigationSize', {
            name: game.i18n.localize("MinimalUI.NavigationSizeName"),
            hint: game.i18n.localize("MinimalUI.NavigationSizeHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "small": game.i18n.localize("MinimalUI.SettingsSmall"),
                "standard": game.i18n.localize("MinimalUI.SettingsStandard"),
                "big": game.i18n.localize("MinimalUI.SettingsBig")
            },
            default: "small",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'sceneNavigationPreview', {
            name: game.i18n.localize("MinimalUI.NavigationPreviewName"),
            hint:  game.i18n.localize("MinimalUI.NavigationPreviewHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "disabled": game.i18n.localize("MinimalUI.Disabled"),
                "hover": game.i18n.localize("MinimalUI.NavigationPreviewHover")
            },
            default: "hover",
            onChange: _ => {
                window.location.reload();
            }
        });
        
    }
    
    static initHooks() {

        Hooks.once('ready', async function() {
            switch(game.settings.get('minimal-ui', 'foundryLogoSize')) {
                case 'small': {
                    rootStyle.setProperty('--navixpos', MinimalUINavigation.cssSceneNavSmallLogoStart);
                    break;
                }
            }

            switch(game.settings.get('minimal-ui', 'sceneNavigation')) {
                case 'collapsed': {
                    rootStyle.setProperty('--navivis', 'visible');
                    MinimalUINavigation.collapseNavigation("nav-toggle");
                    break;
                }
                case 'shown': {
                    rootStyle.setProperty('--navivis', 'visible');
                    break;
                }
            }

            // Compatibility Workaround for bullseye module
            if (game.modules.has('bullseye') && game.modules.get('bullseye').active) {
                rootStyle.setProperty('--navixpos', MinimalUINavigation.cssSceneNavBullseyeStart);
            }
        });

        Hooks.once('renderSceneNavigation', async function() {

            switch(game.settings.get('minimal-ui', 'sceneNavigationSize')) {
                case 'standard': {
                    rootStyle.setProperty('--navilh', '32px');
                    rootStyle.setProperty('--navifs', '16px');
                    rootStyle.setProperty('--navilisttop', '24px');
                    rootStyle.setProperty('--navibuttonsize', '34px');
                    break;
                }
                case 'big': {
                    rootStyle.setProperty('--navilh', '40px');
                    rootStyle.setProperty('--navifs', '20px');
                    rootStyle.setProperty('--navilisttop', '30px');
                    rootStyle.setProperty('--navibuttonsize', '43px');
                    break;
                }
            }

        });
        
        Hooks.on('renderSceneNavigation', async function() {

            switch(game.settings.get('minimal-ui', 'sceneNavigationPreview')) {
                case 'hover': {
                    if (game.user.isGM) {
                        // Compatibility: Includes class type scene list for compatibility with Monks Scene Navigation
                        let sceneTabs = $("#scene-list li,.scene-list li");
                        if (game.modules.get('monks-scene-navigation')?.active) {
                            if (game.settings.get('minimal-ui', 'sceneNavigationSize') === 'small')
                                rootStyle.setProperty('--navithumbmarg', '15px');
                            else if (game.settings.get('minimal-ui', 'sceneNavigationSize') === 'standard')
                                rootStyle.setProperty('--navithumbmarg', '26px');
                            else
                                rootStyle.setProperty('--navithumbmarg', '32px');
                        } else {
                            rootStyle.setProperty('--navithumbmarg', '10px');
                        }
                        sceneTabs.each(function(i, sceneTab) {
                            let sceneId = $(sceneTab).attr('data-scene-id');
                            MinimalUINavigation.prepareScenePreview(i, sceneTab, sceneId);
                        });
                    }
                    break;
                }
            }

            switch(game.settings.get('minimal-ui', 'foundryLogoSize')) {
                case 'hidden': {
                    rootStyle.setProperty('--navixpos', MinimalUINavigation.cssSceneNavNoLogoStart);
                    break;
                }
                case 'small': {
                    rootStyle.setProperty('--navixpos', MinimalUINavigation.cssSceneNavSmallLogoStart);
                    break;
                }
            }

            // Compatibility Workaround for bullseye module
            if (game.modules.has('bullseye') && game.modules.get('bullseye').active) {
                rootStyle.setProperty('--navixpos', MinimalUINavigation.cssSceneNavBullseyeStart);
            }

        });

        Hooks.on('canvasPan', function() {
            MinimalUINavigation.positionPreview();
        });
    }
    
}

class MinimalUIPlayers {

    static cssPlayersSmallFontSize = '12px';
    static cssPlayersSmallWidth = '150px';
    static cssPlayersStandardFontSize = 'inherit';
    static cssPlayersStandardWidth = '200px';

    static initSettings() {
        game.settings.register('minimal-ui', 'playerList', {
            name: game.i18n.localize("MinimalUI.PlayersBehaviourName"),
            hint: game.i18n.localize("MinimalUI.PlayersBehaviourHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "default": game.i18n.localize("MinimalUI.SettingsAlwaysVisible"),
                "autohide": game.i18n.localize("MinimalUI.SettingsAutoHide"),
                "hidden": game.i18n.localize("MinimalUI.SettingsHide")
            },
            default: "autohide",
            onChange: _ => {
                window.location.reload();
            }
        });

        game.settings.register('minimal-ui', 'playerListSize', {
            name: game.i18n.localize("MinimalUI.PlayersSizeName"),
            hint: game.i18n.localize("MinimalUI.PlayersSizeHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "small": game.i18n.localize("MinimalUI.SettingsSmall"),
                "standard": game.i18n.localize("MinimalUI.SettingsStandard")
            },
            default: "small",
            onChange: _ => {
                window.location.reload();
            }
        });
    }

    static initHooks() {

        Hooks.on('renderPlayerList', async function() {
            const players = $("#players");

            players[0].val = "";
            const plSize = game.settings.get('minimal-ui', 'playerListSize');

            switch(game.settings.get('minimal-ui', 'playerList')) {
                case 'default': {
                    if (plSize === 'small') {
                        rootStyle.setProperty('--playerfsize', MinimalUIPlayers.cssPlayersSmallFontSize);
                        rootStyle.setProperty('--playerwidth', MinimalUIPlayers.cssPlayersSmallWidth);
                    } else {
                        rootStyle.setProperty('--playerfsize', MinimalUIPlayers.cssPlayersStandardFontSize);
                        rootStyle.setProperty('--playerwidth', MinimalUIPlayers.cssPlayersStandardWidth);
                        rootStyle.setProperty('--playerfsizehv', MinimalUIPlayers.cssPlayersStandardFontSize);
                        rootStyle.setProperty('--playerwidthhv', MinimalUIPlayers.cssPlayersStandardWidth);
                    }
                    rootStyle.setProperty('--playervis', 'visible');
                    // DnD UI Special Compatibility
                    if (game.modules.get('dnd-ui') && game.modules.get('dnd-ui').active) {
                        rootStyle.setProperty('--playerwidth', '200px');
                    }
                    // SWADE Special Compatibility
                    rootStyle.setProperty('--playerbennies', 'inline');
                    // ---
                    break;
                }
                case 'autohide': {
                    if (plSize === 'small') {
                        rootStyle.setProperty('--playerfsizehv', MinimalUIPlayers.cssPlayersSmallFontSize);
                    } else {
                        rootStyle.setProperty('--playerfsizehv', MinimalUIPlayers.cssPlayersStandardFontSize);
                        rootStyle.setProperty('--playerwidthhv', MinimalUIPlayers.cssPlayersStandardWidth);
                    }
                    rootStyle.setProperty('--playervis', 'visible');
                    rootStyle.setProperty('--playerslh', '2px');
                    rootStyle.setProperty('--playerh3w', '0%');
                    // DnD UI Special Compatibility
                    if (game.modules.get('dnd-ui') && game.modules.get('dnd-ui').active) {
                        players.css('border-image', 'none');
                        players.css('border-color', 'black');
                        players.hover(
                            function() {
                                players.css('border-image', '');
                                players.css('border-color', '');
                            },
                            function() {
                                players.css('border-image', 'none');
                                players.css('border-color', 'black');
                            }
                        );
                    }
                    // Compatibility for Raise Hand module
                    if (game.modules.has('raise-my-hand') && game.modules.get('raise-my-hand').active) {
                        rootStyle.setProperty('--playerwidth', '42px');
                        rootStyle.setProperty('--playerslh', '20px');
                    }
                    // SWADE Special Compatibility
                    rootStyle.setProperty('--playerbennies', 'none');
                    if (game.system.data.name === 'swede') {
                        players.hover(
                            function() {
                                $(".bennies-count").show();
                            },
                            function() {
                                $(".bennies-count").hide();
                            }
                        );
                    }
                    // ---
                    break;
                }
            }
            if (game.settings.get('minimal-ui', 'hotbar') === 'autohide') {
                rootStyle.setProperty('--playerbot', '2px');
            }
            // DnD UI Special Compatibility
            if (game.modules.get('dnd-ui') && game.modules.get('dnd-ui').active) {
                rootStyle.setProperty('--playerwidthhv', MinimalUIPlayers.cssPlayersStandardWidth);
            }
            // ---
        });

    }

}

class MinimalUISidebar {

    static initSettings() {

        game.settings.register('minimal-ui', 'rightcontrolsBehaviour', {
            name: game.i18n.localize("MinimalUI.SidebarStyleName"),
            hint: game.i18n.localize("MinimalUI.SidebarStyleHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "shown": game.i18n.localize("MinimalUI.SettingsStartVisible"),
                "collapsed": game.i18n.localize("MinimalUI.SettingsCollapsed")
            },
            default: "collapsed",
            onChange: _ => {
                window.location.reload();
            }
        });
    }

    static initHooks() {
        Hooks.once('renderSidebarTab', async function() {
            switch(game.settings.get('minimal-ui', 'rightcontrolsBehaviour')) {
                case 'shown': {
                    rootStyle.setProperty('--controlsvis', 'visible');
                    break;
                }
                case 'collapsed': {
                    await ui.sidebar.collapse();
                    await new Promise(waitABit => setTimeout(waitABit, 500));
                    rootStyle.setProperty('--controlsvis', 'visible');
                    break;
                }
                default: {
                    rootStyle.setProperty('--controlsvis', 'visible');
                    break;
                }
            }
        });

    }
}

class MinimalUITheme {

    static initSettings() {
        new window.Ardittristan.ColorSetting("minimal-ui", "borderColor", {
            name: game.i18n.localize("MinimalUI.BorderColorName"),
            hint: game.i18n.localize("MinimalUI.BorderColorHint"),
            label: game.i18n.localize("MinimalUI.ColorPicker"),
            scope: "world",
            restricted: true,
            defaultColor: "#ff4900bd",
            onChange: _ => {
                rootStyle.setProperty('--bordercolor', game.settings.get('minimal-ui', 'borderColor'));
            }
        });

        new window.Ardittristan.ColorSetting("minimal-ui", "shadowColor", {
            name: game.i18n.localize("MinimalUI.ShadowColorName"),
            hint: game.i18n.localize("MinimalUI.ShadowColorHint"),
            label: game.i18n.localize("MinimalUI.ColorPicker"),
            scope: "world",
            restricted: true,
            defaultColor: "#ff0000bd",
            type: String,
            onChange: _ => {
                rootStyle.setProperty('--shadowcolor', game.settings.get('minimal-ui', 'shadowColor'));
            }
        });

        game.settings.register("minimal-ui", "shadowStrength", {
            name: game.i18n.localize("MinimalUI.ShadowStrengthName"),
            hint: game.i18n.localize("MinimalUI.ShadowStrengthHint"),
            scope: "world",
            config: true,
            default: "5",
            type: String,
            onChange: _ => {
                rootStyle.setProperty('--shadowstrength', game.settings.get('minimal-ui', 'shadowStrength') + 'px');
            }
        });
    }

    static initHooks() {
        Hooks.once('renderSceneControls', async function () {
            rootStyle.setProperty('--bordercolor', game.settings.get('minimal-ui', 'borderColor'));
            rootStyle.setProperty('--shadowcolor', game.settings.get('minimal-ui', 'shadowColor'));
            rootStyle.setProperty('--shadowstrength', game.settings.get('minimal-ui', 'shadowStrength') + 'px');
        });
    }
}

class MinimalUIDynamic {

    static lastHoverTime;

    static initSettings() {

        game.settings.register('minimal-ui', 'dynamicMinimalUi', {
            name: game.i18n.localize("MinimalUI.DynamicUIName"),
            hint: game.i18n.localize("MinimalUI.DynamicUIHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "enabled": game.i18n.localize("MinimalUI.Enabled"),
                "disabled": game.i18n.localize("MinimalUI.Disabled")
            },
            default: "disabled",
            onChange: _ => {
                window.location.reload();
            }
        });

    }

    static initHooks() {

        Hooks.on('hoverToken', function() {
            if (game.settings.get('minimal-ui', 'dynamicMinimalUi') === 'enabled') {
                if (game.time.serverTime - MinimalUIDynamic.lastHoverTime > 60000) {
                    if (!ui.sidebar._collapsed)
                        ui.sidebar.collapse();
                    if (game.settings.get('minimal-ui', 'controlsBehaviour') === 'autohide' && MinimalUIControls.controlsLocked) {
                        MinimalUIControls.lockControls(true);
                    }
                    MinimalUIDynamic.lastHoverTime = game.time.serverTime;
                }
            }
        });

        Hooks.on('canvasInit', function() {
            const sidebarInitState = game.settings.get('minimal-ui', 'rightcontrolsBehaviour');
            const dynamicModeState = game.settings.get('minimal-ui', 'dynamicMinimalUi');
            if (sidebarInitState === 'collapsed' && dynamicModeState === 'enabled' && MinimalUIDynamic.lastHoverTime) {
                if (!ui.sidebar._collapsed)
                    ui.sidebar.collapse();
                if (game.settings.get('minimal-ui', 'controlsBehaviour') === 'autohide' && MinimalUIControls.controlsLocked) {
                    MinimalUIControls.lockControls(true);
                }
            }
        });

        Hooks.on('renderChatMessage', function() {
            if (game.settings.get('minimal-ui', 'dynamicMinimalUi') === 'enabled') {
                MinimalUIDynamic.lastHoverTime = game.time.serverTime;
                if (ui.sidebar.activeTab !== 'chat')
                    ui.sidebar.activateTab('chat');
                if (ui.sidebar._collapsed)
                    ui.sidebar.expand();
            }
        });

        Hooks.on('sidebarCollapse', function(_, collapsed) {
            if (game.settings.get('minimal-ui', 'dynamicMinimalUi') === 'enabled' && !collapsed) {
                MinimalUIDynamic.lastHoverTime = game.time.serverTime;
            }
        });

    }

}

class MinimalUIMinimize {

    static minimizedStash = {};
    static cssMinimizedSize = 150;
    static cssMinimizedBottomHotbar = 70;
    static cssMinimizedBottomNoHotbar = 5;
    static cssTopBarLeftStart = 120;
    static cssBottomBarLeftStart = 160;

    static positionMinimizeBar() {
        const setting = game.settings.get('minimal-ui', 'organizedMinimize');
        switch (setting) {
            case 'topBar': {
                rootStyle.setProperty('--minibarbot', 'unset');
                rootStyle.setProperty('--minibartop', (MinimalUIMinimize.getTopPosition()-4)+'px');
                rootStyle.setProperty('--minibarleft', MinimalUIMinimize.cssTopBarLeftStart + 'px');
                const minimizedBar = $(`<div id="minimized-bar" class="app"></div>`).hide();
                minimizedBar.appendTo('body');
                break;
            }
            case 'bottomBar': {
                const hotbarSetting = game.settings.get('minimal-ui', 'hotbar');
                if (hotbarSetting === 'hidden' || (hotbarSetting === 'onlygm' && !game.user?.isGM))
                    rootStyle.setProperty('--minibarbot', MinimalUIMinimize.cssMinimizedBottomNoHotbar+'px');
                else
                    rootStyle.setProperty('--minibarbot', MinimalUIMinimize.cssMinimizedBottomHotbar+'px');
                rootStyle.setProperty('--minibartop', 'unset');
                rootStyle.setProperty('--minibarleft', MinimalUIMinimize.cssBottomBarLeftStart + 'px');
                const minimizedBar = $(`<div id="minimized-bar" class="app"></div>`).hide();
                minimizedBar.appendTo('body');
                break;
            }
        }
    }

    static getTopPosition() {
        const minimizedSetting = game.settings.get('minimal-ui', 'organizedMinimize');
        if (['bottomBar', 'bottom'].includes(minimizedSetting)) {
            const hotbarSetting = game.settings.get('minimal-ui', 'hotbar');
            let availableHeight = parseInt($("#board").css('height'));
            if (hotbarSetting === 'hidden' || (hotbarSetting === 'onlygm' && !game.user?.isGM))
                return availableHeight - MinimalUIMinimize.cssMinimizedBottomNoHotbar - 42;
            else
                return availableHeight - MinimalUIMinimize.cssMinimizedBottomHotbar - 42;
        } else {
            const logoSetting = game.settings.get('minimal-ui', 'foundryLogoSize');
            let offset = document.querySelector("#navigation").offsetHeight + 20;
            // 65px is Rough estimate for standard logo size, to not overlap
            if (logoSetting === 'standard')
                offset = Math.max(65, offset);
            return offset;
        }
    }

    static getLeftPosition(app) {
        const minimizedSetting = game.settings.get('minimal-ui', 'organizedMinimize');
        const minGap = ['top', 'topBar'].includes(minimizedSetting) ? MinimalUIMinimize.cssTopBarLeftStart + 10 : MinimalUIMinimize.cssBottomBarLeftStart + 10;
        const sidebarGap = MinimalUIMinimize.cssMinimizedSize * 4;
        const jumpGap = MinimalUIMinimize.cssMinimizedSize + 10;
        const boardSize = parseInt($("#board").css('width'));
        const maxGap = boardSize - sidebarGap;
        let targetPos;
        for (let i = minGap; i < maxGap + jumpGap; i = i + jumpGap) {
            if (MinimalUIMinimize.minimizedStash[i]?.app.appId === app.appId) {
                MinimalUIMinimize.minimizedStash[i].position = Object.assign({}, app.position);
                targetPos = i;
                break
            } else if (!targetPos && !MinimalUIMinimize.minimizedStash[i]?.app.rendered) {
                MinimalUIMinimize.minimizedStash[i] = {app: app, position: Object.assign({}, app.position)};
                targetPos = i;
                break;
            }
        }
        return targetPos;
    }

    static setMinimizedPosition(app) {
        const leftPos = MinimalUIMinimize.getLeftPosition(app);
        const topPos = MinimalUIMinimize.getTopPosition();
        app.setPosition({
            left: leftPos ?? app.position.left,
            top: topPos ?? app.position.top,
            width: MinimalUIMinimize.cssMinimizedSize
        });
    }

    static setRestoredPosition(app) {
        const minimizedStash = Object.values(MinimalUIMinimize.minimizedStash);
        const matchedStash = minimizedStash.find(a => a.app.appId === app?.appId);
        app.setPosition(matchedStash?.position ?? app.position);
    }

    static refreshMinimizeBar() {
        const minimized = $(".minimized");
        const bar = $("#minimized-bar");
        const stashSize = Object.keys(MinimalUIMinimize.minimizedStash).length;
        if (minimized.length === 0) {
            MinimalUIMinimize.minimizedStash = {};
            bar.hide();
        } else if (stashSize > 0) {
            const maxPosition = Math.max(
                ...Object.entries(MinimalUIMinimize.minimizedStash)
                    .filter(([_, app]) => app.app.rendered)
                    .map(([pos, _]) => Number(pos))
                    .concat(0)
            );
            const setting = game.settings.get('minimal-ui', 'organizedMinimize');
            if (setting === 'topBar') {
                rootStyle.setProperty('--minibarw', maxPosition + 40 + 'px');
            } else
                rootStyle.setProperty('--minibarw', maxPosition + 'px');
            minimized.show();
            bar.show();
        }
    }

    static cleanupMinimizeBar(app, force) {
        const minimizedApps = $(".minimized").toArray();
        const matchedStash = minimizedApps.find(a => $(a).attr('data-appid') == app?.appId);
        if (force || (minimizedApps.length === 0) || (minimizedApps.length === 1 && matchedStash)) {
            $("#minimized-bar").hide();
            MinimalUIMinimize.minimizedStash = {};
            MinimalUIMinimize.positionMinimizeBar();
        } else if (matchedStash) {
            MinimalUIMinimize.refreshMinimizeBar();
        }
    }

    static enrichStyling(app) {
        app.element.find(".close").empty();
        app.element.find(".close").append(`<a class="header-button close"><i class="fas fa-times"></i></a>`);
        app.element.find(".minimize").empty();
        app.element.find(".minimize").append(`<i class="far fa-window-restore"></i>`);
        app.element.find(".minimize").show();
        if (game.settings.get('minimal-ui', 'enrichedMinimize') === 'enabled') {
            const header = app.element.find(".window-header");
            if (header.hasClass('minimized-was-pinned'))
                header.addClass('minimized-pinned');
            header.on('contextmenu', function () {
                if (header.hasClass('minimized-pinned')) {
                    header.removeClass('minimized-pinned');
                    header.removeClass('minimized-was-pinned');
                }
                else
                    header.addClass('minimized-pinned');
            });
            header.hover(
                function () {
                    header.addClass('minimized-highlight');
                },
                function () {
                    header.removeClass('minimized-highlight');
                }
            );
        }
    }

    static unEnrichStyling(app) {
        app.element.find(".close").empty();
        app.element.find(".close").append(`<i class="fas fa-times"></i>Close`);
        app.element.find(".minimize").empty();
        app.element.find(".minimize").append(`<i class="far fa-window-minimize"></i>Minimize`);
        if (game.settings.get('minimal-ui', 'enrichedMinimize') === 'enabled') {
            const header = app.element.find(".window-header");
            if (header.hasClass('minimized-pinned'))
                header.addClass('minimized-was-pinned');
            header.removeClass('minimized-pinned');
            header.off();
        }
    }

    static initSettings() {
        game.settings.register('minimal-ui', 'organizedMinimize', {
            name: game.i18n.localize("MinimalUI.OrganizedMinimizeName"),
            hint: game.i18n.localize("MinimalUI.OrganizedMinimizeHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "bottom": game.i18n.localize("MinimalUI.OrganizedMinimizeBottom"),
                "bottomBar": game.i18n.localize("MinimalUI.OrganizedMinimizeBottomBar"),
                "top": game.i18n.localize("MinimalUI.OrganizedMinimizeTop"),
                "topBar": game.i18n.localize("MinimalUI.OrganizedMinimizeTopBar"),
                "disabled": game.i18n.localize("MinimalUI.Disabled")
            },
            default: "topBar",
            onChange: _ => {
                window.location.reload();
            }
        });
        game.settings.register('minimal-ui', 'enrichedMinimize', {
            name: game.i18n.localize("MinimalUI.EnrichedMinimizeName"),
            hint: game.i18n.localize("MinimalUI.EnrichedMinimizeHint"),
            scope: 'world',
            config: true,
            type: String,
            choices: {
                "enabled": game.i18n.localize("MinimalUI.Enabled"),
                "disabled": game.i18n.localize("MinimalUI.Disabled")
            },
            default: "enabled",
            onChange: _ => {
                window.location.reload();
            }
        });
    }

    static initHooks() {

        $(document).keydown((event) => {
            // 27 == Escape
            if (event.which === 27) {
                if (Object.keys(MinimalUIMinimize.minimizedStash).length > 0) {
                    MinimalUIMinimize.cleanupMinimizeBar(undefined, true);
                }
            }

        });

        Hooks.once('ready', async function() {
            const setting = game.settings.get('minimal-ui', 'organizedMinimize');
            if (['topBar', 'bottomBar'].includes(setting))
                MinimalUIMinimize.positionMinimizeBar();
            if (setting !== 'disabled') {

                libWrapper.register('minimal-ui', 'Application.prototype.minimize', async function (wrapped, ...args) {
                    const targetHtml = $(`[data-appid='${this.appId}']`);
                    targetHtml.css('visibility', 'hidden');
                    const result = await wrapped(...args);
                    MinimalUIMinimize.setMinimizedPosition(this);
                    MinimalUIMinimize.enrichStyling(this);
                    MinimalUIMinimize.refreshMinimizeBar();
                    targetHtml.css('visibility', '');
                    return result;
                }, 'WRAPPER');

                libWrapper.register('minimal-ui', 'Application.prototype.maximize', async function (wrapped, ...args) {
                    const targetHtml = $(`[data-appid='${this.appId}']`);
                    targetHtml.css('visibility', 'hidden');
                    const result = await wrapped(...args);
                    MinimalUIMinimize.setRestoredPosition(this);
                    MinimalUIMinimize.refreshMinimizeBar();
                    MinimalUIMinimize.unEnrichStyling(this);
                    targetHtml.css('visibility', '');
                    return result;
                }, 'WRAPPER');

                libWrapper.register('minimal-ui', 'Application.prototype._getHeaderButtons', function (wrapped, ...args) {
                    let result = wrapped(...args);
                    const minimizeButton = {
                        label: "Minimize",
                        class: "minimize",
                        icon: "far fa-window-minimize",
                        onclick: () => {
                            if (this._minimized)
                                this.maximize();
                            else
                                this.minimize();
                        },
                    };
                    return [minimizeButton].concat(result)
                }, 'WRAPPER');

            }

        });

        Hooks.on('canvasPan', function() {
            MinimalUIMinimize.refreshMinimizeBar();
        });

        Hooks.on('closeSidebarTab', function(app) {
            MinimalUIMinimize.cleanupMinimizeBar(app);
        });

        Hooks.on('closeApplication', function(app) {
            MinimalUIMinimize.cleanupMinimizeBar(app);
        });

        Hooks.on('closeItemSheet', function(app) {
            MinimalUIMinimize.cleanupMinimizeBar(app);
        });

        Hooks.on('closeActorSheet', function(app) {
            MinimalUIMinimize.cleanupMinimizeBar(app);
        });

    }

}

class MinimalUIPatch {

    static initSettings() {

    }

    static initHooks() {
        Hooks.on('renderSidebarTab', function(app) {
            if (app._minimized) app.maximize();
        });

        Hooks.once('ready', async function() {

            $("#sidebar-tabs > a:nth-child(n)").click(function(eve) {
                const tabName = jQuery(eve.currentTarget).attr('data-tab');
                if (ui.sidebar._collapsed) {
                    if (tabName === 'chat') {
                        ui.sidebar.expand();
                    } else {
                        ui.sidebar.activateTab(tabName);
                    }
                }
            });

        });
    }

}

class MinimalUI {
    static noColorSettings = false;
    static noLibWrapper = false;
}

Hooks.once('init', () => {

    /** Initialize settings for Theme Functionality */
    if (game.modules.get('colorsettings')?.active) {
        MinimalUITheme.initSettings();
        MinimalUITheme.initHooks();
    } else {
        MinimalUI.noColorSettings = true;
    }
    /** ------------------------- */

    /** Initialize settings for Special Feature Functionality */
    MinimalUIDynamic.initSettings();
    MinimalUIDynamic.initHooks();
    if (!game.modules.get('lib-wrapper')?.active) {
        MinimalUI.noLibWrapper = true;
    }
    if (game.modules.get('minimize-button')?.active) {
        MinimalUI.externalMinimize = true;
    }

    if (!(MinimalUI.noLibWrapper || MinimalUI.externalMinimize)) {
        MinimalUIMinimize.initSettings();
        MinimalUIMinimize.initHooks();
    }
    /** ------------------------- */

    /** Initialize settings for Core Component Functionality */
    MinimalUILogo.initSettings();
    MinimalUINavigation.initSettings();
    MinimalUIControls.initSettings();
    MinimalUIHotbar.initSettings();
    MinimalUISidebar.initSettings();
    MinimalUIPlayers.initSettings();
    MinimalUICamera.initSettings();
    /** ------------------------- */

    /** Initialize hooks for Core Component Functionality */
    MinimalUILogo.initHooks();
    MinimalUINavigation.initHooks();
    MinimalUIControls.initHooks();
    MinimalUIHotbar.initHooks();
    MinimalUISidebar.initHooks();
    MinimalUIPlayers.initHooks();
    MinimalUICamera.initHooks();
    /** ------------------------- */

    /** Initialize Foundry UI Patches */
    MinimalUIPatch.initSettings();
    MinimalUIPatch.initHooks();
    /** ------------------------- */

});

Hooks.once('ready', () => {

    if (MinimalUI.noColorSettings && game.user.isGM)
        ui.notifications.error("Minimal UI: Disabled color features because 'lib - colorsettings' module is not active.");

    if (MinimalUI.noLibWrapper && game.user.isGM)
        ui.notifications.error("Minimal UI: Disabled Minimize Feature because 'lib-wrapper' module is not active.");

    if (MinimalUI.externalMinimize && game.user.isGM)
        ui.notifications.error("Minimal UI: Disabled Minimize Feature because 'Minimize Button' module is active and is not compatible.");

});
