# Combat Effects Tracker

> This module for Foundry VTT allows you to track temporary effects by adding them to the combat tracker. 

## Requirements

There are no other modules required for this to work, but it synergizes well with the *Add Temporary Combatant* functionality of the <a href="https://github.com/death-save/combat-utility-belt">Combat Utility Belt</a> module.

## Installation

Paste the following link in the *Install Module* interface of your Foundry VTT instance:

```
https://raw.githubusercontent.com/MKamysz/combat-effects-tracker/master/module.json
```

## How it works

For each temporary effect you want to track, add a combatant to your combat tracker that is named as __[Effect] Desired Name__. The module will check if the name of the currently active combatant contains the __[Effect]__ prefix.

Set the armor class of the temporary effect combatant to the desired duration in turns. A duration of 1 minute would equal an AC of 10.

Each time the combat tracker reaches the combatant that represents the temporary effect, it will lower its armor class by one.

![Recordit GIF](http://g.recordit.co/IeyCCcFGGt.gif)

## Notes

Note that the module currently only uses __armor class__ as a tracked resource in the combat tracker.

I might update it to offer more flexibility in the future.