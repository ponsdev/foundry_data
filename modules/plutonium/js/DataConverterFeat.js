const _0x155a=['497496nAzhqd','pGetFeatSideData','utils','_getFeatFlags','setFirstSection','isActorItem','27MBYWjD','source','494236LYRyhR','516827NcjYWO','11553kyIwlN','pGetFeatItemEffects','</i></p>','prerequisite','permission','isAddPermission','10276TrIdEL','getPrerequisiteText','modules/','7XoQSsD','pGetFeatItem','name','/media/icon/mighty-force.svg','get','getNameWithSourcePart','81381axZQJx','mergeAbilityIncrease','permissions','<p><i>Prerequisite:\x20','filterValues','pGetAdditionalData_','URL_TO_HASH_BUILDER','MODULE_NAME_FAKE','feat','foundryFeat','<div>\x0a\x09\x09\x09','424433NQxRml','length','copy','MODULE_NAME','\x0a\x09\x09</div>','_pGetAdditionalData','1qWXbTV','importFeat','49IuqfXY','getSourceWithPagePart','pGetAdditionalEffectsRaw_'];const _0x8b99=function(_0x10afc8,_0x165165){_0x10afc8=_0x10afc8-0x11a;let _0x155a96=_0x155a[_0x10afc8];return _0x155a96;};const _0x5752fd=_0x8b99;(function(_0x1bbc59,_0x17a924){const _0x3e73c5=_0x8b99;while(!![]){try{const _0x28e6a8=-parseInt(_0x3e73c5(0x133))*parseInt(_0x3e73c5(0x141))+-parseInt(_0x3e73c5(0x122))*-parseInt(_0x3e73c5(0x11c))+-parseInt(_0x3e73c5(0x148))*-parseInt(_0x3e73c5(0x13e))+parseInt(_0x3e73c5(0x142))*parseInt(_0x3e73c5(0x135))+-parseInt(_0x3e73c5(0x140))+parseInt(_0x3e73c5(0x12d))+-parseInt(_0x3e73c5(0x138));if(_0x28e6a8===_0x17a924)break;else _0x1bbc59['push'](_0x1bbc59['shift']());}catch(_0x4bc5ab){_0x1bbc59['push'](_0x1bbc59['shift']());}}}(_0x155a,0x50582));import{UtilApplications}from'./UtilApplications.js';import{SharedConsts}from'../shared/SharedConsts.js';import{Config}from'./Config.js';import{DataConverter}from'./DataConverter.js';import{Vetools}from'./Vetools.js';import{UtilActiveEffects}from'./UtilActiveEffects.js';class DataConverterFeat{static async[_0x5752fd(0x11d)](_0x229312,_0x24069e){const _0x434619=_0x5752fd;_0x24069e=_0x24069e||{};const _0x428bba=Renderer[_0x434619(0x13a)][_0x434619(0x11a)](_0x229312[_0x434619(0x145)]);Renderer['feat'][_0x434619(0x123)](_0x229312);const _0x9d6d93=_0x434619(0x12c)+(_0x428bba?_0x434619(0x125)+_0x428bba+_0x434619(0x144):'')+'\x0a\x09\x09\x09'+Renderer[_0x434619(0x120)]()[_0x434619(0x13c)](!![])['render']({'entries':_0x229312['entries']},0x2)+_0x434619(0x131),_0x1cec54=await DataConverter['pGetIconImage'](_0x434619(0x12a),_0x229312)||_0x434619(0x11b)+SharedConsts[_0x434619(0x130)]+_0x434619(0x11f),_0xa2b9a0=await this['_pGetAdditionalData'](_0x229312),_0x4ae74b={'name':UtilApplications['getCleanEntityName'](DataConverter[_0x434619(0x121)](_0x229312,{'isActorItem':_0x24069e[_0x434619(0x13d)]})),'data':{'source':DataConverter[_0x434619(0x136)](_0x229312),'description':{'value':Config[_0x434619(0x120)](_0x434619(0x134),'isImportDescription')?_0x9d6d93:'','chat':'','unidentified':''},'activation':{'type':'','cost':0x0,'condition':''},'duration':{'value':0x0,'units':''},'target':{'value':0x0,'units':'','type':''},'range':{'value':0x0,'long':0x0,'units':null},'uses':{'value':0x0,'max':0x0,'per':''},'ability':'','actionType':'','attackBonus':0x0,'chatFlavor':'','critical':null,'damage':{'parts':[],'versatile':''},'formula':'','save':{'ability':'','dc':null},'requirements':'','recharge':{'value':0x0,'charged':!![]},..._0xa2b9a0},'permission':{'default':0x0},'type':'feat','img':_0x1cec54,'flags':this[_0x434619(0x13b)](_0x229312,_0x24069e),'effects':[]};if(_0x24069e[_0x434619(0x147)])_0x4ae74b[_0x434619(0x146)]={'default':Config[_0x434619(0x120)](_0x434619(0x134),_0x434619(0x124))};return _0x4ae74b;}static[_0x5752fd(0x13b)](_0x29c4da,_0x1cb0e9){const _0xd14b87=_0x5752fd;_0x1cb0e9=_0x1cb0e9||{};const _0x30e361={[SharedConsts['MODULE_NAME_FAKE']]:{'page':UrlUtil['PG_FEATS'],'source':_0x29c4da[_0xd14b87(0x13f)],'hash':UrlUtil[_0xd14b87(0x128)][UrlUtil['PG_FEATS']](_0x29c4da)}};return _0x1cb0e9['isAddDataFlags']&&(_0x30e361[SharedConsts[_0xd14b87(0x129)]]['data']={'feat':MiscUtil[_0xd14b87(0x12f)](_0x29c4da)},_0x30e361[SharedConsts[_0xd14b87(0x129)]]['filterValues']=_0x1cb0e9[_0xd14b87(0x126)]),_0x30e361;}static async[_0x5752fd(0x132)](_0x462284){const _0x539409=_0x5752fd;return DataConverter[_0x539409(0x127)](_0x462284,{'propBrew':'foundryFeat','fnLoadJson':Vetools[_0x539409(0x139)],'propJson':'feat'});}static async['pHasFeatSideLoadedEffects'](_0x5b7378,_0x499d1b){const _0x5e06f0=_0x5752fd;return(await DataConverter[_0x5e06f0(0x137)](_0x499d1b,{'propBrew':_0x5e06f0(0x12b),'fnLoadJson':Vetools[_0x5e06f0(0x139)],'propJson':'feat'}))?.[_0x5e06f0(0x12e)]>0x0;}static async[_0x5752fd(0x143)](_0x38ca4f,_0x2e94f6,_0xaa707a,_0x26600f){const _0x17e29e=_0x5752fd,_0x1ab14e=await DataConverter[_0x17e29e(0x137)](_0x2e94f6,{'propBrew':_0x17e29e(0x12b),'fnLoadJson':Vetools[_0x17e29e(0x139)],'propJson':'feat'});return UtilActiveEffects['getExpandedEffects'](_0x38ca4f,_0xaa707a,_0x1ab14e||[],{'parentName':_0x2e94f6[_0x17e29e(0x11e)],'additionalData':_0x26600f});}}export{DataConverterFeat};