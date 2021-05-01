var __awaiter=undefined&&undefined.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator.throw(value));}catch(e){reject(e);}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P(function(resolve){resolve(value);})).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());})};class DFSceneJournal{static displayDialog(scene){return __awaiter(this,void 0,void 0,function*(){const permScene=scene.hasPerm(game.user,"LIMITED"),hasConfig=game.user.isGM,hasJournal=!!scene.journal&&scene.journal.hasPerm(game.user,"OBSERVER");if(!permScene&&!hasConfig&&!hasJournal)return ui.notifications.warn(`You do not have permission to view this ${scene.entity}.`);const buttons={};let defaultButton="";return hasConfig&&(defaultButton="config",buttons.config={icon:'<i class="fas fa-cog"></i>',label:game.i18n.localize("DRAGON_FLAGON.Dialog_JournalConfig"),callback:()=>__awaiter(this,void 0,void 0,function*(){return scene.sheet.render(!0)})}),hasJournal&&(defaultButton="journal",buttons.journal={icon:'<i class="fas fa-book-open"></i>',label:game.i18n.localize("DRAGON_FLAGON.Dialog_JournalJournal"),callback:()=>__awaiter(this,void 0,void 0,function*(){return scene.journal.sheet.render(!0)})}),permScene&&(defaultButton="navigate",buttons.navigate={icon:'<i class="fas fa-directions"></i>',label:game.i18n.localize("DRAGON_FLAGON.Dialog_JournalNavigate"),callback:()=>__awaiter(this,void 0,void 0,function*(){return scene.view()})}),game.settings.get(DFSceneJournal.MODULE,DFSceneJournal.ON_CLICK_JOURNAL_ONLY_ONE)&&1==Object.keys(buttons).length?buttons[Object.keys(buttons)[0]].callback():new Dialog({title:game.i18n.localize("DRAGON_FLAGON.Dialog_JournalTitle")+scene.name,content:"<p>"+game.i18n.localize("DRAGON_FLAGON.Dialog_JournalMessage")+"</p>",buttons:buttons,default:defaultButton}).render(!0)})}static onClickEntityLink(event){return __awaiter(this,void 0,void 0,function*(){const dataset=event.currentTarget.dataset;if(!dataset.pack){const entity=CONFIG[dataset.entity].entityClass.collection.get(dataset.id);if("Scene"===entity.entity)return event.preventDefault(),DFSceneJournal.displayDialog(entity)}return TextEditor._onClickEntityLink(event)})}static patchTextEditor(newValue){var journalClick=game.settings.get(DFSceneJournal.MODULE,DFSceneJournal.ON_CLICK_JOURNAL);void 0!==newValue&&(journalClick=newValue);const body=$("body");journalClick?(body.off("click","a.entity-link",TextEditor._onClickEntityLink),body.on("click","a.entity-link",DFSceneJournal.onClickEntityLink)):(body.off("click","a.entity-link",DFSceneJournal.onClickEntityLink),body.on("click","a.entity-link",TextEditor._onClickEntityLink));}static init(){game.settings.register(DFSceneJournal.MODULE,DFSceneJournal.ON_CLICK_JOURNAL,{name:"DRAGON_FLAGON.Nav_SettingOnClickJournal",hint:"DRAGON_FLAGON.Nav_SettingOnClickJournalHint",scope:"world",config:!0,type:Boolean,default:!0,onChange:value=>DFSceneJournal.patchTextEditor(value)}),game.settings.register(DFSceneJournal.MODULE,DFSceneJournal.ON_CLICK_JOURNAL_ONLY_ONE,{name:"DRAGON_FLAGON.Nav_SettingOnClickJournalOnlyOne",hint:"DRAGON_FLAGON.Nav_SettingOnClickJournalOnlyOneHint",scope:"scene",config:!0,type:Boolean,default:!1});}static ready(){DFSceneJournal.patchTextEditor();}}DFSceneJournal.MODULE="df-scene-enhance",DFSceneJournal.ON_CLICK_JOURNAL="nav-on-click-journal",DFSceneJournal.ON_CLICK_JOURNAL_ONLY_ONE="nav-on-click-journal-only-one";

var __awaiter$1=undefined&&undefined.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator.throw(value));}catch(e){reject(e);}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P(function(resolve){resolve(value);})).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());})};class DFSceneNav{static patchSceneDirectoryClick(newValue,isPlayer){var gmClick=game.settings.get(DFSceneNav.MODULE,DFSceneNav.ON_CLICK),pcClick=game.settings.get(DFSceneNav.MODULE,DFSceneNav.ON_CLICK_PLAYER);void 0!==newValue&&(isPlayer?pcClick=newValue:gmClick=newValue);let enabled=game.user.isGM&&gmClick||!game.user.isGM&&pcClick;enabled!=!!SceneDirectory.prototype.dfSceneNav_onClickEntityName&&(enabled?(SceneDirectory.prototype.dfSceneNav_onClickEntityName=SceneDirectory.prototype._onClickEntityName,SceneDirectory.prototype._onClickEntityName=function(event){event.preventDefault();const entity=this.constructor.collection.get(event.currentTarget.parentElement.dataset.entityId);entity instanceof Scene?entity.view():this.dfSceneNav_onClickEntityName(event);},SceneDirectory.prototype.dfSceneNav_getEntryContextOptions=SceneDirectory.prototype._getEntryContextOptions,SceneDirectory.prototype._getEntryContextOptions=function(){return game.user.isGM?this.dfSceneNav_getEntryContextOptions():[{name:"SCENES.View",icon:'<i class="fas fa-eye"></i>',condition:li=>!canvas.ready||li.data("entityId")!==canvas.scene._id,callback:li=>{game.scenes.get(li.data("entityId")).view();}}]}):(SceneDirectory.prototype._onClickEntityName=SceneDirectory.prototype.dfSceneNav_onClickEntityName,delete SceneDirectory.prototype.dfSceneNav_onClickEntityName,SceneDirectory.prototype._getEntryContextOptions=SceneDirectory.prototype.dfSceneNav_getEntryContextOptions,delete SceneDirectory.prototype.dfSceneNav_getEntryContextOptions));}static patchSceneDirectory(){let sidebarDirDefOpts=Object.getOwnPropertyDescriptor(SidebarDirectory,"defaultOptions");Object.defineProperty(SceneDirectory,"defaultOptions",{get:function(){return mergeObject(sidebarDirDefOpts.get.bind(SceneDirectory)(),{template:`modules/${DFSceneNav.MODULE}/templates/scene-directory.hbs`})}});}static patchSidebar(){Sidebar.prototype.dfSceneNav_render=Sidebar.prototype._render,Sidebar.prototype._render=function(...args){return __awaiter$1(this,void 0,void 0,function*(){this.rendered||(yield this.dfSceneNav_render(...args));var pcClick=game.settings.get(DFSceneNav.MODULE,DFSceneNav.ON_CLICK_PLAYER);const tabs=["chat","combat","actors","items","journal","tables","playlists","compendium","settings"];(game.user.isGM||pcClick)&&tabs.push("scenes");for(let name of tabs){const app=ui[name];try{yield app._render(!0,{});}catch(err){console.error(`Failed to render Sidebar tab ${name}`),console.error(err);}}})},Sidebar.prototype.getData=function(options){return {coreUpdate:!!game.data.coreUpdate&&game.i18n.format("SETUP.UpdateAvailable",game.data.coreUpdate),user:game.user,scenesAllowed:game.user.isGM||game.settings.get(DFSceneNav.MODULE,DFSceneNav.ON_CLICK_PLAYER)}};let sidebarDefaultOptions=Object.getOwnPropertyDescriptor(Sidebar,"defaultOptions");Object.defineProperty(Sidebar,"defaultOptions",{get:function(){return mergeObject(sidebarDefaultOptions.get(),{template:`modules/${DFSceneNav.MODULE}/templates/sidebar.hbs`})}});}static init(){game.settings.register(DFSceneNav.MODULE,DFSceneNav.ON_CLICK,{name:"DRAGON_FLAGON.Nav_SettingOnClick",hint:"DRAGON_FLAGON.Nav_SettingOnClickHint",scope:"world",config:!0,type:Boolean,default:!0,onChange:value=>DFSceneNav.patchSceneDirectoryClick(value,!1)}),game.settings.register(DFSceneNav.MODULE,DFSceneNav.ON_CLICK_PLAYER,{name:"DRAGON_FLAGON.Nav_SettingOnClickPC",hint:"DRAGON_FLAGON.Nav_SettingOnClickPCHint",scope:"world",config:!0,type:Boolean,default:!0,onChange:value=>DFSceneNav.patchSceneDirectoryClick(value,!0)}),Handlebars.registerHelper("dfCheck",function(scene){return game.user&&game.user.isGM||!scene.data.navName?scene.data.name:scene.data.navName}),DFSceneNav.patchSceneDirectory(),DFSceneNav.patchSidebar();}static ready(){DFSceneNav.patchSceneDirectoryClick();}}DFSceneNav.MODULE="df-scene-enhance",DFSceneNav.ON_CLICK="nav-on-click",DFSceneNav.ON_CLICK_PLAYER="nav-on-click-player";

var __awaiter$2=undefined&&undefined.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator.throw(value));}catch(e){reject(e);}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P(function(resolve){resolve(value);})).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());})};function reduce(numerator,denominator){for(var c,a=numerator,b=denominator;b;)c=a%b,a=b,b=c;return [numerator/a,denominator/a]}function floatVal(input){return parseFloat(input.val())}function intVal(input){return parseInt(input.val())}class DFSceneRatio{constructor(){this.initialWidth=0,this.initialHeight=0,this.widthField=null,this.heightField=null,this.lockRatio=null,this.customRatio=null,this.numerator=null,this.denominator=null,this.applyRatio=null,this.scale=null,this.applyScale=null,this.isLocked=!1,this.useCustom=!1;}get _width(){return intVal(this.widthField)}set _width(value){this.widthField.val(value);}get _height(){return intVal(this.heightField)}set _height(value){this.heightField.val(value);}get _numerator(){return floatVal(this.numerator)}set _numerator(value){this.numerator.val(value);}get _denominator(){return floatVal(this.denominator)}set _denominator(value){this.denominator.val(value);}get _scale(){return floatVal(this.scale)}set _scale(value){this.scale.val(value);}_updateRatio(){const[num,den]=reduce(this._width,this._height);this._numerator=num,this._denominator=den;}_performDimensionChange(width,height){if(!this.isLocked)return void this._updateRatio();const num=this._numerator,den=this._denominator;isNaN(num)||isNaN(den)||(void 0!==width?this._height=Math.round(width/num*den):void 0!==height?this._width=Math.round(height/den*num):console.error("DFSceneRatio._performDimensionChange(undefined, undefined)"));}_performScale(){const num=this._numerator,den=this._denominator,scale=this._scale;isNaN(num)||isNaN(den)||isNaN(scale)||(this._width=this._width*scale,this._height=this._height*scale,this._scale=1);}_performRatio(){const num=this._numerator,den=this._denominator,width=this._width,height=this._height;isNaN(num)||isNaN(den)||(num>den||num==den&&width>height?this._height=Math.round(width/num*den):this._width=Math.round(height/den*num));}render(_app,html,data){return __awaiter$2(this,void 0,void 0,function*(){this.initialWidth=data.entity.width,this.initialHeight=data.entity.height;const[numerator,denominator]=reduce(data.entity.width,data.entity.height),ratioData={numerator:numerator,denominator:denominator},ratioHtml=$(yield renderTemplate(`modules/${DFSceneRatio.MODULE}/templates/scene-ratio.hbs`,ratioData)),dimHtml=html.find("#df-thumb-group").next();this.widthField=dimHtml.find('input[name="width"]'),this.heightField=dimHtml.find('input[name="height"]'),ratioHtml.insertAfter(dimHtml),this._extractFields(ratioHtml),this._attachListeners(),yield this._updateOriginalImageDimensions(data.entity.img);})}_extractFields(html){this.lockRatio=html.find('input[name="lockRatio"]'),this.customRatio=html.find('input[name="customRatio"]'),this.numerator=html.find('input[name="numerator"]'),this.denominator=html.find('input[name="denominator"]'),this.applyRatio=html.find('button[name="applyRatio"]'),this.scale=html.find('input[name="scale"]'),this.applyScale=html.find('button[name="applyScale"]');}_attachListeners(){this.widthField.on("change",()=>this._performDimensionChange(this._width)),this.heightField.on("change",()=>this._performDimensionChange(void 0,this._height)),this.lockRatio.on("change",()=>{this.isLocked=this.lockRatio[0].checked;}),this.customRatio.on("change",()=>{this.useCustom=this.customRatio[0].checked,this.numerator.prop("disabled",0==this.useCustom),this.denominator.prop("disabled",0==this.useCustom),this.applyRatio.prop("disabled",0==this.useCustom);}),this.applyScale.on("click",()=>this._performScale()),this.applyRatio.on("click",()=>this._performRatio());}_updateOriginalImageDimensions(url){return __awaiter$2(this,void 0,void 0,function*(){return new Promise((resolve,reject)=>{const image=$(new Image);image.on("load",()=>{this.widthField.attr("placeholder",image[0].width),this.heightField.attr("placeholder",image[0].height),resolve();}).on("error",reject).attr("src",url);})})}}DFSceneRatio.MODULE="df-scene-enhance";

var __awaiter$3=undefined&&undefined.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value));}catch(e){reject(e);}}function rejected(value){try{step(generator.throw(value));}catch(e){reject(e);}}function step(result){var value;result.done?resolve(result.value):(value=result.value,value instanceof P?value:new P(function(resolve){resolve(value);})).then(fulfilled,rejected);}step((generator=generator.apply(thisArg,_arguments||[])).next());})};class DFSceneThumb{static purge(){if(!game.user.isGM)return;let ids=[];for(var scene of game.scenes.entries)ids.push(scene.id);let config=JSON.parse(game.settings.get(DFSceneThumb.MODULE,DFSceneThumb.THUMBS));for(var id in config)ids.includes(id)||delete config[id];game.settings.set(DFSceneThumb.MODULE,DFSceneThumb.THUMBS,JSON.stringify(config));}static updateThumb(sceneId,value,generated=!1){let config=JSON.parse(game.settings.get(DFSceneThumb.MODULE,DFSceneThumb.THUMBS));value?config[sceneId]={url:value,thumb:generated}:delete config[sceneId],game.settings.set(DFSceneThumb.MODULE,DFSceneThumb.THUMBS,JSON.stringify(config));}static getThumb(sceneId){var _a;return null!==(_a=JSON.parse(game.settings.get(DFSceneThumb.MODULE,DFSceneThumb.THUMBS))[sceneId])&&void 0!==_a?_a:null}static init(){game.settings.register(DFSceneThumb.MODULE,DFSceneThumb.THUMBS,{scope:"world",config:!1,type:String,default:"{}"}),Hooks.on("renderSceneConfig",(app,html,data)=>__awaiter$3(this,void 0,void 0,function*(){const imgInput=html.find('input[name ="img"]')[0];if(!imgInput||!imgInput.parentElement||!imgInput.parentElement.parentElement)return;const sceneId=data.entity._id,thumbConfig=DFSceneThumb.getThumb(sceneId),injection=$(yield renderTemplate(`modules/${DFSceneThumb.MODULE}/templates/scene-thumb.hbs`,{thumbPath:thumbConfig&&thumbConfig.url||""})),target=imgInput.parentElement.parentElement;for(var c=0;c<injection.length;c++)1==injection[c].nodeType&&target.after(injection[c]);html.find("#df-thumb-btn").on("click",()=>{let fp=FilePicker.fromButton(html.find("#df-thumb-btn")[0]),target=html.find("#df-thumb-btn")[0].getAttribute("data-target");app.filepickers.push({target:target,app:fp}),fp.browse();}),html.find("#df-thumb-img").on("change",()=>DFSceneThumb.updateThumb(sceneId,html.find("#df-thumb-img").val())),app.ratioScaler=new DFSceneRatio,yield app.ratioScaler.render(app,html,data);})),Hooks.on("closeSceneConfig",(app,html)=>__awaiter$3(this,void 0,void 0,function*(){var _a;const dfSceneConfig=DFSceneThumb.getThumb(app.entity.id),scene=app.entity;if(dfSceneConfig&&dfSceneConfig.url)try{let img=null!==(_a=dfSceneConfig&&dfSceneConfig.url)&&void 0!==_a?_a:scene.data.img;const td=yield ImageHelper.createThumbnail(img,{width:300,height:100});dfSceneConfig.thumb=!0,DFSceneThumb.updateThumb(scene.id,img,!0),yield scene.update({thumb:td.thumb},{});}catch(err){ui.notifications.error("Thumbnail Override generation for Scene failed: "+err.message);}}));}static ready(){DFSceneThumb.purge();}}DFSceneThumb.MODULE="df-scene-enhance",DFSceneThumb.THUMBS="thumbs";

Hooks.once("init",function(){DFSceneJournal.init(),DFSceneNav.init(),DFSceneThumb.init();}),Hooks.once("ready",function(){DFSceneJournal.ready(),DFSceneNav.ready(),DFSceneThumb.ready();});
