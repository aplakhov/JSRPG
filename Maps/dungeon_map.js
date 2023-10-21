(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }
 if(typeof module === 'object' && module && module.exports) {
  module.exports = data;
 }})("dungeon_map",
{ "compressionlevel":-1,
 "height":30,
 "infinite":false,
 "layers":[
        {
         "data":[6, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
            6, 3, 3, 3, 6, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 6,
            6, 3, 6, 3, 3, 6, 6, 3, 3, 3, 6, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 6, 6, 3, 6,
            6, 3, 6, 6, 3, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 3, 6, 3, 6,
            6, 3, 6, 6, 6, 6, 3, 6, 6, 3, 3, 3, 6, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 6, 6, 3, 3, 3, 6,
            6, 3, 3, 3, 3, 6, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 6, 6, 6, 6, 3, 3, 6, 6, 6, 6, 6,
            6, 6, 6, 6, 3, 6, 6, 6, 3, 6, 6, 6, 3, 3, 3, 6, 6, 6, 3, 3, 3, 3, 6, 6, 3, 3, 6, 3, 6, 6,
            6, 3, 6, 6, 3, 3, 6, 6, 3, 6, 6, 6, 3, 6, 6, 6, 6, 6, 6, 6, 6, 3, 3, 6, 6, 3, 3, 3, 3, 6,
            6, 3, 3, 6, 6, 3, 3, 3, 3, 6, 3, 3, 3, 6, 3, 3, 3, 3, 3, 3, 6, 6, 3, 3, 6, 6, 6, 3, 6, 6,
            6, 6, 3, 3, 3, 3, 6, 6, 3, 6, 3, 6, 6, 6, 3, 6, 6, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 3, 6, 6,
            6, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 6, 3, 3, 3, 6, 6, 6, 6, 6, 3, 3, 6, 6, 3, 3, 6, 3, 3, 6,
            6, 3, 3, 3, 6, 6, 3, 3, 6, 6, 3, 3, 3, 6, 6, 6, 3, 3, 6, 6, 6, 3, 6, 6, 3, 6, 6, 6, 3, 6,
            6, 3, 6, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 6, 6, 3, 3, 3, 3, 6, 6, 3, 3, 6, 3, 3, 6, 3, 3, 6,
            6, 3, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 6, 3, 3, 3, 6, 6, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 6, 6,
            6, 3, 6, 6, 3, 6, 6, 3, 3, 6, 6, 3, 3, 3, 6, 6, 6, 3, 3, 6, 6, 6, 3, 6, 6, 3, 6, 6, 6, 6,
            6, 3, 3, 3, 3, 3, 6, 3, 6, 6, 6, 3, 6, 6, 6, 6, 6, 6, 3, 6, 6, 6, 3, 6, 6, 3, 3, 6, 6, 6,
            6, 3, 6, 6, 6, 3, 6, 3, 3, 3, 3, 3, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 3, 6, 6, 3, 6, 6, 3, 6,
            6, 6, 6, 3, 3, 3, 6, 6, 3, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 3, 3, 6, 3, 3, 6, 3, 6, 3, 3, 6,
            6, 6, 3, 3, 6, 3, 3, 6, 3, 3, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 3, 6, 6, 3, 3, 3, 6, 3, 6, 6,
            6, 3, 3, 6, 6, 3, 6, 6, 6, 3, 3, 6, 6, 3, 3, 6, 6, 3, 3, 6, 3, 3, 6, 6, 3, 6, 6, 3, 3, 6,
            6, 3, 6, 6, 3, 3, 6, 3, 6, 6, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 6, 3, 6,
            6, 6, 6, 3, 3, 6, 6, 3, 6, 6, 3, 3, 6, 6, 6, 3, 6, 6, 6, 6, 3, 6, 3, 3, 6, 3, 3, 3, 3, 6,
            6, 6, 3, 3, 6, 6, 3, 3, 3, 6, 6, 3, 6, 3, 6, 6, 6, 6, 6, 3, 3, 6, 3, 6, 6, 3, 6, 6, 3, 6,
            6, 3, 3, 6, 6, 3, 3, 6, 3, 3, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 6, 6, 6, 6, 6, 3, 6, 6, 6, 6,
            6, 3, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 6, 6, 6, 6, 3, 3, 6, 6, 6, 3, 3, 3, 6, 3, 3, 3, 3, 6,
            6, 6, 6, 3, 3, 3, 3, 3, 6, 3, 6, 3, 3, 3, 3, 6, 3, 6, 6, 3, 3, 3, 6, 3, 6, 3, 6, 6, 3, 6,
            6, 3, 3, 3, 6, 6, 6, 3, 6, 6, 6, 3, 6, 6, 3, 3, 3, 3, 3, 3, 6, 3, 6, 3, 6, 6, 6, 3, 3, 6,
            6, 3, 6, 3, 6, 3, 6, 3, 3, 3, 3, 3, 3, 6, 6, 6, 3, 6, 6, 6, 6, 3, 6, 3, 3, 3, 6, 3, 6, 6,
            6, 3, 3, 3, 3, 3, 6, 3, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 6, 3, 6, 3, 3, 3, 6, 6,
            6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
         "height":30,
         "id":1,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":30,
         "x":0,
         "y":0
        }, 
        {
         "draworder":"topdown",
         "id":2,
         "name":"Object Layer 1",
         "objects":[
                {
                 "class":"Darkness",
                 "height":981.993157894737,
                 "id":1,
                 "name":"\u0422\u0435\u043c\u043d\u043e\u0442\u0430",
                 "rotation":0,
                 "visible":true,
                 "width":985.757610619469,
                 "x":-12.2081020027946,
                 "y":-10.3258756404282
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":2,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":48.067070330694,
                 "y":239.21751280857
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":14,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":335.351653469958,
                 "y":306.287843502562
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":15,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":881.97484862599,
                 "y":209.035863996274
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":16,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":879.73917093619,
                 "y":46.9492314857942
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":17,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":556.68374476013,
                 "y":461.667442943642
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":18,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":623.754075454122,
                 "y":434.839310666046
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":19,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":718.77037727061,
                 "y":718.77037727061
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":20,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":751.187703772706,
                 "y":696.413600372613
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":21,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":239.21751280857,
                 "y":652.817885421518
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":22,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":45.8313926408943,
                 "y":784.722869119702
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":23,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":46.9492314857941,
                 "y":655.053563111318
                }, 
                {
                 "class":"Mob",
                 "height":0,
                 "id":24,
                 "name":"\u041d\u0435\u043f\u043e\u043d\u044f\u0442\u043d\u0430\u044f \u043f\u043e\u0434\u0437\u0435\u043c\u043d\u0430\u044f \u0442\u0432\u0430\u0440\u044c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"slug"
                        }, 
                        {
                         "name":"Loot",
                         "type":"string",
                         "value":""
                        }, 
                        {
                         "name":"Rules",
                         "type":"string",
                         "value":"slug"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":48.067070330694,
                 "y":528.737773637634
                }],
         "opacity":1,
         "type":"objectgroup",
         "visible":true,
         "x":0,
         "y":0
        }],
 "nextlayerid":3,
 "nextobjectid":25,
 "orientation":"orthogonal",
 "renderorder":"right-down",
 "tiledversion":"1.9.2",
 "tileheight":32,
 "tilesets":[
        {
         "firstgid":1,
         "source":"Tiled\/Logical.tsx"
        }],
 "tilewidth":32,
 "type":"map",
 "version":"1.9",
 "width":30
});