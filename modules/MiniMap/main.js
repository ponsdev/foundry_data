   // CONFIG.debug.hooks = true;
   var minimap_data = {
       'minimap_actors': {},
       'minimapapp': null,
       'hooked': false,
       'shown': false,
       'saved_top':null,
       'saved_left':null
   }

   class MiniMapApp extends Application {
       constructor(url, options) {
           super(options);
           this.url = url;

       }

       /* -------------------------------------------- */

       /** @override */
       static get defaultOptions() {
           const options = super.defaultOptions;
           // Default positioning
           // let h = window.innerHeight * 0.9,
           // w = Math.min(window.innerWidth * 0.9, 1200);
           options.top = minimap_data.saved_top;
           options.left = minimap_data.saved_left;
           // options.top = (window.innertop - this.h) / 2;
           // options.left = (window.innerleft - this.w) / 2;
           options.id = "minimappopup";
           options.template = "modules/MiniMap/template.html";
           options.popOut = true;
           options.minimizable = false;
           return options;
       }

       /* -------------------------------------------- */

       /** @override */
       getData() {
           return {
               src: this.url
           }
       };
       //   /* -------------------------------------------- */
       /** @override */
       close() {
           minimap_data.shown = false;
           minimap_data.saved_top = minimap_data.minimapapp.position.top;
           minimap_data.saved_left = minimap_data.minimapapp.position.left;
           super.close();
       }
   }


   Hooks.on("getSceneControlButtons", (controls) => {

       controls.push({
           name: "minimapcontrol",
           title: "MiniMap",
           // layer: "NotesLayer",
           icon: "fas fa-map-marked",
           activeTool: 'select',
           tools: [{
               name: "select",
               title: "MiniMapSelect",
               icon: "fas fa-expand",
           }],
       });
   });

   Hooks.on("renderSceneControls", () => {

       $('li[data-control="minimapcontrol"]')[0].onclick = () => {
           initMap();
           minimap_data.minimapapp.render(true);
           minimap_data.shown = true;
           if (minimap_data.hooked == false) {
               Hooks.on('canvasPan', async function() {
                   resSqau();
               });
               Hooks.on('createToken', async function() {
                   resSqau();
               });
               Hooks.on('deleteActor', async function() {
                   resSqau();
               });
               Hooks.on('deleteToken', async function() {
                   resSqau();
               });
               Hooks.on('updateToken', async function() {
                   resSqau();
    if (!(game.user.isGM)){

                   update_mask();
                 }
               });
           };
       }
   });

   Hooks.on("canvasReady", () => {
       if (minimap_data.shown == false) {
           return
       }
       initMap();


   });

   function initMap() {
    let dataURL = canvas.scene.img;
    if(canvas.background.isVideo)
    {
          const video = canvas.background.source;

          const canvas_html = document.createElement("canvas");
          // let aa_ratio = video.videoWidth/200
          // scale the canvas accordingly
          canvas_html.width = video.videoWidth;
          canvas_html.height = video.videoHeight;///aa_ratio;
          // draw the video at that frame
          canvas_html.getContext('2d')
            .drawImage(video, 0, 0, canvas_html.width, canvas_html.height);
          // convert it to a usable data URL
           dataURL = canvas_html.toDataURL();
    }


       if (minimap_data.minimapapp != null) {
           delete minimap_data.minimapapp;
           minimap_data.minimapapp = new MiniMapApp(dataURL, {
               title: "MiniMap"
           });
           minimap_data.minimapapp.render(true)
       } else {
           minimap_data.minimapapp = new MiniMapApp(dataURL, {
               title: "MiniMap"
           });
       }
   }

   function resSqau() {
       if (minimap_data.shown == false) {
           return
       }
       let w_ratio = (minimap_data.dimensionsx / minimap_data.imageWidth);
       let h_ratio = (minimap_data.dimensionsy / minimap_data.imageHeight);
       minimap_data.paddedX = canvas.dimensions.paddingX + (document.getElementById('board').width / window.devicePixelRatio / 2 / canvas.stage.scale.x);
       minimap_data.paddedY = canvas.dimensions.paddingY + (document.getElementById('board').height / window.devicePixelRatio / 2 / canvas.stage.scale.y);

       minimap_data['posx'] = (canvas.stage.pivot.x - minimap_data.paddedX) / w_ratio;
       minimap_data['posy'] = (canvas.stage.pivot.y - minimap_data.paddedY) / h_ratio;

       $('#mydiv')[0].style = `overflow: hidden; border: 2px solid red; height: ${minimap_data.squaresizeh/canvas.stage.scale.x}px; left: ${minimap_data.posx}px; position: absolute; top: ${minimap_data.posy}px; width: ${minimap_data.squaresizew/canvas.stage.scale.x}px;`


       for (usera of game.users) {

           let char = usera.data.character;
           if (char) {
               let toks = game.scenes.viewed.data.tokens.filter(w => w.actorLink == true && w.actorId == char).map(l => ({
                   'x': l.x,
                   'y': l.y,
                   '_id':l._id
               }))
               for (tok of toks) {

                   let aposx = (tok.x - canvas.dimensions.paddingX) / w_ratio;
                   let aposy = (tok.y - canvas.dimensions.paddingY) / h_ratio;
                    try
                    
 {                   
  minimap_data.minimap_actors[tok._id].style = `border-radius: 50%; position: absolute; height: 8px; width: 8px; background: ${usera.color}; left: ${aposx}px; top: ${aposy}px`;
                    }       catch{}
                               // wrapper.removeChild

               }
           }

       }
   }
