const _0x286c=['toolProf','DataSourceUrl','languageProficiencies','sheet','sourceShort','push','_list','pFillActorSkillData','absorbFnBindListeners','_page','_pImportEntry_pFillProficiencies','get','\x22\x20(from\x20\x22','428814lkJdwO','LANG_TOOL_PROFS_CUSTOMIZE','_pImportEntry_pImportToActor_pImportStartingEquipment','sourceClassName','</div>','render','_foundryIsSkipImportCharacteristics','_skillDisplay','isCustomize','TASK_EXIT_CANCELLED','_normalisedRange','init','update','_pageFilter','_foundryFormDataCharacteristics','_foundryIsSkipCustomizeSkills','sourceLong','SYM_UI_SKIP','_isPreviewable','pAddActorItems','isStreamerMode','pGetUserBoolean','constructor','applyFormDataToActorUpdate','currency','pInit','_content','page','_pImportEntry_pFillItems','_titleButtonRun','isToken','55sRtZvB','sourceJsonToColor','pGetSources','<div\x20class=\x22w-640p\x22>','SOURCE_TYP_CUSTOM','ImportEntryOpts','length','Use\x20Default','Name','17709MvBJcE','toolProficiencies','7586QtHnIa','DataSourceFile','Backgrounds','_modalFilterBackgrounds','1SWvOdJ','sourceJsonToAbv','5etools','_foundryFormDataFeatures','backgrounds','pFillActorCharacteristicsData','_actor','SOURCE_TYP_BREW','Upload\x20File','Custom\x20URL','Customize','name','items','isCancelled','data','_pImportEntry_pImportToActor','_pImportEntry_pFillDetails','traits','_activateListeners_absorbListItems','11689djaCYt','URL_TO_HASH_BUILDER','_titleSearch','1zEuIpk','Import\x20Backgrounds','background','pFillActorLanguageData','doAbsorbItems','entries','pPreloadHidden','source','startingEquipment','1VOBoXl','PG_BACKGROUNDS','Item','413846Mlrjyw','isRadio','158449axPwRw','_pImportEntry_pImportToDirectoryGeneric','log','1uIPloa','412051SzFzpY','5dpacJD','SRD','map','text-center','_foundryIsSkipCustomizeLanguagesTools','set','Importing\x20background\x20\x22','mutateForFilters','ImportListBackground.customFeatures','pGetHomebrewSources','pWaitForUserInput','pFillActorLanguageOrToolData','pGetUserInput','absorbFnBindListenersRadio','skills','pImportEquipmentItemEntries','skillProficiencies'];const _0x266d=function(_0x432460,_0x281740){_0x432460=_0x432460-0x10e;let _0x286c43=_0x286c[_0x432460];return _0x286c43;};const _0xa76f6=_0x266d;(function(_0x47dc80,_0x3d9071){const _0x28ed5b=_0x266d;while(!![]){try{const _0xc329d4=-parseInt(_0x28ed5b(0x11e))*parseInt(_0x28ed5b(0x113))+parseInt(_0x28ed5b(0x144))*parseInt(_0x28ed5b(0x149))+-parseInt(_0x28ed5b(0x14a))+parseInt(_0x28ed5b(0x141))*-parseInt(_0x28ed5b(0x135))+parseInt(_0x28ed5b(0x169))*parseInt(_0x28ed5b(0x122))+-parseInt(_0x28ed5b(0x11c))*-parseInt(_0x28ed5b(0x14b))+parseInt(_0x28ed5b(0x146))*parseInt(_0x28ed5b(0x138));if(_0xc329d4===_0x3d9071)break;else _0x47dc80['push'](_0x47dc80['shift']());}catch(_0x47df5a){_0x47dc80['push'](_0x47dc80['shift']());}}}(_0x286c,0x3cb6c));import{Vetools}from'./Vetools.js';import{LGT}from'./Util.js';import{UtilActors}from'./UtilActors.js';import{DataConverter}from'./DataConverter.js';import{Config}from'./Config.js';import{UtilList2}from'./UtilList2.js';import{UtilApplications}from'./UtilApplications.js';import{ImportListCharacter}from'./ImportListCharacter.js';import{DataConverterBackground}from'./DataConverterBackground.js';import{Charactermancer_StartingEquipment}from'./UtilCharactermancerEquipment.js';import{Charactermancer_Background_Characteristics,Charactermancer_Background_Features}from'./UtilCharactermancerBackground.js';import{UtilDataSource}from'./UtilDataSource.js';import{ModalFilterBackgroundsFvtt}from'./UtilModalFilter.js';class ImportListBackground extends ImportListCharacter{static[_0xa76f6(0x174)](){const _0x5cd64d=_0xa76f6;this['_initCreateSheetItemHook']({'prop':_0x5cd64d(0x13a),'importerName':'Background'});}constructor(_0x3e4d7b){const _0x1c4ba1=_0xa76f6;_0x3e4d7b=_0x3e4d7b||{},super({'title':_0x1c4ba1(0x139)},_0x3e4d7b,{'props':[_0x1c4ba1(0x13a)],'titleSearch':_0x1c4ba1(0x126),'sidebarTab':_0x1c4ba1(0x12e),'gameProp':_0x1c4ba1(0x12e),'defaultFolderPath':[_0x1c4ba1(0x120)],'folderType':_0x1c4ba1(0x143),'pageFilter':new PageFilterBackgrounds(),'isActorRadio':!![],'page':UrlUtil[_0x1c4ba1(0x142)],'isPreviewable':!![],'isDedupable':!![]}),this[_0x1c4ba1(0x121)]=null;}async[_0xa76f6(0x115)](){const _0x1d3be0=_0xa76f6;return[new UtilDataSource[(_0x1d3be0(0x15d))](Config['get']('ui',_0x1d3be0(0x17d))?_0x1d3be0(0x14c):_0x1d3be0(0x124),Vetools['DATA_URL_BACKGROUNDS'],{'filterTypes':[UtilDataSource['SOURCE_TYP_OFFICIAL_ALL']],'isDefault':!![]}),new UtilDataSource[(_0x1d3be0(0x15d))](_0x1d3be0(0x12b),'',{'filterTypes':[UtilDataSource[_0x1d3be0(0x117)]]}),new UtilDataSource[(_0x1d3be0(0x11f))](_0x1d3be0(0x12a),{'filterTypes':[UtilDataSource[_0x1d3be0(0x117)]]}),...(await Vetools[_0x1d3be0(0x154)](_0x1d3be0(0x13a)))[_0x1d3be0(0x14d)](({name:_0x3721df,url:_0x3740e1})=>new UtilDataSource['DataSourceUrl'](_0x3721df,_0x3740e1,{'filterTypes':[UtilDataSource[_0x1d3be0(0x129)]]}))];}['getData'](){const _0x106ef0=_0xa76f6,_0x4a794e={'isPreviewable':this[_0x106ef0(0x17b)],'titleButtonRun':this[_0x106ef0(0x111)],'titleSearch':this[_0x106ef0(0x137)],'cols':[{'name':_0x106ef0(0x11b),'width':0x4,'field':_0x106ef0(0x12d)},{'name':'Skills','width':0x6,'field':'skills'},{'name':'Source','width':0x1,'field':'source','titleProp':_0x106ef0(0x179),'displayProp':_0x106ef0(0x160),'classNameProp':_0x106ef0(0x16c),'rowClassName':_0x106ef0(0x14e)}],'rows':this[_0x106ef0(0x10e)][_0x106ef0(0x14d)]((_0x34e3e6,_0x3a683b)=>{const _0x31f306=_0x106ef0;return this[_0x31f306(0x176)][_0x31f306(0x17f)][_0x31f306(0x152)](_0x34e3e6),{'name':_0x34e3e6[_0x31f306(0x12d)],'skills':_0x34e3e6[_0x31f306(0x170)],'source':_0x34e3e6[_0x31f306(0x13f)],'sourceShort':Parser[_0x31f306(0x123)](_0x34e3e6['source']),'sourceLong':Parser['sourceJsonToFull'](_0x34e3e6[_0x31f306(0x13f)]),'sourceClassName':Parser[_0x31f306(0x114)](_0x34e3e6['source']),'ix':_0x3a683b};})};return this['_actor']&&(_0x4a794e[_0x106ef0(0x145)]=!![]),_0x4a794e;}[_0xa76f6(0x134)](){const _0x58ebe9=_0xa76f6;this[_0x58ebe9(0x162)][_0x58ebe9(0x13c)](this['_content'],{'fnGetName':_0x539c2c=>_0x539c2c[_0x58ebe9(0x12d)],'fnGetValues':_0x126a62=>({'source':_0x126a62[_0x58ebe9(0x13f)],'skills':_0x126a62[_0x58ebe9(0x170)],'normalisedTime':_0x126a62['_normalisedTime'],'normalisedRange':_0x126a62[_0x58ebe9(0x173)],'hash':UrlUtil[_0x58ebe9(0x136)][this[_0x58ebe9(0x165)]](_0x126a62)}),'fnGetData':UtilList2['absorbFnGetData'],'fnBindListeners':_0x4a4b42=>this[_0x58ebe9(0x128)]?UtilList2[_0x58ebe9(0x158)](this[_0x58ebe9(0x162)],_0x4a4b42):UtilList2[_0x58ebe9(0x164)](this[_0x58ebe9(0x162)],_0x4a4b42)});}async[_0xa76f6(0x182)](){const _0x4f0597=_0xa76f6;await super[_0x4f0597(0x182)](),this[_0x4f0597(0x121)]=new ModalFilterBackgroundsFvtt({'namespace':_0x4f0597(0x153),'isRadio':!![],'allData':this[_0x4f0597(0x10e)]}),await this['_modalFilterBackgrounds'][_0x4f0597(0x13e)]();}async['pImportEntry'](_0x2c522d,_0x4c9d59){const _0x37f617=_0xa76f6;_0x4c9d59=_0x4c9d59||{},console[_0x37f617(0x148)](...LGT,_0x37f617(0x151)+_0x2c522d[_0x37f617(0x12d)]+_0x37f617(0x168)+Parser[_0x37f617(0x123)](_0x2c522d[_0x37f617(0x13f)])+'\x22)');if(_0x4c9d59['isTemp'])return this[_0x37f617(0x147)](_0x2c522d,_0x4c9d59);else{if(this[_0x37f617(0x128)])return this[_0x37f617(0x131)](_0x2c522d,_0x4c9d59);else return this[_0x37f617(0x147)](_0x2c522d,_0x4c9d59);}}async[_0xa76f6(0x131)](_0x4d6067,_0x468ee7){const _0x388beb=_0xa76f6,_0x11b648={'data':{'details':{'background':_0x4d6067['name']}}},_0x26f95c=new ImportListBackground[(_0x388beb(0x118))]();await this[_0x388beb(0x166)](_0x4d6067,_0x11b648[_0x388beb(0x130)],_0x26f95c);if(_0x26f95c[_0x388beb(0x12f)])return{'status':UtilApplications[_0x388beb(0x172)]};await this[_0x388beb(0x132)](_0x4d6067,_0x11b648,_0x26f95c);if(_0x26f95c[_0x388beb(0x12f)])return{'status':UtilApplications[_0x388beb(0x172)]};await this[_0x388beb(0x110)](_0x4d6067,_0x11b648,_0x26f95c);const _0x36ab5c=await this[_0x388beb(0x16b)](_0x4d6067,_0x26f95c);if(_0x26f95c['isCancelled'])return{'status':UtilApplications['TASK_EXIT_CANCELLED']};if(_0x36ab5c?.[_0x388beb(0x130)]?.[_0x388beb(0x181)])MiscUtil[_0x388beb(0x150)](_0x11b648,_0x388beb(0x130),'currency',_0x36ab5c[_0x388beb(0x130)][_0x388beb(0x181)]);this[_0x388beb(0x128)][_0x388beb(0x175)](_0x11b648),await Charactermancer_StartingEquipment[_0x388beb(0x15a)](this[_0x388beb(0x128)],_0x36ab5c);if(this[_0x388beb(0x128)][_0x388beb(0x112)])this[_0x388beb(0x128)][_0x388beb(0x15f)][_0x388beb(0x16e)]();return{'imported':{'name':_0x4d6067[_0x388beb(0x12d)],'actor':this[_0x388beb(0x128)]},'status':UtilApplications['TASK_EXIT_COMPLETE']};}async[_0xa76f6(0x16b)](_0x42fab4,_0x3b6676){const _0x393019=_0xa76f6;if(!_0x42fab4[_0x393019(0x140)])return;const _0x36d774={'defaultData':_0x42fab4[_0x393019(0x140)]},_0x17205f=new Charactermancer_StartingEquipment({'actor':this[_0x393019(0x128)],'startingEquipment':_0x36d774,'appSubTitle':_0x42fab4[_0x393019(0x12d)],'equiSpecialSource':_0x42fab4[_0x393019(0x13f)],'equiSpecialPage':_0x42fab4[_0x393019(0x10f)]}),_0x5da097=await _0x17205f[_0x393019(0x155)]();if(_0x5da097==null)return _0x3b6676[_0x393019(0x12f)]=!![],null;return _0x5da097;}['_pImportEntry_pImportToDirectoryGeneric_pGetImportableData'](_0x469929,_0xdcd5c1){return DataConverterBackground['getBackgroundItem'](_0x469929,_0xdcd5c1);}async[_0xa76f6(0x166)](_0x414a13,_0x3142c8,_0x4c794b){const _0x910a44=_0xa76f6,_0x29057f=!_0x414a13[_0x910a44(0x178)]&&await InputUiUtil[_0x910a44(0x17e)]({'title':'Customize\x20Background:\x20Skills','htmlDescription':_0x910a44(0x116)+Renderer[_0x910a44(0x167)]()[_0x910a44(0x16e)]('Would\x20you\x20like\x20to\x20{@book\x20customize\x20your\x20skill\x20selection|phb|4|backgrounds|customizing\x20a\x20background}?<br>This\x20allows\x20you\x20to\x20choose\x20any\x20two\x20skills\x20to\x20gain\x20from\x20your\x20background,\x20rather\x20than\x20gaining\x20the\x20defaults.')+_0x910a44(0x16d),'textNo':_0x910a44(0x11a),'textYes':_0x910a44(0x12c)});_0x4c794b[_0x910a44(0x171)]=_0x4c794b['isCustomize']||!!_0x29057f;_0x29057f?await DataConverter[_0x910a44(0x163)](MiscUtil['get'](this[_0x910a44(0x128)],_0x910a44(0x130),_0x910a44(0x130),_0x910a44(0x159)),UtilActors['BG_SKILL_PROFS_CUSTOMIZE'],_0x3142c8,_0x4c794b):await DataConverter['pFillActorSkillData'](MiscUtil[_0x910a44(0x167)](this[_0x910a44(0x128)],_0x910a44(0x130),_0x910a44(0x130),'skills'),_0x414a13[_0x910a44(0x15b)],_0x3142c8,_0x4c794b);if(_0x4c794b[_0x910a44(0x12f)])return;const _0x24e3ce=!_0x414a13[_0x910a44(0x14f)]&&await InputUiUtil[_0x910a44(0x17e)]({'title':'Customize\x20Background:\x20Languages\x20&\x20Tools','htmlDescription':_0x910a44(0x116)+Renderer[_0x910a44(0x167)]()[_0x910a44(0x16e)]('Would\x20you\x20like\x20to\x20{@book\x20customize\x20your\x20language\x20and\x20tool\x20selection|phb|4|backgrounds|customizing\x20a\x20background}?<br>This\x20allows\x20you\x20to\x20choose\x20a\x20total\x20of\x20any\x20two\x20languages\x20and/or\x20tool\x20proficiencies\x20to\x20gain\x20from\x20your\x20background,\x20rather\x20than\x20gaining\x20the\x20defaults.')+_0x910a44(0x16d),'textNo':_0x910a44(0x11a),'textYes':_0x910a44(0x12c)});_0x4c794b['isCustomize']=_0x4c794b[_0x910a44(0x171)]||!!_0x24e3ce;if(_0x24e3ce)await DataConverter[_0x910a44(0x156)](MiscUtil[_0x910a44(0x167)](this[_0x910a44(0x128)],'data',_0x910a44(0x130),'traits','languages'),MiscUtil[_0x910a44(0x167)](this[_0x910a44(0x128)],_0x910a44(0x130),_0x910a44(0x130),'traits',_0x910a44(0x15c)),UtilActors[_0x910a44(0x16a)],_0x3142c8,_0x4c794b);else{await DataConverter[_0x910a44(0x13b)](MiscUtil['get'](this[_0x910a44(0x128)],_0x910a44(0x130),_0x910a44(0x130),_0x910a44(0x133),'languages'),_0x414a13[_0x910a44(0x15e)],_0x3142c8,_0x4c794b);if(_0x4c794b['isCancelled'])return;_0x4c794b['isCancelled']=await DataConverter['pFillActorToolProfData'](MiscUtil['get'](this[_0x910a44(0x128)],'data',_0x910a44(0x130),'traits',_0x910a44(0x15c)),_0x414a13[_0x910a44(0x11d)],_0x3142c8);}}async[_0xa76f6(0x132)](_0xac6f47,_0x3c7ecd,_0x3b08d1){const _0x693978=_0xa76f6;if(_0xac6f47[_0x693978(0x16f)])return;if(_0xac6f47[_0x693978(0x177)])return Charactermancer_Background_Characteristics[_0x693978(0x180)](_0x3c7ecd,_0xac6f47[_0x693978(0x177)]);await Charactermancer_Background_Characteristics[_0x693978(0x127)](_0xac6f47[_0x693978(0x13d)],_0x3c7ecd,_0x3b08d1);}async['_pImportEntry_pFillItems'](_0x13c82b,_0x1e87e9,_0x5178bc){const _0x1304c7=_0xa76f6,_0x4bf767=_0x13c82b[_0x1304c7(0x125)]??await Charactermancer_Background_Features[_0x1304c7(0x157)]({'entries':_0x13c82b[_0x1304c7(0x13d)],'modalFilter':this['_modalFilterBackgrounds']});if(!_0x4bf767)return _0x5178bc['isCancelled']=!![];if(_0x4bf767!==VeCt[_0x1304c7(0x17a)]){_0x5178bc[_0x1304c7(0x171)]=_0x5178bc['isCustomize']||_0x4bf767[_0x1304c7(0x130)]?.[_0x1304c7(0x171)];for(const _0x5ab0fd of _0x4bf767?.[_0x1304c7(0x130)]?.[_0x1304c7(0x13d)]){_0x5178bc['items'][_0x1304c7(0x161)](await DataConverterBackground['pGetBackgroundFeatureItem'](_0x13c82b,_0x5ab0fd,this[_0x1304c7(0x128)],_0x5178bc));}}if(_0x5178bc[_0x1304c7(0x12e)][_0x1304c7(0x119)])await UtilActors[_0x1304c7(0x17c)](this[_0x1304c7(0x128)],_0x5178bc[_0x1304c7(0x12e)]);}}ImportListBackground[_0xa76f6(0x118)]=class extends ImportListCharacter[_0xa76f6(0x118)]{constructor(_0x5a235f){const _0x4ffcc0=_0xa76f6;_0x5a235f=_0x5a235f||{},super(_0x5a235f),this[_0x4ffcc0(0x171)]=![];}};export{ImportListBackground};