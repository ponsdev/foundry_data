const _0x211a=['list-hang-notitle','item','_getPsionicItems_pGetTalentItem','PG_PSIONICS','<div>\x0a\x09\x09\x09\x09\x09\x09\x09','getCleanEntityName','</div>','spell','replace','<br>','push','psionicName','URL_TO_HASH_BUILDER','352657hxRDhc','prepared','data','MODULE_NAME_FAKE','/media/icon/brain.svg','cost','1032519aKyPxJ','setFirstSection','permission','getSourceWithPagePart','<p><i>','ATB_ABV_TO_FULL','length','type','pSerialAwaitMap','toLowerCase','MODULE_NAME','filterValues','<div>','pGetPsionicsSideData','source','feat','map','_pGetDisciplineFocusAdditionalData','focus','isImportDescription','psionic','stringify','filter','min','permissions','level','_getPsionicItems_getSaveFromString','foundryPsionicDisciplineActive','none','int','isAddPermission','foundryPsionic','find','(Only\x20one\x20focus\x20may\x20be\x20active\x20at\x20a\x20time)','_getPsionicItems_pGetDisciplineActiveItems','38017iAIZdT','_getPsionicItems_getDamageTypeFromString','name','\x0a\x09\x09\x09\x09\x09\x09\x09','entries','importPsionic','DMG_TYPES','minute','_PSI_DURATION_MAP','getBodyText','join','getNameWithSourcePart','psi)','\x0a\x09\x09\x09\x09\x09\x09</div>','pGetPsionicItem','isAddDataFlags','psionicDisciplineFocus','modules/','bonus','test','copy','exec','400470lZmCuI','_getPsionicItems_getActionTypeFromString','submodes','_getPsionicFlags','1smdsxx','get','pGetAdditionalData_','_pGetAdditionalData','426759WffqUP','slice','modes','hour','_getPsionicItems_pGetDisciplineFocusItem','render','19ZUvydO','1064684uZVaVJ','1lqmUok','max','foundryPsionicDisciplineFocus','concentration','values','\x20-\x20Focus','psionicSource','evo','_pGetDisciplineActiveAdditionalData','177800FTDCzf'];const _0x471d=function(_0x3268d7,_0x6de5ac){_0x3268d7=_0x3268d7-0x19a;let _0x211a6b=_0x211a[_0x3268d7];return _0x211a6b;};const _0xa26e8c=_0x471d;(function(_0x410d0a,_0x1f5119){const _0x13c734=_0x471d;while(!![]){try{const _0x20a89f=parseInt(_0x13c734(0x1de))+-parseInt(_0x13c734(0x1fc))*parseInt(_0x13c734(0x1d3))+parseInt(_0x13c734(0x1b9))*parseInt(_0x13c734(0x1dd))+parseInt(_0x13c734(0x1e8))+-parseInt(_0x13c734(0x1df))*parseInt(_0x13c734(0x1d7))+parseInt(_0x13c734(0x1cf))+-parseInt(_0x13c734(0x1f6));if(_0x20a89f===_0x1f5119)break;else _0x410d0a['push'](_0x410d0a['shift']());}catch(_0x566c1e){_0x410d0a['push'](_0x410d0a['shift']());}}}(_0x211a,0x8717e));import{UtilApplications}from'./UtilApplications.js';import{SharedConsts}from'../shared/SharedConsts.js';import{Config}from'./Config.js';import{DataConverter}from'./DataConverter.js';import{Vetools}from'./Vetools.js';class DataConverterPsionic{static async['pGetPsionicItems'](_0xed8cd6,_0x5bc4de){const _0x478161=_0x471d;return _0x5bc4de=_0x5bc4de||{},[await this[_0x478161(0x1eb)](_0xed8cd6,_0x5bc4de),await this[_0x478161(0x1db)](_0xed8cd6,_0x5bc4de),...await this[_0x478161(0x1b8)](_0xed8cd6,_0x5bc4de)][_0x478161(0x1ac)](Boolean);}static[_0xa26e8c(0x1d2)](_0x210a67,_0x497551){const _0x1d37e6=_0xa26e8c;_0x497551=_0x497551||{};const _0x2b0163={[SharedConsts[_0x1d37e6(0x1f9)]]:{'page':UrlUtil[_0x1d37e6(0x1ec)],'source':_0x210a67[_0x1d37e6(0x1a4)],'hash':UrlUtil[_0x1d37e6(0x1f5)][UrlUtil['PG_PSIONICS']](_0x210a67)}};return _0x497551[_0x1d37e6(0x1c8)]&&(_0x2b0163[SharedConsts[_0x1d37e6(0x1f9)]][_0x1d37e6(0x1f8)]={'psionic':MiscUtil[_0x1d37e6(0x1cd)](_0x210a67)},_0x2b0163[SharedConsts['MODULE_NAME_FAKE']][_0x1d37e6(0x1a1)]=_0x497551[_0x1d37e6(0x1a1)]),_0x2b0163;}static async[_0xa26e8c(0x1eb)](_0x3e009c,_0x4c1c4d){const _0x5a810e=_0xa26e8c;if(_0x3e009c['type']!=='T')return null;const _0x520487=JSON[_0x5a810e(0x1ab)](_0x3e009c[_0x5a810e(0x1bd)]),_0x1155e4=this['_getPsionicItems_getActionTypeFromString'](_0x520487);let _0xfe52f3='',_0x4ed0f6=null;const _0x7f0c2e=[];_0x520487[_0x5a810e(0x1f1)](/\({@damage ([^}]+)}\)/g,(..._0x30b37b)=>_0x7f0c2e['push'](_0x30b37b[0x1]));const _0x3f8d94=/(?:^|[^(]){@dice ([^}]+)}(?:[^)]|$)/[_0x5a810e(0x1ce)](_0x520487);if(_0x7f0c2e[_0x5a810e(0x19c)]===0x3){if(_0x3f8d94)_0x4ed0f6=_0x3f8d94[0x1];else _0x4ed0f6=_0x7f0c2e[0x0];}if(_0x3f8d94)_0xfe52f3=_0x3f8d94;else{if(_0x7f0c2e['length'])_0xfe52f3=_0x7f0c2e[0x0];}const _0x38b603=this[_0x5a810e(0x1ba)](_0x520487),_0x75881e=_0xfe52f3?[_0xfe52f3,_0x38b603]['filter'](Boolean):null,_0x1e049b=this['_getPsionicItems_getSaveFromString'](_0x520487),_0x1aa95f=await this[_0x5a810e(0x1d6)](_0x3e009c);return{'name':UtilApplications[_0x5a810e(0x1ee)](DataConverter[_0x5a810e(0x1c4)](_0x3e009c,{'isActorItem':!![]})),'type':_0x5a810e(0x1f0),'data':{'source':DataConverter[_0x5a810e(0x1ff)](_0x3e009c),'description':{'value':Config[_0x5a810e(0x1d4)]('importPsionic',_0x5a810e(0x1a9))?_0x5a810e(0x1a2)+Renderer['psionic'][_0x5a810e(0x1c2)](_0x3e009c,Renderer['get']())+_0x5a810e(0x1ef):'','chat':'','unidentified':''},'actionType':_0x1155e4,'level':0x0,'school':_0x5a810e(0x1e6),'components':{'value':'','vocal':![],'somatic':![],'material':![],'ritual':![],'concentration':![]},'materials':{'value':'','consumed':![],'cost':0x0,'supply':0x0},'target':{'value':0x0,'units':'','type':''},'range':{'value':null,'units':'','long':null},'activation':{'type':_0x1155e4,'cost':0x1,'condition':''},'duration':{'value':0x0,'units':''},'damage':{'parts':[_0x75881e][_0x5a810e(0x1ac)](Boolean),'versatile':''},'scaling':{'mode':_0x4ed0f6?'cantrip':'none','formula':_0x4ed0f6||''},'save':{'ability':_0x1e049b,'dc':null},'ability':_0x5a810e(0x1b3),'uses':{'value':0x0,'max':0x0,'per':''},'attackBonus':0x0,'chatFlavor':'','critical':null,'formula':'','preparation':{'mode':_0x5a810e(0x1f7),'prepared':!![]},..._0x1aa95f},'img':_0x5a810e(0x1ca)+SharedConsts[_0x5a810e(0x1a0)]+_0x5a810e(0x1fa),'flags':{...this['_getPsionicFlags'](_0x3e009c,_0x4c1c4d)},'effects':[]};}static async[_0xa26e8c(0x1db)](_0x1bef4d,_0x1f2375){const _0x1e8f1d=_0xa26e8c;if(_0x1bef4d[_0x1e8f1d(0x19d)]!=='D')return null;const _0x3ce035=await this[_0x1e8f1d(0x1a7)](_0x1bef4d);return{'name':UtilApplications[_0x1e8f1d(0x1ee)](DataConverter['getNameWithSourcePart'](_0x1bef4d,{'displayName':_0x1bef4d[_0x1e8f1d(0x1bb)]+_0x1e8f1d(0x1e4),'isActorItem':!![]})),'type':_0x1e8f1d(0x1f0),'data':{'source':DataConverter[_0x1e8f1d(0x1ff)](_0x1bef4d),'description':{'value':Config[_0x1e8f1d(0x1d4)](_0x1e8f1d(0x1be),_0x1e8f1d(0x1a9))?'<div>'+Renderer[_0x1e8f1d(0x1d4)]()[_0x1e8f1d(0x1fd)](!![])['render']({'entries':[_0x1bef4d[_0x1e8f1d(0x1a8)]]})+_0x1e8f1d(0x1ef):'','chat':'','unidentified':''},'actionType':_0x1e8f1d(0x1cb),'level':0x0,'school':_0x1e8f1d(0x1e6),'components':{'value':'','vocal':![],'somatic':![],'material':![],'ritual':![],'concentration':![]},'materials':{'value':'','consumed':![],'cost':0x0,'supply':0x0},'target':{'value':0x0,'units':'','type':''},'range':{'value':null,'units':'','long':null},'activation':{'type':_0x1e8f1d(0x1cb),'cost':0x1,'condition':_0x1e8f1d(0x1b7)},'duration':{'value':0x0,'units':''},'damage':{'parts':[],'versatile':''},'scaling':{'mode':_0x1e8f1d(0x1b2),'formula':''},'save':{'ability':null,'dc':null},'ability':_0x1e8f1d(0x1b3),'uses':{'value':0x0,'max':0x0,'per':''},'attackBonus':0x0,'chatFlavor':'','critical':null,'formula':'','preparation':{'mode':_0x1e8f1d(0x1f7),'prepared':!![]},..._0x3ce035},'img':_0x1e8f1d(0x1ca)+SharedConsts[_0x1e8f1d(0x1a0)]+_0x1e8f1d(0x1fa),'flags':{...this[_0x1e8f1d(0x1d2)](_0x1bef4d,_0x1f2375)},'effects':[]};}static async[_0xa26e8c(0x1b8)](_0x1e8ea7,_0x547335){const _0x3d7561=_0xa26e8c,_0x5bd78d=async _0x194795=>{const _0x104ee1=_0x471d,_0x49ffae=_0x499121=>_0x499121[_0x104ee1(0x1fb)]?'\x20('+(_0x499121[_0x104ee1(0x1fb)][_0x104ee1(0x1ad)]===_0x499121['cost'][_0x104ee1(0x1e0)]?_0x499121[_0x104ee1(0x1fb)][_0x104ee1(0x1ad)]:_0x499121['cost']['min']+'-'+_0x499121[_0x104ee1(0x1fb)][_0x104ee1(0x1e0)])+_0x104ee1(0x1c5):'',_0x3da8de=_0x49ffae(_0x194795),_0x47ef9c=UtilApplications[_0x104ee1(0x1ee)](DataConverter[_0x104ee1(0x1c4)](_0x1e8ea7,{'displayName':_0x1e8ea7[_0x104ee1(0x1bb)]+'\x20-\x20'+_0x194795['name']+_0x3da8de,'isActorItem':!![]})),_0x253e10=_0x194795[_0x104ee1(0x1d1)]?Renderer[_0x104ee1(0x1d4)]()['setFirstSection'](!![])[_0x104ee1(0x1dc)]({'type':'list','style':_0x104ee1(0x1e9),'items':_0x194795[_0x104ee1(0x1d1)][_0x104ee1(0x1a6)](_0x53139a=>({'type':_0x104ee1(0x1ea),'name':''+_0x53139a['name']+_0x49ffae(_0x53139a),'entry':_0x53139a[_0x104ee1(0x1bd)][_0x104ee1(0x1c3)](_0x104ee1(0x1f2))}))},0x2):'',_0xa97846=JSON[_0x104ee1(0x1ab)](_0x194795[_0x104ee1(0x1bd)]),_0x342edd=this[_0x104ee1(0x1d0)](_0xa97846);let _0xcc4323=null;const _0x3bd87b=[],_0x364dfe=this[_0x104ee1(0x1ba)](_0xa97846);_0xa97846['replace'](/{@(?:scaledice|scaledamage) ([^}]+)}/,(..._0x49e15d)=>{const _0x3075dc=_0x104ee1,[_0x3f7656,_0x415fb9,_0x2f88f7]=_0x49e15d[0x1]['split']('|');_0x3bd87b[_0x3075dc(0x1f3)](_0x3f7656),_0xcc4323=_0x2f88f7;});!_0x3bd87b[_0x104ee1(0x19c)]&&_0xa97846[_0x104ee1(0x1f1)](/{@damage ([^}]+)}/g,(..._0x96f90b)=>_0x3bd87b[_0x104ee1(0x1f3)](_0x96f90b[0x1]));const _0x2652bd=_0x3bd87b[_0x104ee1(0x1a6)](_0x263521=>[_0x263521,_0x364dfe]['filter'](Boolean)),_0x4e549a=this['_getPsionicItems_getSaveFromString'](_0xa97846),_0x13fdaa=_0x194795[_0x104ee1(0x1fb)]?_0x194795[_0x104ee1(0x1fb)][_0x104ee1(0x1ad)]:_0x194795['submodes']?MiscUtil[_0x104ee1(0x1d4)](_0x194795[_0x104ee1(0x1d1)][_0x104ee1(0x1b6)](_0x5601b0=>_0x5601b0[_0x104ee1(0x1fb)]),_0x104ee1(0x1fb),_0x104ee1(0x1ad))||0x1:0x1,_0x1ba164=_0x194795[_0x104ee1(0x1e2)]?_0x194795[_0x104ee1(0x1e2)]['duration']:0x0,_0x4692b6=(_0x194795[_0x104ee1(0x1e2)]?DataConverterPsionic[_0x104ee1(0x1c1)][_0x194795[_0x104ee1(0x1e2)]['unit']]:'')||'',_0x106d64=await this[_0x104ee1(0x1e7)]({'name':_0x47ef9c,'source':_0x1e8ea7[_0x104ee1(0x1a4)],'psionicName':_0x1e8ea7[_0x104ee1(0x1bb)],'psionicSource':_0x1e8ea7['source']});return{'name':_0x47ef9c,'type':'spell','data':{'source':DataConverter[_0x104ee1(0x1ff)](_0x1e8ea7),'description':{'value':Config[_0x104ee1(0x1d4)](_0x104ee1(0x1be),'isImportDescription')?_0x104ee1(0x1ed)+Renderer[_0x104ee1(0x1d4)]()['setFirstSection'](!![])[_0x104ee1(0x1dc)]({'entries':_0x194795['entries']},0x2)+_0x104ee1(0x1bc)+_0x253e10+_0x104ee1(0x1c6):'','chat':'','unidentified':''},'actionType':_0x342edd,'level':_0x13fdaa,'school':_0x104ee1(0x1e6),'components':{'value':'','vocal':![],'somatic':![],'material':![],'ritual':![],'concentration':!!_0x194795[_0x104ee1(0x1e2)]},'materials':{'value':'','consumed':![],'cost':0x0,'supply':0x0},'target':{'value':0x0,'units':'','type':''},'range':{'value':null,'units':'','long':null},'activation':{'type':_0x342edd,'cost':0x1,'condition':''},'duration':{'value':_0x1ba164,'units':_0x4692b6},'damage':{'parts':_0x2652bd,'versatile':''},'scaling':{'mode':_0xcc4323?_0x104ee1(0x1af):_0x104ee1(0x1b2),'formula':_0xcc4323||''},'save':{'ability':_0x4e549a,'dc':null},'ability':'int','uses':{'value':0x0,'max':0x0,'per':''},'attackBonus':0x0,'chatFlavor':'','critical':null,'formula':'','preparation':{'mode':_0x104ee1(0x1f7),'prepared':!![]},..._0x106d64},'img':_0x104ee1(0x1ca)+SharedConsts['MODULE_NAME']+_0x104ee1(0x1fa),'flags':{...this[_0x104ee1(0x1d2)](_0x1e8ea7,_0x547335)},'effects':[]};};if(_0x1e8ea7['type']==='T')return[];else return _0x1e8ea7[_0x3d7561(0x1d9)][_0x3d7561(0x19e)](_0x52b9b6=>_0x5bd78d(_0x52b9b6));}static['_getPsionicItems_getActionTypeFromString'](_0x1249cf){const _0x2518d4=_0xa26e8c,_0x33afe2=/bonus action/i['test'](_0x1249cf),_0x512087=/as an action|using your action/i[_0x2518d4(0x1cc)](_0x1249cf);return _0x33afe2?'bonus':_0x512087?'action':'';}static[_0xa26e8c(0x1ba)](_0x1743e6){const _0x14cff2=_0xa26e8c,_0x2e017a=Parser[_0x14cff2(0x1bf)][_0x14cff2(0x1a6)](_0x499fc7=>new RegExp('('+_0x499fc7+')[^.]+damage','ig')[_0x14cff2(0x1ce)](_0x1743e6)),_0x526d23=_0x2e017a[_0x14cff2(0x1ac)](Boolean)['map'](_0x60a0f7=>_0x60a0f7[0x1]['toLowerCase']());return _0x526d23[0x0]||null;}static[_0xa26e8c(0x1b0)](_0x284cf1){const _0x4a4663=_0xa26e8c,_0x473e4e=Object[_0x4a4663(0x1e3)](Parser[_0x4a4663(0x19b)])[_0x4a4663(0x1a6)](_0x2de5e1=>new RegExp('('+_0x2de5e1+')\x20saving\x20throw','ig')[_0x4a4663(0x1ce)](_0x284cf1)),_0x4b28bf=_0x473e4e['filter'](Boolean)[_0x4a4663(0x1a6)](_0x8bbfae=>_0x8bbfae[0x1][_0x4a4663(0x1d8)](0x0,0x3)[_0x4a4663(0x19f)]());return _0x4b28bf[0x0]||null;}static async[_0xa26e8c(0x1c7)](_0x286b4c,_0x58b9c2){const _0x5ce036=_0xa26e8c;_0x58b9c2=_0x58b9c2||{};const _0x23b99d=Renderer['psionic']['getTypeOrderString'](_0x286b4c),_0x18c50d=_0x5ce036(0x19a)+_0x23b99d+'</i></p>'+Renderer[_0x5ce036(0x1aa)][_0x5ce036(0x1c2)](_0x286b4c,Renderer[_0x5ce036(0x1d4)]()[_0x5ce036(0x1fd)](!![])),_0x288334=await this[_0x5ce036(0x1d6)](_0x286b4c),_0x36a0b6={'name':UtilApplications['getCleanEntityName'](DataConverter[_0x5ce036(0x1c4)](_0x286b4c['name'])),'type':_0x5ce036(0x1a5),'data':{'description':{'value':Config[_0x5ce036(0x1d4)]('importPsionic',_0x5ce036(0x1a9))?_0x5ce036(0x1a2)+_0x18c50d+'</div>':'','chat':'','unidentified':''},'source':DataConverter[_0x5ce036(0x1ff)](_0x286b4c),'damage':{'parts':[]},'activation':{'type':'','cost':0x0,'condition':''},'duration':{'value':null,'units':''},'target':{'value':null,'units':'','type':''},'range':{'value':null,'long':null,'units':''},'uses':{'value':0x0,'max':0x0,'per':null},'ability':null,'actionType':'','attackBonus':0x0,'chatFlavor':'','critical':null,'formula':'','save':{'ability':'','dc':null},'requirements':'','recharge':{'value':null,'charged':![]},..._0x288334},'flags':{...this['_getPsionicFlags'](_0x286b4c,_0x58b9c2)},'effects':[],'img':_0x5ce036(0x1ca)+SharedConsts[_0x5ce036(0x1a0)]+_0x5ce036(0x1fa)};if(_0x58b9c2[_0x5ce036(0x1b4)])_0x36a0b6[_0x5ce036(0x1fe)]={'default':Config[_0x5ce036(0x1d4)]('importPsionic',_0x5ce036(0x1ae))};return _0x36a0b6;}static async[_0xa26e8c(0x1d6)](_0x171e0e){const _0x524893=_0xa26e8c;return DataConverter[_0x524893(0x1d5)](_0x171e0e,{'propBrew':_0x524893(0x1b5),'fnLoadJson':Vetools['pGetPsionicsSideData'],'propJson':_0x524893(0x1aa)});}static async['_pGetDisciplineFocusAdditionalData'](_0x492880){const _0x550041=_0xa26e8c;return DataConverter[_0x550041(0x1d5)](_0x492880,{'propBrew':_0x550041(0x1e1),'fnLoadJson':Vetools[_0x550041(0x1a3)],'propJson':_0x550041(0x1c9)});}static async[_0xa26e8c(0x1e7)](_0x3208e3){const _0xd56ed3=_0xa26e8c;return DataConverter[_0xd56ed3(0x1d5)](_0x3208e3,{'propBrew':_0xd56ed3(0x1b1),'fnLoadJson':Vetools[_0xd56ed3(0x1a3)],'propJson':'psionicDisciplineActive','fnMatch':(_0x5ea77e,_0x3e4668)=>_0x3e4668[_0xd56ed3(0x1bb)]===_0x5ea77e['name']&&_0x3e4668[_0xd56ed3(0x1a4)]===_0x5ea77e[_0xd56ed3(0x1a4)]&&_0x3e4668[_0xd56ed3(0x1f4)]===_0x5ea77e[_0xd56ed3(0x1f4)]&&_0x3e4668[_0xd56ed3(0x1e5)]===_0x5ea77e[_0xd56ed3(0x1e5)]});}}DataConverterPsionic[_0xa26e8c(0x1c1)]={'min':_0xa26e8c(0x1c0),'hr':_0xa26e8c(0x1da),'rnd':'round'};export{DataConverterPsionic};