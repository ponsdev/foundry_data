const _0x38ef=['damage','values','TITLE_LOWER_WORDS','_pHandleCreateChatMessage_mutExtractSimpleAttacks','getCurrentAbilityScores','\x22></div>','properties','_pHandleCreateChatMessage','forEach','endsWith','fake','imageButtonEnabled','tree','count','items','error','_doNamedActionReplace','_doWeaponChoiceReplace','actor','init','dice','getWithoutParens','rollItem','weapon','join','parts','textToNumber','length','<PLUT_SPLIT_MARKER>','with','data-item-id','_doComplexActionReplace','push','max','tokens','_pHandleCreateChatMessage_mutExtractNamedActions','flat','map','altKey','_MARKER_SPLIT','_id','TERMS_COUNT','reduce','item','multiattack','ranged','toLowerCase','isPunctuation','melee','pop','deepEquals','_getActionByLowerName','thr','settings','getSentences','createChatMessage','betterrolls5e','184fZlKtU','shift','martialR','type','collection','405877JitUlg','getAbilityModNumber','evl','isBetterRollsActive','description','weaponType','_onItemRoll','146681CkQKAc','rwak','its','speaker','actionType','sort','762591WkBJPZ','Failed\x20to\x20evaluate\x20damage\x20part\x20\x22','toMessage','isAutoMultiattack','293230vQHIYa','text','attr','slice','name','getTokens','755135oxvQca','simpleR','filter','get','replace','find','split','688312TTwmgw','data','1742vLYpgY','test','isCapsFirst','includes','userId','_getToRuns','value','content','and','meanDamage','shiftKey','last','ability','simpleM','copy','mwak','trim','ascSort'];const _0x4602=function(_0x2751a4,_0x33fc43){_0x2751a4=_0x2751a4-0x187;let _0x38ef5d=_0x38ef[_0x2751a4];return _0x38ef5d;};const _0x268734=_0x4602;(function(_0x3d9ded,_0x266173){const _0x55ec5d=_0x4602;while(!![]){try{const _0x26d1a5=-parseInt(_0x55ec5d(0x19c))+parseInt(_0x55ec5d(0x1ad))+parseInt(_0x55ec5d(0x197))*-parseInt(_0x55ec5d(0x1bc))+parseInt(_0x55ec5d(0x1b3))+parseInt(_0x55ec5d(0x1ba))+-parseInt(_0x55ec5d(0x1a9))+parseInt(_0x55ec5d(0x1a3));if(_0x26d1a5===_0x266173)break;else _0x3d9ded['push'](_0x3d9ded['shift']());}catch(_0x2dd28a){_0x3d9ded['push'](_0x3d9ded['shift']());}}}(_0x38ef,0x6047a));import{Config}from'./Config.js';import{LGT,Util}from'./Util.js';import{Consts}from'./Consts.js';import{UtilCompat}from'./UtilCompat.js';import{Charactermancer_Util}from'./UtilCharactermancer.js';class ActorMultiattack{static[_0x268734(0x1e1)](){const _0x383aab=_0x268734;Hooks['on'](_0x383aab(0x195),(_0x24c344,_0x29d3e8,_0x1e9e07)=>{const _0x4aa3f3=_0x383aab;this[_0x4aa3f3(0x1d5)](_0x24c344,_0x29d3e8,_0x1e9e07);});}static async[_0x268734(0x1d5)](_0x179d52,_0x2d603b,_0x1d9617){const _0x27a10e=_0x268734;if(!Config[_0x27a10e(0x1b6)](_0x27a10e(0x1e0),_0x27a10e(0x1ac)))return;if(_0x1d9617!==game[_0x27a10e(0x1c0)])return;const _0x394c53=MiscUtil[_0x27a10e(0x1b6)](_0x179d52,'data',_0x27a10e(0x1a6),_0x27a10e(0x1e0));if(!_0x394c53)return;const _0x57d7a5=Actor[_0x27a10e(0x19b)][_0x27a10e(0x1b6)](_0x394c53);if(!_0x57d7a5)return;const _0x5808b8=$(_0x179d52['data'][_0x27a10e(0x1c3)]||'')[_0x27a10e(0x1af)](_0x27a10e(0x1ec));if(!_0x5808b8)return;const _0x386020=_0x57d7a5[_0x27a10e(0x1dc)]['get'](_0x5808b8),_0xb20dfe=Util[_0x27a10e(0x1e3)](_0x386020['name'])[_0x27a10e(0x18c)]();if(_0xb20dfe!==_0x27a10e(0x18a))return;const _0x1fa72a=$(_0x386020[_0x27a10e(0x1bb)][_0x27a10e(0x1bb)][_0x27a10e(0x1a0)][_0x27a10e(0x1c2)])[_0x27a10e(0x1ae)]()[_0x27a10e(0x1cc)]();if(!_0x1fa72a)return;const _0x1f1a5b=this[_0x27a10e(0x1c1)]({'actor':_0x57d7a5,'description':_0x1fa72a});for(const _0x120805 of _0x1f1a5b){for(let _0x4b2b88=0x0;_0x4b2b88<_0x120805[_0x27a10e(0x1db)];++_0x4b2b88){const _0x5670f7={'preventDefault':()=>{},'stopPropagation':()=>{},'currentTarget':$('<div\x20class=\x22item\x22\x20data-item-id=\x22'+_0x120805[_0x27a10e(0x189)][_0x27a10e(0x1f6)]+_0x27a10e(0x1d3))[0x0]};if(UtilCompat[_0x27a10e(0x19f)]()){const _0x5afde7=new Event(_0x27a10e(0x1d8));_0x5afde7['ctrlKey']=![],_0x5afde7[_0x27a10e(0x1c6)]=![],_0x5afde7[_0x27a10e(0x1f4)]=![];const _0x50110c={'adv':0x0,'disadv':0x0,'event':_0x5afde7};!game[_0x27a10e(0x193)][_0x27a10e(0x1b6)](_0x27a10e(0x196),_0x27a10e(0x1d9))?_0x120805[_0x27a10e(0x189)][_0x27a10e(0x1e0)]['sheet'][_0x27a10e(0x1a2)](_0x5670f7):await BetterRolls[_0x27a10e(0x1e4)](_0x120805[_0x27a10e(0x189)],mergeObject(_0x50110c,{'preset':0x0}))[_0x27a10e(0x1ab)]();}else await _0x120805[_0x27a10e(0x189)]['roll']();}}}static[_0x268734(0x1c1)]({actor:_0x237e3d,description:_0x886630}){const _0x2fbeb9=_0x268734;let _0xde3f44=Util[_0x2fbeb9(0x194)](_0x886630);const _0x3ad1bf=[];let _0x287ca6=this[_0x2fbeb9(0x1f1)](_0x237e3d,_0xde3f44,_0x3ad1bf);return _0x287ca6=_0x287ca6[_0x2fbeb9(0x1f2)](),this['_pHandleCreateChatMessage_mutExtractSimpleAttacks'](_0x237e3d,_0x287ca6,_0x3ad1bf),_0x3ad1bf;}static[_0x268734(0x1f1)](_0x231510,_0x51beb6,_0x46b188){const _0x5cd787=_0x268734;_0x51beb6=MiscUtil[_0x5cd787(0x1ca)](_0x51beb6);for(let _0x2ed442=0x0;_0x2ed442<_0x51beb6['length'];++_0x2ed442){const _0x1a1c21=_0x51beb6[_0x2ed442],_0x19db69=Util[_0x5cd787(0x1b2)](_0x1a1c21);while((Util['isPunctuation'](_0x19db69[0x0])||Util[_0x5cd787(0x1be)](_0x19db69[0x0]))&&_0x19db69[_0x5cd787(0x1e9)])_0x19db69[_0x5cd787(0x198)]();const _0x465f4c=[];let _0x19be38=[],_0x3d0315={};const _0x2e7064=()=>{const _0x2a3322=_0x5cd787;if(!_0x19be38[_0x2a3322(0x1b5)](_0x1c5ba8=>_0x1c5ba8!=='\x20')[_0x2a3322(0x1e9)])return;while(_0x19be38[_0x2a3322(0x1e9)]){if(StrUtil[_0x2a3322(0x1d0)][_0x2a3322(0x1bf)](_0x19be38['last']())||_0x19be38[_0x2a3322(0x1c7)]()==='\x20')_0x19be38[_0x2a3322(0x18f)]();else break;}_0x465f4c[_0x2a3322(0x1ee)]({'name':_0x19be38[_0x2a3322(0x1e6)](''),'count':_0x3d0315[_0x2a3322(0x1db)]||0x1}),_0x19be38=[],_0x3d0315={};};for(let _0x4028c0=0x0;_0x4028c0<_0x19db69[_0x5cd787(0x1e9)];++_0x4028c0){const _0x1d6b60=_0x19db69[_0x4028c0];if(!_0x19be38[_0x5cd787(0x1e9)]&&_0x1d6b60==='\x20')continue;if(Util[_0x5cd787(0x1be)](_0x1d6b60))_0x19be38['push'](_0x1d6b60);else{if(_0x19be38[_0x5cd787(0x1e9)]&&(StrUtil['TITLE_LOWER_WORDS'][_0x5cd787(0x1bf)](_0x1d6b60)||_0x1d6b60==='\x20'))_0x19be38['push'](_0x1d6b60);else{const _0x1167dc=Consts[_0x5cd787(0x187)]['find'](_0x498405=>{const _0x360c6c=_0x5cd787,_0x4059ad=_0x19db69[_0x360c6c(0x1b0)](_0x4028c0,_0x4028c0+_0x498405[_0x360c6c(0x1f0)]['length']);return CollectionUtil[_0x360c6c(0x190)](_0x498405['tokens'],_0x4059ad);});_0x19be38[_0x5cd787(0x1e9)]&&_0x1167dc&&(_0x4028c0+=_0x1167dc[_0x5cd787(0x1f0)][_0x5cd787(0x1e9)]-0x1,_0x3d0315[_0x5cd787(0x1db)]=_0x1167dc[_0x5cd787(0x1db)]),_0x2e7064();}}}_0x2e7064();let _0x546300=_0x1a1c21;_0x465f4c[_0x5cd787(0x1d6)](_0x3a8d44=>{const _0x85dfcc=_0x5cd787,_0x3d4214=_0x3a8d44['name']['toLowerCase']()[_0x85dfcc(0x1cc)]();if(_0x3d4214['includes'](_0x85dfcc(0x18a)))return;const _0x1d0ef1=_0x231510[_0x85dfcc(0x1dc)]['find'](_0x25d944=>Util[_0x85dfcc(0x1e3)](_0x25d944[_0x85dfcc(0x1b1)])['toLowerCase']()===_0x3d4214);if(!_0x1d0ef1)return;_0x46b188[_0x85dfcc(0x1ee)]({'item':_0x1d0ef1,'count':_0x3a8d44['count']||0x1}),_0x546300=_0x546300[_0x85dfcc(0x1b7)](_0x3a8d44[_0x85dfcc(0x1b1)],ActorMultiattack[_0x85dfcc(0x1f5)]);}),_0x51beb6[_0x2ed442]=_0x546300[_0x5cd787(0x1b9)](ActorMultiattack[_0x5cd787(0x1f5)]);}return _0x51beb6;}static[_0x268734(0x1d1)](_0x3e3106,_0x5da394,_0x153000){const _0x69a915=_0x268734;_0x5da394[_0x69a915(0x1d6)](_0xfeedd4=>{const _0x48c0d9=_0x69a915;_0xfeedd4=_0xfeedd4[_0x48c0d9(0x1b7)](/one (.*?) attack(?:[^:]|$)/gi,(..._0xd3966a)=>this[_0x48c0d9(0x1de)]({'outStack':_0x153000,'actor':_0x3e3106,'m':_0xd3966a})),_0xfeedd4=_0xfeedd4[_0x48c0d9(0x1b7)](/(two|three|four|five|six|seven|eight) (.*?) attacks(?:[^:]|$)/gi,(..._0x3e12c7)=>this[_0x48c0d9(0x1de)]({'outStack':_0x153000,'actor':_0x3e3106,'m':_0x3e12c7})),_0xfeedd4=_0xfeedd4[_0x48c0d9(0x1b7)](/makes (one|two|three|four|five|six|seven|eight) attacks? with its (.*?(?: or .*?)?)$/gi,(..._0x39e11b)=>this['_doWeaponChoiceReplace']({'outStack':_0x153000,'actor':_0x3e3106,'m':_0x39e11b})),_0xfeedd4=_0xfeedd4['replace'](/makes (?:two|three|four|five|six|seven|eight)(?: melee| ranged)? attacks:(.*?)$/gi,(..._0x1e02dd)=>this[_0x48c0d9(0x1ed)]({'outStack':_0x153000,'actor':_0x3e3106,'m':_0x1e02dd}));});}static[_0x268734(0x1de)]({outStack:_0x10fbec,actor:_0xd2b5b1,m:_0x4bfbe1}){const _0x200a61=_0x268734,_0x59da12=_0x4bfbe1[0x1][_0x200a61(0x18c)](),_0x33e242=Parser[_0x200a61(0x1e8)](_0x59da12),_0x22e3f5=Util[_0x200a61(0x1e3)](_0x4bfbe1[0x2])[_0x200a61(0x18c)]();if(_0x22e3f5[_0x200a61(0x1bf)](_0x200a61(0x18a)))return'';if(_0x22e3f5===_0x200a61(0x18e)||_0x22e3f5===_0x200a61(0x18b))return this['_pHandleCreateChatMessage_handleMeleeRangedAttacks'](_0xd2b5b1,_0x22e3f5,_0x33e242,_0x10fbec),'';const _0x132058=_0xd2b5b1['items'][_0x200a61(0x1b8)](_0x1964a2=>Util[_0x200a61(0x1e3)](_0x1964a2[_0x200a61(0x1b1)])[_0x200a61(0x18c)]()===_0x22e3f5);if(!_0x132058)return _0x4bfbe1[0x0];return _0x10fbec[_0x200a61(0x1ee)]({'item':_0x132058,'count':_0x33e242}),'';}static[_0x268734(0x1df)]({outStack:_0xc6be3e,actor:_0xa46a88,m:_0x436498}){const _0x922e87=_0x268734,_0xf1bed7=_0x436498[0x1];let _0x43aa9e=_0x436498[0x2];const _0xf438e0=Util['getTokens'](_0x43aa9e);while(_0xf438e0[_0x922e87(0x1e9)]){const _0x4db816=[];for(let _0x498dbe=0x0;_0x498dbe<_0xf438e0[_0x922e87(0x1e9)];++_0x498dbe){const _0x322149=_0xf438e0[_0x498dbe][_0x922e87(0x18c)]();if(_0x322149===_0x922e87(0x1c4)||_0x322149==='or'||_0x322149===_0x922e87(0x1a5)||_0x322149===_0x922e87(0x1eb)||Util[_0x922e87(0x18d)](_0x322149)){_0xf438e0[_0x922e87(0x198)]();break;}else _0x4db816[_0x922e87(0x1ee)](_0xf438e0[_0x922e87(0x198)]()),_0x498dbe--;}if(_0x4db816[_0x922e87(0x1e9)]){const _0x6d1bb6=_0x4db816['join']('')['trim']();if(_0x6d1bb6[_0x922e87(0x18c)]()[_0x922e87(0x1bf)]('multiattack'))continue;const _0x5e8ebc=this[_0x922e87(0x191)](_0xa46a88,_0x6d1bb6);_0x5e8ebc&&_0xc6be3e[_0x922e87(0x1ee)]({'item':_0x5e8ebc,'count':Parser[_0x922e87(0x1e8)](_0xf1bed7)});}}return _0xf438e0['join']('')[_0x922e87(0x1cc)]();}static[_0x268734(0x1ed)]({outStack:_0x599618,actor:_0x87c976,m:_0x188120}){const _0x48e9a3=_0x268734;let _0x419d09=_0x188120[0x1],_0x7b04f2=![],_0x1e4a98=null;while(_0x419d09[_0x48e9a3(0x1e9)]&&_0x419d09!==_0x1e4a98){_0x1e4a98=_0x419d09,_0x419d09=_0x419d09['replace'](/(one|two|three|four|five|six|seven|eight) with (?:its |his |her )(.*)/gi,(..._0x702e19)=>{const _0x5bc7e8=_0x48e9a3,_0x5c87a6=_0x702e19[0x1],_0xbe7c18=_0x702e19[0x2],_0x282b7c=[],_0x45a576=Util[_0x5bc7e8(0x1b2)](_0xbe7c18);for(let _0x327250=0x0;_0x327250<_0x45a576[_0x5bc7e8(0x1e9)];++_0x327250){const _0xab7f83=_0x45a576[_0x327250][_0x5bc7e8(0x18c)]();if(_0xab7f83==='and'||_0xab7f83==='or'||Util[_0x5bc7e8(0x18d)](_0xab7f83)){_0x45a576[_0x5bc7e8(0x198)]();break;}else _0x282b7c[_0x5bc7e8(0x1ee)](_0x45a576[_0x5bc7e8(0x198)]()),_0x327250--;}if(_0x282b7c[_0x5bc7e8(0x1e9)]){const _0x21fa60=_0x282b7c[_0x5bc7e8(0x1e6)]('')[_0x5bc7e8(0x1cc)]();if(_0x21fa60['toLowerCase']()[_0x5bc7e8(0x1bf)]('multiattack'))return _0x45a576[_0x5bc7e8(0x1e6)]('')[_0x5bc7e8(0x1cc)]();const _0x54dbf5=this[_0x5bc7e8(0x191)](_0x87c976,_0x21fa60);_0x54dbf5&&_0x599618[_0x5bc7e8(0x1ee)]({'item':_0x54dbf5,'count':Parser[_0x5bc7e8(0x1e8)](_0x5c87a6)});}return _0x45a576['join']('')[_0x5bc7e8(0x1cc)]();});}if(_0x7b04f2)return'';return _0x188120[0x0];}static['_pHandleCreateChatMessage_handleMeleeRangedAttacks'](_0x5cd2d6,_0x5a2302,_0x1a3fe9,_0x1e13a){const _0x12ef11=_0x268734;let _0x571b60;const _0x2bc4e7=[],_0x423b37=[];_0x5cd2d6[_0x12ef11(0x1dc)][_0x12ef11(0x1b5)](_0x3d72be=>_0x3d72be[_0x12ef11(0x19a)]===_0x12ef11(0x1e5))[_0x12ef11(0x1d6)](_0x2170ff=>{const _0x53b728=_0x12ef11,_0x4d4ecf=MiscUtil[_0x53b728(0x1b6)](_0x2170ff,_0x53b728(0x1bb),_0x53b728(0x1bb));if(!_0x4d4ecf)return;const _0x250482=MiscUtil[_0x53b728(0x1b6)](_0x4d4ecf,_0x53b728(0x1a1));switch(_0x250482){case _0x53b728(0x1c9):case'martialM':{_0x2bc4e7[_0x53b728(0x1ee)](_0x2170ff);if(MiscUtil['get'](_0x4d4ecf,_0x53b728(0x1d4),'thr'))_0x423b37[_0x53b728(0x1ee)](_0x2170ff);return;}case _0x53b728(0x1b4):case _0x53b728(0x199):{_0x423b37[_0x53b728(0x1ee)](_0x2170ff);return;}}const _0x3e1f59=MiscUtil[_0x53b728(0x1b6)](_0x4d4ecf,_0x53b728(0x1a7));switch(_0x3e1f59){case _0x53b728(0x1cb):{_0x2bc4e7[_0x53b728(0x1ee)](_0x2170ff);if(MiscUtil['get'](_0x4d4ecf,_0x53b728(0x1d4),_0x53b728(0x192)))_0x423b37[_0x53b728(0x1ee)](_0x2170ff);return;}case _0x53b728(0x1a4):{_0x423b37[_0x53b728(0x1ee)](_0x2170ff);return;}}const _0xb5872b=(MiscUtil['get'](_0x4d4ecf,_0x53b728(0x1a0),_0x53b728(0x1c2))||'')[_0x53b728(0x1b7)](/[^a-zA-Z0-9:.,()]/g,'')[_0x53b728(0x1b7)](/\s+/g,'\x20')['trim']();if(/melee or ranged weapon attack:/i['test'](_0xb5872b))_0x2bc4e7[_0x53b728(0x1ee)](_0x2170ff),_0x423b37[_0x53b728(0x1ee)](_0x2170ff);else{if(/melee weapon attack:/i[_0x53b728(0x1bd)](_0xb5872b))_0x2bc4e7[_0x53b728(0x1ee)](_0x2170ff);else/ranged weapon attack:/i[_0x53b728(0x1bd)](_0xb5872b)&&_0x423b37[_0x53b728(0x1ee)](_0x2170ff);}});const _0x5719be=_0x5a2302===_0x12ef11(0x18e)?_0x2bc4e7:_0x423b37;_0x571b60=_0x5719be[_0x12ef11(0x1f3)](_0x299484=>{const _0x3b0c87=_0x12ef11,_0x26e325=MiscUtil[_0x3b0c87(0x1b6)](_0x299484,_0x3b0c87(0x1bb),_0x3b0c87(0x1bb),_0x3b0c87(0x1ce),_0x3b0c87(0x1e7));if(!_0x26e325)return null;const _0xc6c7fe=_0x26e325['map'](_0x39f449=>{const _0x3e6047=_0x3b0c87;try{const _0x5f444d=_0x39f449[0x0][_0x3e6047(0x1b7)](/@mod/gi,()=>{const _0x18d44d=_0x3e6047,_0x358957=Charactermancer_Util[_0x18d44d(0x1d2)](_0x5cd2d6),_0x4d1a19=MiscUtil[_0x18d44d(0x1b6)](_0x299484,_0x18d44d(0x1bb),_0x18d44d(0x1bb),_0x18d44d(0x1c8))||Charactermancer_Util['getAttackAbilityScore'](_0x299484,_0x358957,_0x5a2302===_0x18d44d(0x18e)?_0x18d44d(0x18e):'ranged'),_0x4e108e=_0x358957?.[_0x4d1a19]||0xa;return Parser[_0x18d44d(0x19d)](_0x4e108e);}),_0x3324be=Renderer[_0x3e6047(0x1e2)]['lang']['getTree3']('avg('+_0x5f444d+')');return{'type':_0x39f449[0x1],'meanDamage':_0x3324be[_0x3e6047(0x1da)][_0x3e6047(0x19e)]({})};}catch(_0x47bd7b){return console[_0x3e6047(0x1dd)](...LGT,_0x3e6047(0x1aa)+_0x39f449[0x0]+'\x22',_0x47bd7b),null;}})[_0x3b0c87(0x1b5)](Boolean);if(!_0xc6c7fe[_0x3b0c87(0x1e9)])return null;const _0xa4f6c6={};_0xc6c7fe['forEach'](_0x228962=>_0xa4f6c6[_0x228962[_0x3b0c87(0x19a)]]=Math[_0x3b0c87(0x1ef)](_0x228962[_0x3b0c87(0x1c5)],_0xa4f6c6[_0x228962[_0x3b0c87(0x19a)]]||0x0));const _0x2f63a9=Object[_0x3b0c87(0x1cf)](_0xa4f6c6)[_0x3b0c87(0x188)]((_0x3ce764,_0x51c78b)=>_0x3ce764+_0x51c78b,0x0);return{'item':_0x299484,'meanDamage':_0x2f63a9};})[_0x12ef11(0x1b5)](Boolean)[_0x12ef11(0x1a8)]((_0x504958,_0x139b7f)=>SortUtil[_0x12ef11(0x1cd)](_0x139b7f[_0x12ef11(0x1c5)],_0x504958[_0x12ef11(0x1c5)]))[_0x12ef11(0x1f3)](_0x2702c2=>_0x2702c2[_0x12ef11(0x189)])[_0x12ef11(0x1b8)](Boolean);if(!_0x571b60&&_0x5719be[0x0])_0x571b60=_0x5719be[0x0];else{if(!_0x571b60&&!_0x5719be[0x0])return;}_0x1e13a[_0x12ef11(0x1ee)]({'item':_0x571b60,'count':_0x1a3fe9});}static['_getActionByLowerName'](_0x448dac,_0x3277b2){const _0x558c38=_0x268734;let _0x4c6a86=_0x448dac[_0x558c38(0x1dc)][_0x558c38(0x1b8)](_0x5f2061=>Util['getWithoutParens'](_0x5f2061[_0x558c38(0x1b1)])[_0x558c38(0x18c)]()===_0x3277b2);if(!_0x4c6a86&&_0x3277b2[_0x558c38(0x1d7)]('s')){const _0x5e4475=_0x3277b2[_0x558c38(0x1b0)](0x0,-0x1);_0x4c6a86=_0x448dac[_0x558c38(0x1dc)][_0x558c38(0x1b8)](_0x3448c3=>Util['getWithoutParens'](_0x3448c3[_0x558c38(0x1b1)])[_0x558c38(0x18c)]()===_0x5e4475);}return _0x4c6a86;}}ActorMultiattack[_0x268734(0x1f5)]=_0x268734(0x1ea);export{ActorMultiattack};