// CONFIG.debug.hooks = true;

Hooks.once('init', async function() {
  const dice = {
    'd4': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
         viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g>
        <polygon points="31.7,15.7 13.2,47.8 31.7,37.1 	"/>
        <polygon points="32.3,15.7 32.3,37.1 50.8,47.8 	"/>
        <polygon points="32,37.6 13.5,48.3 50.5,48.3 	"/>
      </g>
      </svg>`,
    'd6': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g>
        <path d="M11.5,9h41c1.4,0,2.6,1.1,2.6,2.6v41c0,1.4-1.1,2.6-2.6,2.6h-41C10.1,55,9,53.9,9,52.5v-41C9,10.1,10.1,9,11.5,9z"/>
      </g>
      </svg>`,
    'd8': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g>
        <g transform="translate(-242.40981,-473.89862)">
          <path d="M254.5,515.3l19.9-34.6l20.1,34.4L254.5,515.3z"/>
          <path d="M253.4,515.1l-0.3-19.6l20.2-14.9L253.4,515.1z"/>
          <path d="M295.4,514.9l0.3-19.3l-20.3-15L295.4,514.9z"/>
          <path d="M274.4,531.2l-19.9-14.9l40-0.3L274.4,531.2z"/>
        </g>
      </g>
      </svg>`,
    'd10': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g>
        <g transform="matrix(1.1679092,0,0,1.1679092,-274.931,-137.53749)">
          <path d="M263.4,124.6L249.9,153l12.5,8.1l13.5-8.2L263.4,124.6z"/>
          <path d="M264.1,124.1l12.5,28.6l7.3-2.3l0.5-11.6L264.1,124.1z"/>
          <path d="M262.7,161.8v4.4l20.9-14.7l-7,2L262.7,161.8z"/>
          <path d="M262.7,124.2l-13.7,28.5l-7.1-3.1l-0.6-11.6L262.7,124.2z"/>
          <path d="M261.8,161.7v4.5l-20-15.4l6.9,2.7L261.8,161.7z"/>
        </g>
      </g>
      </svg>`,
    'd12': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g>
        <path d="M24,43.7l-5.4-16.3l13.7-10.8l14.1,10.8L41.2,44L24,43.7z"/>
        <path d="M7.9,24l0.5,16.3l8.8,12.1l6.3-7.7l-5.8-17.5L7.9,24z"/>
        <path d="M41,45.1L23.9,45l-5.5,7.8l13.9,4.3l14.2-4.5L41,45.1z"/>
        <path d="M8.7,23.5l8.7-11.6l14.3-4.9v8.7L17.8,26.5L8.7,23.5z"/>
        <path d="M33.4,6.9l14.2,4.8l8.3,11.9l-8.7,3.1l-13.9-11L33.4,6.9z"/>
        <path d="M42.2,44.4l5.3-16.3l8.6-3l0,14.6l-8.5,11.9L42.2,44.4z"/>
      </g>
      </svg>`,
    'd20': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g transform="translate(-246.69456,-375.66745)">
        <path d="M278.2,382.1c-0.1,0-0.2,0-0.3,0.1L264.8,398c-0.2,0.3-0.2,0.3,0.1,0.3l26.4-0.1c0.4,0,0.4,0,0.1-0.3l-13-15.8
          C278.4,382.1,278.3,382.1,278.2,382.1L278.2,382.1z M280.7,383.5l11.9,14.5c0.2,0.2,0.2,0.2,0.5,0.1l6.3-2.9
          c0.4-0.2,0.4-0.2,0.1-0.4L280.7,383.5z M275.2,384c0,0-0.1,0.1-0.3,0.2l-17.3,11.4l5.4,2.5c0.3,0.1,0.4,0.1,0.5-0.1l11.4-13.6
          C275.1,384.1,275.2,384,275.2,384L275.2,384z M300.3,395.8c-0.1,0-0.1,0-0.3,0.1l-6.4,2.9c-0.2,0.1-0.2,0.2-0.1,0.4l7.5,19
          l-0.5-22.1C300.4,395.9,300.4,395.8,300.3,395.8L300.3,395.8z M257.1,396.4l-0.7,21.5l6.3-18.6c0.1-0.3,0.1-0.3-0.1-0.4
          L257.1,396.4L257.1,396.4z M291.6,399.2l-27,0.1c-0.4,0-0.4,0-0.2,0.3l13.7,23.1c0.2,0.4,0.2,0.3,0.4,0l13.2-23.2
          C291.9,399.3,291.9,399.2,291.6,399.2L291.6,399.2z M292.7,399.8c0,0-0.1,0.1-0.1,0.2l-13.3,23.3c-0.1,0.2-0.2,0.3,0.2,0.3
          l21.1-2.9c0.3-0.1,0.3-0.2,0.2-0.5l-7.9-20.2C292.7,399.9,292.7,399.8,292.7,399.8L292.7,399.8z M263.6,400c0,0,0,0.1-0.1,0.3
          l-6.7,19.8c-0.1,0.4-0.1,0.6,0.3,0.7l20.1,2.9c0.4,0.1,0.3-0.1,0.2-0.3l-13.7-23.1C263.6,400,263.6,400,263.6,400L263.6,400z
          M258.3,421.9l19.7,11.2c0.3,0.2,0.3,0.1,0.3-0.2l-0.4-7.9c0-0.3,0-0.4-0.3-0.4L258.3,421.9L258.3,421.9z M299.1,421.9l-20,2.8
          c-0.3,0-0.2,0.2-0.2,0.4l0.4,8c0,0.2,0,0.3,0.3,0.2L299.1,421.9z"/>
      </g>
      </svg>`,
    'd100': `<?xml version="1.0" encoding="utf-8"?>
      <!-- Generator: Adobe Illustrator 24.0.3, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        viewBox="0 0 64 64" style="enable-background:new 0 0 64 64;" xml:space="preserve">
      <g>
        <g transform="matrix(1.1679092,0,0,1.1679092,-274.931,-137.53749)">
          <polygon points="264.7,150.8 263.7,151.4 262.2,152.3 261.4,152.8 259.6,153.8 253.3,157.7 242.7,150.8 254.2,126.6 258.2,135.9
            259.9,139.8 262.7,146.1 263.1,147 263.1,147 		"/>
          <polygon points="271.9,138.7 271.5,148.5 265.4,150.5 263.5,146.2 263.1,145.3 258.8,135.5 257.8,133.3 254.7,126.2 255.8,127
            263.4,132.5 267.8,135.7 268.3,136 		"/>
          <polygon points="271.3,149.5 264.9,154.1 264.6,154.2 264.2,154.5 262.3,155.9 253.6,162 253.6,158.2 260.2,154.3 262.1,153.2
            262.8,152.7 263.9,152 265.4,151.1 		"/>
          <path d="M253.6,126.3L242,150.5l-6.1-2.6l-0.5-9.9L253.6,126.3z"/>
          <path d="M252.8,158.2v3.8l-17-13.1l5.9,2.3L252.8,158.2z"/>
        </g>
      </g>
      <g>
        <g transform="matrix(1.1679092,0,0,1.1679092,-274.931,-137.53749)">
          <polygon points="283,151.5 271.5,158.4 265.6,154.5 272.2,149.7 272.6,138.2 268.6,135.3 272.5,127.3 		"/>
          <path d="M273,126.9l10.6,24.3l6.2-2l0.4-9.8L273,126.9z"/>
          <path d="M271.9,159v3.7l17.7-12.5l-5.9,1.7L271.9,159z"/>
          <polygon points="271.9,127 268.1,134.9 264.1,132 		"/>
          <polygon points="265,155 271.1,158.9 271.1,162.7 262.9,156.4 		"/>
        </g>
      </g>
      </svg>`
  };

  Handlebars.registerHelper('dtSvgDie', (context, options) => {
    return `${context}Svg`;
  });

  for (let [die, tpl] of Object.entries(dice)) {
    // const partialTemplate = await renderTemplate(tpl, {});
    Handlebars.registerPartial(`${die}Svg`, tpl);
  }
});

Hooks.on('renderSidebarTab', (app, html, data) => {
  if (!game.settings.get('dice-calculator', 'enableDiceTray')) {
    return;
  }

  // A mapper for behavior and layout functions depending on the game system
  // -------------------------------
  // EXTEND HERE FOR CUSTOM SYSTEMS
  // -------------------------------
  const system_behavior_mapper = {
    generic: {
      apply_layout: function(html) {_dtApplyGenericLayout(html)},
      get_raw_formula: function(qty, dice, html) {return _dtGetGenericRawFormula(qty, dice, html)},
      load_dice: function() {return _dtLoadGenericDice()}
    },
    swade: {
      apply_layout: function(html) {_dtApplySwadeLayout(html)},
      get_raw_formula: function(qty, dice, html) {return _dtGetSwadeRawFormula(qty, dice, html)},
      load_dice: function() {return _dtLoadSwadeDice()}
    },
    dnd5e: {
      apply_layout: function(html) {_dtApplyDnd5eLayout(html)},
      get_raw_formula: function(qty, dice, html) {return _dtGetDnd5eRawFormula(qty, dice, html)},
      load_dice: function() {return _dtLoadDnd5eDice()}
    }
  };
  // -------------------------------

  // Define which behavior in the mapper to use
  const game_system = game.system.id;
  let formula_applier = null;
  if (game_system in system_behavior_mapper) {
    formula_applier = system_behavior_mapper[game_system];
  } else {
    formula_applier = system_behavior_mapper['generic'];
  }

  let $chat_form = html.find('#chat-form');
  const template = 'modules/dice-calculator/templates/tray.html';
  const options = formula_applier.load_dice();

  renderTemplate(template, options).then(c => {
    if (c.length > 0) {
      let $content = $(c);
      $chat_form.after($content);
      $content.find('.dice-tray__button').on('click', event => {
        event.preventDefault();
        let $self = $(event.currentTarget);
        let dataset = event.currentTarget.dataset;

        _dtUpdateChatDice(dataset, 'add', html, formula_applier);
      });
      $content.find('.dice-tray__button').on('contextmenu', event => {
        event.preventDefault();
        let $self = $(event.currentTarget);
        let dataset = event.currentTarget.dataset;

        _dtUpdateChatDice(dataset, 'sub', html, formula_applier);
      });
      $content.find('.dice-tray__input').on('input', event => {
        // event.preventDefault();
        let $self = $(event.currentTarget);
        let dataset = event.currentTarget.dataset;
        let mod_val = $self.val();

        mod_val = Number(mod_val);
        mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

        $self.val(mod_val);
        _dtApplyModifier(html);
      });
      $content.find('.dice-tray__math').on('click', event => {
        event.preventDefault();
        let $self = $(event.currentTarget);
        let dataset = event.currentTarget.dataset;
        let mod_val = $('input[name="dice.tray.modifier"]').val();

        mod_val = Number(mod_val);
        mod_val = Number.isNaN(mod_val) ? 0 : mod_val;

        switch (dataset.formula) {
          case '+1':
            mod_val = mod_val + 1;
            break;

          case '-1':
            mod_val = mod_val - 1;

          default:
            break;
        }
        $('input[name="dice.tray.modifier"]').val(mod_val);
        _dtApplyModifier(html);
      });
      formula_applier.apply_layout(html);
    }
  });
});

function _dtUpdateChatDice(dataset, direction, html, formula_applier) {
  let $chat = html.find('#chat-form textarea');
  let chat_val = String($chat.val());
  let new_formula = null;
  let roll_prefix = '/r';
  let $roll_mode_selector = html.find('select[name="rollMode"]');
  let qty = 0;

  if ($roll_mode_selector.length > 0) {
    switch ($roll_mode_selector.val()) {
      case 'gmroll':
        roll_prefix = '/gmr';
        break;

      case 'blindroll':
        roll_prefix = '/br';
        break;

      case 'selfroll':
        roll_prefix = '/sr';
        break;

      default:
        roll_prefix = '/r';
        break;
    }
  }

  if (html.find('.dice-tray__disadvantage').hasClass('active')) {
    roll_suffix = 'x=';
  }

  if (html.find('.dice-tray__advantage').hasClass('active')) {
    add_wild = true;
  }

  let match_dice = dataset.formula == 'd10' ? 'd10(?!0)' : dataset.formula;

  let match_string = new RegExp(formula_applier.get_raw_formula('([0-9]*)', '('+match_dice+')', html) + '(?=\\+|\\-|$)');
  if (chat_val.match(match_string)) {
    let match = chat_val.match(match_string);
    let parts = {};

    parts.txt = match[0] ? match[0] : '';
    parts.qty = match[1] ? match[1] : '1';
    parts.die = match[2] ? match[2] : '';

    if (parts.die == '' && match[3]) {
      parts.die = match[3];
    }

    qty = direction == 'add' ? Number(parts.qty) + 1 : Number(parts.qty) - 1;

    // Update the dice quantity.
    qty = qty < 1 ? '' : qty;

    if (qty == '' && direction == 'sub') {
      new_formula = '';
      let new_match_string = new RegExp(formula_applier.get_raw_formula('([0-9]*)', '('+match_dice+')', html) + '(?=\\+|\\-|$)');
      chat_val = chat_val.replace(new_match_string, new_formula);
      if (new RegExp(`${roll_prefix}\\s+(?!.*d\\d+.*)`).test(chat_val)) {
        chat_val = '';
      }
    }
    else {
      new_formula = formula_applier.get_raw_formula(qty, parts.die, html);
      chat_val = chat_val.replace(match_string, new_formula);
    }
    $chat.val(chat_val);
  }
  else {
    qty = 1;
    if (chat_val == '') {
      $chat.val(roll_prefix + ' ' + formula_applier.get_raw_formula('', dataset.formula, html));
    }
    else {
      chat_val = chat_val.replace(/(\/r|\/gmr|\/br|\/sr) /g, roll_prefix + ' ' + formula_applier.get_raw_formula('', dataset.formula, html) + '+');
      $chat.val(chat_val);
    }
  }
  // Add a flag indicator on the dice.
  let $flag_button = html.find(`.dice-tray__flag--${dataset.formula}`);
  if (qty == '') {
    qty = direction == 'add' ? 1 : 0;
  }
  qty = Number(qty);
  if (qty > 0) {
    $flag_button.text(qty);
    $flag_button.removeClass('hide');
  }
  else if (qty < 0) {
    $flag_button.text(qty);
  }
  else {
    $flag_button.text('');
    $flag_button.addClass('hide');
  }
  // TODO: Optimize this so that we're not running two regexes.
  chat_val = $chat.val();
  // chat_val = chat_val.replace(/(\/r|\/gmr|\/br|\/sr) /g, `${roll_prefix} `);
  chat_val = chat_val.replace(/(\/r|\/gmr|\/br|\/sr)(( \+)| )/g, `${roll_prefix} `).replace(/\+{2}/g, '+').replace(/\-{2}/g, '-').replace(/\+$/g, '');
  $chat.val(chat_val);
  _dtApplyModifier(html);
}

function _dtApplyModifier(html) {
  $mod_input = html.find('.dice-tray__input');
  mod_val = Number($mod_input.val());
  let mod_string = '';
  if ($mod_input.length > 0 && !Number.isNaN(mod_val)) {
    if (mod_val > 0) {
      mod_string = `+${mod_val}`;
    }
    else if (mod_val < 0) {
      mod_string = `${mod_val}`;
    }
  }

  // Existing modifier.
  if (mod_string.length > 0 || mod_string === '') {
    let $chat = html.find('#chat-form textarea');
    let chat_val = String($chat.val());

    let match_string = new RegExp('(\\+|\\-)([0-9]+)$');
    if (chat_val.match(match_string)) {
      chat_val = chat_val.replace(match_string, mod_string);
      $chat.val(chat_val);
    }
    else if (chat_val !== '') {
      chat_val = chat_val + mod_string;
      $chat.val(chat_val);
    }
  }

  return mod_string;
}

//----------------------------------
//Specific System Implementations
//----------------------------------

// LAYOUT BY SYSTEM
function _dtApplyGenericLayout(html) {
  html.find('.dice-tray__roll').on('click', event => {
    event.preventDefault();
    let spoofed = $.Event('keydown');
    spoofed.which = 13;
    spoofed.keycode = 13;
    spoofed.code = 'Enter';
    spoofed.key = 'Enter';
    html.find('#chat-message').trigger(spoofed);
    html.find('.dice-tray__input').val(0);
    html.find('.dice-tray__flag').text('');
    html.find('.dice-tray__flag').addClass('hide');
  });
  html.find('#chat-message').keydown(e => {
    if (e.code == 'Enter' || e.key == 'Enter' || e.keycode == '13') {
      html.find('.dice-tray__flag').text('');
      html.find('.dice-tray__flag').addClass('hide');
    }
  });
}

function _dtApplyDnd5eLayout(html) {
  html.find('#dice-tray-math').show();
  html.find('#dice-tray-math').append(
    `<div class="dice-tray__stacked flexcol">
       <button class="dice-tray__ad dice-tray__advantage" data-formula="kh" title="${game.i18n.localize("DICE_TRAY.Advantage")}">${game.i18n.localize('DICE_TRAY.Adv')}</button>
       <button class="dice-tray__ad dice-tray__disadvantage" data-formula="kl" title="${game.i18n.localize("DICE_TRAY.Disadvantage")}">${game.i18n.localize('DICE_TRAY.Dis')}</button>
    </div>`
  );
  html.find('.dice-tray__ad').on('click', event => {
    event.preventDefault();
    let $self = $(event.currentTarget);
    let dataset = event.currentTarget.dataset;
    let $chat = html.find('#chat-form textarea');
    let chat_val = String($chat.val());
    let match_string = new RegExp(`d20kh|d20kl`);

    // If there's a d20, toggle the current if needed.
    if (chat_val.match(match_string, 'd20')) {
      chat_val = chat_val.replace(match_string, chat_val.includes(dataset.formula) ? 'd20' : `d20${dataset.formula}`);
    }
    // Otherwise, add the current.
    else {
      chat_val = chat_val.replace('d20', `d20${dataset.formula}`);
    }

    // If there's only 1d20, make it 2.
    if (chat_val.match(match_string) && chat_val.match(/(\+| )d20/g)) {
      chat_val = chat_val.replace(' d20', ' 2d20').replace('+d20', '+2d20');
      html.find('.dice-tray__flag--d20').text('2');
    }
    // Handle toggle classes.
    if (chat_val.includes('kh')) {
      html.find('.dice-tray__advantage').addClass('active');
    }
    else {
      html.find('.dice-tray__advantage').removeClass('active');
    }
    if (chat_val.includes('kl')) {
      html.find('.dice-tray__disadvantage').addClass('active');
    }
    else {
      html.find('.dice-tray__disadvantage').removeClass('active');
    }
    // Update the value.
    $chat.val(chat_val);
  });
  html.find('.dice-tray__roll').on('click', event => {
    event.preventDefault();
    let spoofed = $.Event('keydown');
    spoofed.which = 13;
    spoofed.keycode = 13;
    spoofed.code = 'Enter';
    spoofed.key = 'Enter';
    html.find('#chat-message').trigger(spoofed);
    html.find('.dice-tray__input').val(0);
    html.find('.dice-tray__flag').text('');
    html.find('.dice-tray__flag').addClass('hide');
    html.find('.dice-tray__ad').removeClass('active');
  });
  html.find('#chat-message').keydown(e => {
    if (e.code == 'Enter' || e.key == 'Enter' || e.keycode == '13') {
      html.find('.dice-tray__flag').text('');
      html.find('.dice-tray__flag').addClass('hide');
      html.find('.dice-tray__ad').removeClass('active');
    }
  });
}

function _dtApplySwadeLayout(html) {
  html.find('#dice-tray-math').show();
  html.find('#dice-tray-math').append(
    `<div class="dice-tray__stacked flexcol">
       <button class="dice-tray__ad dice-tray__advantage" data-formula="kh" title="${game.i18n.localize("DICE_TRAY.WildDie")}">${game.i18n.localize("DICE_TRAY.Wild")}</button>
       <button class="dice-tray__ad dice-tray__disadvantage" data-formula="kl" title="${game.i18n.localize("DICE_TRAY.ExplodingDie")}">${game.i18n.localize("DICE_TRAY.Ace")}</button>
     </div>`
  );
  html.find('.dice-tray__advantage').on('click', event => {
    event.preventDefault();
    let $self = $(event.currentTarget);
    if (!html.find('.dice-tray__advantage').hasClass('active')) {
      html.find('.dice-tray__advantage').addClass('active');
    }
    else {
      html.find('.dice-tray__advantage').removeClass('active');
    }
  });
  html.find('.dice-tray__disadvantage').on('click', event => {
    event.preventDefault();
    let $self = $(event.currentTarget);
    if (!html.find('.dice-tray__disadvantage').hasClass('active')) {
      html.find('.dice-tray__disadvantage').addClass('active');
    }
    else {
      html.find('.dice-tray__disadvantage').removeClass('active');
    }
  });
  html.find('.dice-tray__roll').on('click', event => {
    event.preventDefault();
    let spoofed = $.Event('keydown');
    spoofed.which = 13;
    spoofed.keycode = 13;
    spoofed.code = 'Enter';
    spoofed.key = 'Enter';
    html.find('#chat-message').trigger(spoofed);
    html.find('.dice-tray__input').val(0);
    html.find('.dice-tray__flag').text('');
    html.find('.dice-tray__flag').addClass('hide');
  });
  html.find('#chat-message').keydown(e => {
    if (e.code == 'Enter' || e.key == 'Enter' || e.keycode == '13') {
      html.find('.dice-tray__flag').text('');
      html.find('.dice-tray__flag').addClass('hide');
    }
  });
}

// DICE LOADING BY SYSTEM
function _dtLoadGenericDice() {
  return {
    dice: {
      d4: 'd4',
      d6: 'd6',
      d8: 'd8',
      d10: 'd10',
      d12: 'd12',
      d20: 'd20',
      d100: 'd100'
    },
  };
}

function _dtLoadDnd5eDice() {
  return {
           dice: {
             d4: 'd4',
             d6: 'd6',
             d8: 'd8',
             d10: 'd10',
             d12: 'd12',
             d20: 'd20',
             d100: 'd100'
           }
         };
}

function _dtLoadSwadeDice() {
  var all_dice = {
                   dice: {
                     d4: 'd4',
                     d6: 'd6',
                     d8: 'd8',
                     d10: 'd10',
                     d12: 'd12'
                   }
                 };
  // This will fail if not within a swade system
  if (game.settings.get('dice-calculator', 'enableExtraDiceInSwade')) {
    all_dice.dice.d20 = 'd20';
    all_dice.dice.d100 = 'd100';
  }
  return all_dice;
}

// --------------------------
// RAW FORMULAS BY SYSTEM
function _dtGetGenericRawFormula(qty, dice, html) {
  return `${qty === '' ? 1 : qty}${dice}`
}

function _dtGetDnd5eRawFormula(qty, dice, html) {
  return `${qty === '' ? 1 : qty}${dice}`
}

function _dtGetSwadeRawFormula(qty, dice, html) {
  let roll_suffix = '';
  let add_wild = false;

  if (html.find('.dice-tray__disadvantage').hasClass('active')) {
    roll_suffix = 'x=';
  }
  if (html.find('.dice-tray__advantage').hasClass('active')) {
    add_wild = true;
  }

  if (add_wild) {
    return `{${qty === '' ? 1 : qty}${dice}${roll_suffix},1d6${roll_suffix}}kh`;
  }
  else {
    return `${qty === '' ? 1 : qty}${dice}${roll_suffix}`;
  }
}
