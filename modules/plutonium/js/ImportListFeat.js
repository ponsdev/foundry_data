const _0x57ae=['DataSourceUrl','source','_actor','_pImportEntry_pFillSkills','absorbFnBindListeners','skills','map','SOURCE_TYP_CUSTOM','update','elvenAccuracy','883298TLeXSo','DataSourceFile','link','1443591aaEvAz','dnd5e','name','constructor','addPlugin','pFillActorAbilityData','_pImportEntry_pImportToActor_fillFlags','traits','Select','pHasFeatSideLoadedEffects','isCharactermancer','PG_FEATS','_pImportEntry_pFillAbilities','chosenAbilityScoreIncrease','_foundryChosenAbilityScoreIncrease','entries','Feats','languageProficiencies','ImportEntryOpts','Name','render','_pImportEntry_pImportToDirectoryGeneric','feat','length','Select\x20Feat','780221AggXmB','Item','pFillActorArmorProfData','TASK_EXIT_COMPLETE','_isRadio','ability','keys','sheet','\x22\x20(from\x20\x22','193933hqyKnT','SRD','617379EBUbeu','isStreamerMode','Import\x20Feats','mix','push','_pImportEntry_pHandleAdditionalSpells','pApplyFormDataToActor','Source','UserChoose','_titleSearch','_isPreviewable','SOURCE_TYP_OFFICIAL_ALL','bind','flags','getTotalClassLevels','_initCreateSheetItemHook','836885bgnGEN','absorbFnGetData','absorbFnBindListenersRadio','observantFeat','Importing\x20feat\x20\x22','_slAbility','Prerequisite','ascSort','skillProficiencies','isCancelled','pGetFeatItemEffects','_pImportEntry_pImportToDirectoryGeneric_pGetImportableData','isToken','178263ZfZCOw','pFillActorWeaponProfData','pAddActorItems','sourceJsonToAbv','_activateListeners_absorbListItems','1cpyJdb','sourceClassName','Elven\x20Accuracy','feats','Upload\x20File','TASK_EXIT_CANCELLED','removePlugin','prerequisite','sourceJsonToColor','get','pGetHomebrewSources','1UjInpO','log','armorProficiencies','SOURCE_TYP_BREW','isTemp','items','getImportedEmbed','sourceJsonToFull','weaponProficiencies','pImportEntry','data','_pImportEntry_pFillItems','toolProficiencies','_pImportEntry_pFillTraits','CHAR_MAX_LEVEL','sort','pGetFeatItem','doHookSpellLinkRender','5etools','pGetSources','_pImportEntry_pImportToActor','initiativeAlert','weaponProf','_titleButtonRun','_list'];const _0x4385=function(_0x5ad26b,_0x36a59f){_0x5ad26b=_0x5ad26b-0x164;let _0x57ae7f=_0x57ae[_0x5ad26b];return _0x57ae7f;};const _0x16b1ed=_0x4385;(function(_0x48a24a,_0x235a82){const _0x7f98c9=_0x4385;while(!![]){try{const _0x137424=-parseInt(_0x7f98c9(0x1ac))+-parseInt(_0x7f98c9(0x1a1))+-parseInt(_0x7f98c9(0x1bc))+-parseInt(_0x7f98c9(0x1d9))*-parseInt(_0x7f98c9(0x1aa))+parseInt(_0x7f98c9(0x1c9))+parseInt(_0x7f98c9(0x185))+parseInt(_0x7f98c9(0x1ce))*parseInt(_0x7f98c9(0x188));if(_0x137424===_0x235a82)break;else _0x48a24a['push'](_0x48a24a['shift']());}catch(_0x5e5783){_0x48a24a['push'](_0x48a24a['shift']());}}}(_0x57ae,0x716d8));import{MixinUserChooseImporter}from'./ImportList.js';import{Vetools}from'./Vetools.js';import{LGT}from'./Util.js';import{DataConverterFeat}from'./DataConverterFeat.js';import{Config}from'./Config.js';import{UtilList2}from'./UtilList2.js';import{UtilApplications}from'./UtilApplications.js';import{UtilActors}from'./UtilActors.js';import{DataConverterSpell}from'./DataConverterSpell.js';import{Charactermancer_AbilityScoreSelect}from'./UtilCharactermancer.js';import{Charactermancer_AdditionalSpellsSelect}from'./UtilCharactermancerAdditionalSpells.js';import{Consts}from'./Consts.js';import{UtilDataSource}from'./UtilDataSource.js';import{DataConverter}from'./DataConverter.js';import{ImportListCharacter}from'./ImportListCharacter.js';class ImportListFeat extends ImportListCharacter{static['init'](){const _0x3ab046=_0x4385;this[_0x3ab046(0x1bb)]({'prop':_0x3ab046(0x19e),'importerName':'Feat'});}constructor(_0x729924,_0x50f2b7,_0x5cfe22){const _0x4d6083=_0x4385;_0x50f2b7=_0x50f2b7||{},_0x5cfe22=_0x5cfe22||{},super({'title':_0x4d6083(0x1ae),..._0x50f2b7},_0x729924,{'props':[_0x4d6083(0x19e)],'titleSearch':_0x4d6083(0x1d1),'sidebarTab':_0x4d6083(0x167),'gameProp':_0x4d6083(0x167),'defaultFolderPath':[_0x4d6083(0x198)],'folderType':_0x4d6083(0x1a2),'pageFilter':new PageFilterFeats(),'page':UrlUtil[_0x4d6083(0x193)],'isPreviewable':!![],'isDedupable':!![],..._0x5cfe22});}async[_0x16b1ed(0x175)](){const _0x353be2=_0x16b1ed;return[new UtilDataSource[(_0x353be2(0x17b))](Config['get']('ui',_0x353be2(0x1ad))?_0x353be2(0x1ab):_0x353be2(0x174),Vetools['DATA_URL_FEATS'],{'filterTypes':[UtilDataSource[_0x353be2(0x1b7)]],'isDefault':!![]}),new UtilDataSource[(_0x353be2(0x17b))]('Custom\x20URL','',{'filterTypes':[UtilDataSource['SOURCE_TYP_CUSTOM']]}),new UtilDataSource[(_0x353be2(0x186))](_0x353be2(0x1d2),{'filterTypes':[UtilDataSource[_0x353be2(0x182)]]}),...(await Vetools[_0x353be2(0x1d8)](_0x353be2(0x19e)))[_0x353be2(0x181)](({name:_0x4797e4,url:_0x101caf})=>new UtilDataSource['DataSourceUrl'](_0x4797e4,_0x101caf,{'filterTypes':[UtilDataSource[_0x353be2(0x165)]]}))];}['getData'](){const _0x2b7adf=_0x16b1ed;return{'isRadio':this[_0x2b7adf(0x1a5)],'isPreviewable':this[_0x2b7adf(0x1b6)],'titleButtonRun':this[_0x2b7adf(0x179)],'titleSearch':this[_0x2b7adf(0x1b5)],'cols':[{'name':_0x2b7adf(0x19b),'width':0x4,'field':_0x2b7adf(0x18a)},{'name':'Ability','width':0x3,'field':'ability'},{'name':_0x2b7adf(0x1c2),'width':0x3,'field':_0x2b7adf(0x1d5)},{'name':_0x2b7adf(0x1b3),'width':0x1,'field':_0x2b7adf(0x17c),'titleProp':'sourceLong','displayProp':'sourceShort','classNameProp':_0x2b7adf(0x1cf),'rowClassName':'text-center'}],'rows':this['_content'][_0x2b7adf(0x181)]((_0x2e532b,_0x2070ce)=>{const _0x4e1a5d=_0x2b7adf;return this['_pageFilter'][_0x4e1a5d(0x18b)]['mutateForFilters'](_0x2e532b),{'name':_0x2e532b[_0x4e1a5d(0x18a)],'ability':_0x2e532b['_slAbility'],'prerequisite':_0x2e532b['_slPrereq'],'source':_0x2e532b[_0x4e1a5d(0x17c)],'sourceShort':Parser[_0x4e1a5d(0x1cc)](_0x2e532b[_0x4e1a5d(0x17c)]),'sourceLong':Parser[_0x4e1a5d(0x169)](_0x2e532b[_0x4e1a5d(0x17c)]),'sourceClassName':Parser[_0x4e1a5d(0x1d6)](_0x2e532b[_0x4e1a5d(0x17c)]),'ix':_0x2070ce};})};}[_0x16b1ed(0x1cd)](){const _0x195ed1=_0x16b1ed;this['_list']['doAbsorbItems'](this['_content'],{'fnGetName':_0xea84d6=>_0xea84d6[_0x195ed1(0x18a)],'fnGetValues':_0x36251f=>({'source':_0x36251f[_0x195ed1(0x17c)],'ability':_0x36251f[_0x195ed1(0x1c1)],'prerequisite':_0x36251f['_slPrereq'],'hash':UrlUtil['URL_TO_HASH_BUILDER'][this['_page']](_0x36251f)}),'fnGetData':UtilList2[_0x195ed1(0x1bd)],'fnBindListeners':_0x5b549e=>this[_0x195ed1(0x1a5)]?UtilList2[_0x195ed1(0x1be)](this[_0x195ed1(0x17a)],_0x5b549e):UtilList2[_0x195ed1(0x17f)](this['_list'],_0x5b549e)});}async[_0x16b1ed(0x16b)](_0x51901a,_0x46269a){const _0x54b3d6=_0x16b1ed;_0x46269a=_0x46269a||{},console[_0x54b3d6(0x1da)](...LGT,_0x54b3d6(0x1c0)+_0x51901a[_0x54b3d6(0x18a)]+_0x54b3d6(0x1a9)+Parser[_0x54b3d6(0x1cc)](_0x51901a['source'])+'\x22)');if(_0x46269a['isDataOnly'])return{'imported':DataConverterFeat[_0x54b3d6(0x172)](_0x51901a),'status':UtilApplications['TASK_EXIT_COMPLETE_DATA_ONLY']};if(_0x46269a[_0x54b3d6(0x166)])return this[_0x54b3d6(0x19d)](_0x51901a,_0x46269a);else{if(this[_0x54b3d6(0x17d)])return this[_0x54b3d6(0x176)](_0x51901a,_0x46269a);else return this[_0x54b3d6(0x19d)](_0x51901a,_0x46269a);}}async[_0x16b1ed(0x176)](_0x39fce5,_0x44774c){const _0x14a54f=_0x16b1ed,_0x18441a={'data':{}},_0x523d85=new ImportListFeat[(_0x14a54f(0x19a))]({'chosenAbilityScoreIncrease':_0x39fce5[_0x14a54f(0x196)],'isCharactermancer':!!_0x44774c[_0x14a54f(0x192)]});await this[_0x14a54f(0x18e)](_0x39fce5,_0x18441a,_0x44774c),await this[_0x14a54f(0x194)](_0x39fce5,_0x18441a,_0x523d85);if(_0x523d85[_0x14a54f(0x1c5)])return{'status':UtilApplications[_0x14a54f(0x1d3)]};await this[_0x14a54f(0x17e)](_0x39fce5,_0x18441a[_0x14a54f(0x16c)],_0x523d85);if(_0x523d85[_0x14a54f(0x1c5)])return{'status':UtilApplications[_0x14a54f(0x1d3)]};await this[_0x14a54f(0x16f)](_0x39fce5,_0x18441a['data'],_0x523d85);if(_0x523d85['isCancelled'])return{'status':UtilApplications[_0x14a54f(0x1d3)]};await this[_0x14a54f(0x16d)](_0x39fce5,_0x18441a,_0x523d85);if(_0x523d85[_0x14a54f(0x1c5)])return{'status':UtilApplications['TASK_EXIT_CANCELLED']};if(Object[_0x14a54f(0x1a7)](_0x18441a[_0x14a54f(0x16c)])[_0x14a54f(0x19f)])await this['_actor'][_0x14a54f(0x183)](_0x18441a);if(this[_0x14a54f(0x17d)][_0x14a54f(0x1c8)])this[_0x14a54f(0x17d)][_0x14a54f(0x1a8)][_0x14a54f(0x19c)]();return{'imported':{'name':_0x39fce5['name'],'actor':this[_0x14a54f(0x17d)]},'status':UtilApplications[_0x14a54f(0x1a4)]};}['_pImportEntry_pImportToActor_fillFlags'](_0x39be32,_0x5f0e36,_0x465185){const _0xf4c8d0=_0x16b1ed,_0x561a0a={},_0x43e2e7={};if(_0x39be32[_0xf4c8d0(0x18a)]==='Observant'&&_0x39be32[_0xf4c8d0(0x17c)]===SRC_PHB)_0x43e2e7[_0xf4c8d0(0x1bf)]=!![];if(_0x39be32[_0xf4c8d0(0x18a)]==='Alert'&&_0x39be32[_0xf4c8d0(0x17c)]===SRC_PHB)_0x43e2e7[_0xf4c8d0(0x177)]=!![];if(_0x39be32[_0xf4c8d0(0x18a)]===_0xf4c8d0(0x1d0)&&_0x39be32['source']===SRC_XGE)_0x43e2e7[_0xf4c8d0(0x184)]=!![];if(Object[_0xf4c8d0(0x1a7)](_0x43e2e7)[_0xf4c8d0(0x19f)])_0x561a0a[_0xf4c8d0(0x189)]=_0x43e2e7;if(Object[_0xf4c8d0(0x1a7)](_0x561a0a)[_0xf4c8d0(0x19f)])_0x5f0e36[_0xf4c8d0(0x1b9)]=_0x561a0a;}async[_0x16b1ed(0x194)](_0x558729,_0x4bf74a,_0x869b6){const _0x411ce9=_0x16b1ed,_0x13eff9=await Charactermancer_AbilityScoreSelect[_0x411ce9(0x18d)](this[_0x411ce9(0x17d)],_0x558729[_0x411ce9(0x1a6)],_0x4bf74a,_0x869b6);if(_0x869b6[_0x411ce9(0x1c5)])return;if(_0x13eff9==null)return;_0x869b6[_0x411ce9(0x195)]=_0x13eff9[_0x411ce9(0x16c)];}async[_0x16b1ed(0x17e)](_0x22f6da,_0x33bac3,_0x3a67a9){const _0x1a637b=_0x16b1ed;await DataConverter['pFillActorSkillData'](MiscUtil[_0x1a637b(0x1d7)](this[_0x1a637b(0x17d)],'data',_0x1a637b(0x16c),_0x1a637b(0x180)),_0x22f6da[_0x1a637b(0x1c4)],_0x33bac3,_0x3a67a9);}async[_0x16b1ed(0x16f)](_0x38d1f2,_0x47bccd,_0x3d5797){const _0x5595b4=_0x16b1ed;_0x47bccd['traits']={},await DataConverter['pFillActorLanguageData'](MiscUtil[_0x5595b4(0x1d7)](this[_0x5595b4(0x17d)],'data',_0x5595b4(0x16c),'traits','languages'),_0x38d1f2[_0x5595b4(0x199)],_0x47bccd,_0x3d5797);if(_0x3d5797['isCancelled'])return;await DataConverter['pFillActorToolProfData'](MiscUtil[_0x5595b4(0x1d7)](this['_actor'],_0x5595b4(0x16c),'data',_0x5595b4(0x18f),'toolProf'),_0x38d1f2[_0x5595b4(0x16e)],_0x47bccd,_0x3d5797);if(_0x3d5797[_0x5595b4(0x1c5)])return;await DataConverter[_0x5595b4(0x1a3)](MiscUtil[_0x5595b4(0x1d7)](this[_0x5595b4(0x17d)],_0x5595b4(0x16c),_0x5595b4(0x16c),_0x5595b4(0x18f),'armorProf'),_0x38d1f2[_0x5595b4(0x164)],_0x47bccd,_0x3d5797);if(_0x3d5797['isCancelled'])return;await DataConverter[_0x5595b4(0x1ca)](MiscUtil[_0x5595b4(0x1d7)](this[_0x5595b4(0x17d)],'data',_0x5595b4(0x16c),_0x5595b4(0x18f),_0x5595b4(0x178)),_0x38d1f2[_0x5595b4(0x16a)],_0x47bccd,_0x3d5797);}async[_0x16b1ed(0x16d)](_0x262fd5,_0x202a3c,_0x58d19a){const _0x36c301=_0x16b1ed,_0x54c82a={};await this[_0x36c301(0x1b1)](_0x262fd5,_0x202a3c,_0x58d19a,_0x54c82a);if(_0x58d19a[_0x36c301(0x1c5)])return;const _0x4aa9a8=DataConverterSpell[_0x36c301(0x173)][_0x36c301(0x1b8)](null,this[_0x36c301(0x17d)]['id'],_0x54c82a);Renderer[_0x36c301(0x1d7)]()[_0x36c301(0x18c)](_0x36c301(0x187),'*',_0x4aa9a8);const _0x4e61bc=await DataConverterFeat['pGetFeatItem'](_0x262fd5);_0x58d19a[_0x36c301(0x167)][_0x36c301(0x1b0)](_0x4e61bc),Renderer[_0x36c301(0x1d7)]()[_0x36c301(0x1d4)]('link','*',_0x4aa9a8);const _0x309a9a=await UtilActors[_0x36c301(0x1cb)](this[_0x36c301(0x17d)],_0x58d19a[_0x36c301(0x167)]),_0x117c86=[];if(await DataConverterFeat[_0x36c301(0x191)](this[_0x36c301(0x17d)],_0x262fd5)){const _0x1c3fc0=DataConverter[_0x36c301(0x168)](_0x309a9a,_0x4e61bc);if(_0x1c3fc0)_0x117c86[_0x36c301(0x1b0)](...await DataConverterFeat[_0x36c301(0x1c6)](this[_0x36c301(0x17d)],_0x262fd5,_0x1c3fc0['entity'],{'import':{'chosenAbilityScoreIncrease':_0x58d19a[_0x36c301(0x195)]}}));}await UtilActors['pAddActorEffects'](this[_0x36c301(0x17d)],_0x117c86);}async[_0x16b1ed(0x1b1)](_0x450b0e,_0x3771a9,_0x15ba4b,_0x4c8af9){const _0x4756df=_0x16b1ed,_0x22abd6=Object[_0x4756df(0x197)](_0x15ba4b['chosenAbilityScoreIncrease']||{})[_0x4756df(0x171)](([,_0x36a30e],[,_0x5a3b6d])=>SortUtil[_0x4756df(0x1c3)](_0x5a3b6d,_0x36a30e)),_0x212d67=_0x22abd6?.[0x0]?.[0x0]||null,_0x51f657=await Charactermancer_AdditionalSpellsSelect['pGetUserInput']({'additionalSpells':_0x450b0e['additionalSpells'],'sourceHintText':_0x450b0e[_0x4756df(0x18a)],'curLevel':0x0,'targetLevel':Consts[_0x4756df(0x170)],'spellLevelLow':0x0,'spellLevelHigh':0x9});if(_0x51f657==null)return _0x15ba4b[_0x4756df(0x1c5)]=!![];if(_0x51f657===VeCt['SYM_UI_SKIP'])return;const _0x54e651=UtilActors[_0x4756df(0x1ba)](this[_0x4756df(0x17d)]);await Charactermancer_AdditionalSpellsSelect[_0x4756df(0x1b2)](this['_actor'],_0x51f657,{'casterLevel':_0x54e651,'parentAbilityAbv':_0x212d67,'hashToIdMap':_0x4c8af9});}[_0x16b1ed(0x1c7)](_0x3547a5,_0x63e76c){const _0x126343=_0x16b1ed;return DataConverterFeat[_0x126343(0x172)](_0x3547a5,_0x63e76c);}}ImportListFeat[_0x16b1ed(0x19a)]=class extends ImportListCharacter[_0x16b1ed(0x19a)]{constructor(_0xbdcf2){const _0x2d82c8=_0x16b1ed;_0xbdcf2=_0xbdcf2||{},super(_0xbdcf2),this[_0x2d82c8(0x195)]=_0xbdcf2[_0x2d82c8(0x195)];}},ImportListFeat[_0x16b1ed(0x1b4)]=class extends MiscUtil[_0x16b1ed(0x1af)](ImportListFeat)['with'](MixinUserChooseImporter){constructor(_0x2cb267){const _0x3edba9=_0x16b1ed;super(_0x2cb267,{'title':_0x3edba9(0x1a0)},{'titleButtonRun':_0x3edba9(0x190)});}};export{ImportListFeat};