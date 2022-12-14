(function(name,data){
 if(typeof onTileMapLoaded === 'undefined') {
  if(typeof TileMaps === 'undefined') TileMaps = {};
  TileMaps[name] = data;
 } else {
  onTileMapLoaded(name,data);
 }
 if(typeof module === 'object' && module && module.exports) {
  module.exports = data;
 }})("town_map",
{ "compressionlevel":-1,
 "height":42,
 "infinite":false,
 "layers":[
        {
         "data":[4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 7, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 7, 7, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 7, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 7, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 7, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 7, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 7, 7, 7, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 1, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 4, 7, 7, 7, 7, 4, 1, 1, 7, 1, 1, 1, 7, 7, 7, 7, 1, 1, 1, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 7, 7, 7, 7, 1, 1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 1, 1, 7, 7, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4,
            1, 4, 7, 7, 7, 7, 4, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 7, 4, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4, 4,
            1, 1, 7, 7, 7, 7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 4, 4, 4, 4, 4,
            1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 7, 7, 7, 7, 7, 7, 7, 7, 4, 7, 3, 3, 3, 3, 3, 3, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 2, 2, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 7, 7, 7, 4, 7, 7, 7, 7, 1, 1, 1, 1, 1, 3, 4, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 2, 2, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 7, 7, 7, 7, 7, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 2, 2, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 4, 1, 1, 1, 1, 2, 2, 2, 2, 4,
            1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2,
            1, 1, 4, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2,
            3, 3, 3, 3, 1, 1, 1, 4, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 4, 4, 4, 1, 1, 2, 2,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 2, 2, 1, 1, 1, 4, 4, 4, 4, 4, 4, 1, 1, 2,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 3, 3, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
            1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
         "height":42,
         "id":1,
         "name":"Tile Layer 1",
         "opacity":1,
         "type":"tilelayer",
         "visible":true,
         "width":56,
         "x":0,
         "y":0
        }, 
        {
         "draworder":"topdown",
         "id":2,
         "name":"Object Layer 1",
         "objects":[
                {
                 "class":"BigScaryObject",
                 "height":0,
                 "id":5,
                 "name":"\u0422\u0430\u0432\u0435\u0440\u043d\u0430",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"tavern_textured"
                        }, 
                        {
                         "name":"ScriptName",
                         "type":"string",
                         "value":"tavern"
                        }, 
                        {
                         "name":"ZeroX",
                         "type":"int",
                         "value":64
                        }, 
                        {
                         "name":"ZeroY",
                         "type":"int",
                         "value":64
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":480.78854215184,
                 "y":888.145319049837
                }, 
                {
                 "class":"DecorativeObject",
                 "height":0,
                 "id":6,
                 "name":"\u0422\u0430\u0431\u043b\u0438\u0447\u043a\u0430",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"tablet"
                        }, 
                        {
                         "name":"Message",
                         "type":"string",
                         "value":"\u0422\u0430\u0432\u0435\u0440\u043d\u0430 \"\u041e \u0449\u0438\u0442\""
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":429.250116441546,
                 "y":912.737773637634
                }, 
                {
                 "class":"BigScaryObject",
                 "height":0,
                 "id":7,
                 "name":"\u0411\u0430\u0448\u043d\u044f",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"town_tower"
                        }, 
                        {
                         "name":"ScriptName",
                         "type":"string",
                         "value":"tower"
                        }, 
                        {
                         "name":"ZeroX",
                         "type":"int",
                         "value":128
                        }, 
                        {
                         "name":"ZeroY",
                         "type":"int",
                         "value":96
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":708.709827666512,
                 "y":970.865393572427
                }, 
                {
                 "class":"BigScaryObject",
                 "height":0,
                 "id":10,
                 "name":"\u0427\u0435\u0439-\u0442\u043e \u0434\u043e\u043c",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"simple_house_textured"
                        }, 
                        {
                         "name":"ScriptName",
                         "type":"string",
                         "value":"house"
                        }, 
                        {
                         "name":"ZeroX",
                         "type":"int",
                         "value":32
                        }, 
                        {
                         "name":"ZeroY",
                         "type":"int",
                         "value":64
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":99.0228225430834,
                 "y":883.673963670238
                }, 
                {
                 "class":"Player",
                 "height":0,
                 "id":11,
                 "name":"\u0418\u0433\u0440\u043e\u043a",
                 "point":true,
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":685.235211923614,
                 "y":1329.96832789939
                }, 
                {
                 "class":"BigScaryObject",
                 "height":0,
                 "id":12,
                 "name":"\u0414\u043e\u043c-\u0434\u0435\u0440\u0435\u0432\u043e \u044d\u043b\u044c\u0444\u043e\u0432",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"elven_house"
                        }, 
                        {
                         "name":"ScriptName",
                         "type":"string",
                         "value":"elvenHouse"
                        }, 
                        {
                         "name":"ZeroX",
                         "type":"int",
                         "value":124
                        }, 
                        {
                         "name":"ZeroY",
                         "type":"int",
                         "value":124
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":1345.87796925943,
                 "y":959.687005123428
                }, 
                {
                 "class":"DecorativeObject",
                 "height":0,
                 "id":13,
                 "name":"\u0424\u043e\u043d\u0442\u0430\u043d",
                 "point":true,
                 "properties":[
                        {
                         "name":"Blocker",
                         "type":"string",
                         "value":"true"
                        }, 
                        {
                         "name":"Fire",
                         "type":"string",
                         "value":"3"
                        }, 
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"water_well"
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":525.384257102934,
                 "y":1011.10759198882
                }, 
                {
                 "class":"BigScaryObject",
                 "height":0,
                 "id":14,
                 "name":"\u0426\u0435\u0440\u043a\u043e\u0432\u044c \u043a\u043e\u0442\u0438\u0437\u043c\u0430",
                 "point":true,
                 "properties":[
                        {
                         "name":"Image",
                         "type":"string",
                         "value":"church"
                        }, 
                        {
                         "name":"ScriptName",
                         "type":"string",
                         "value":"church"
                        }, 
                        {
                         "name":"ZeroX",
                         "type":"int",
                         "value":80
                        }, 
                        {
                         "name":"ZeroY",
                         "type":"int",
                         "value":140
                        }],
                 "rotation":0,
                 "visible":true,
                 "width":0,
                 "x":462.785281788542,
                 "y":350.166744294364
                }],
         "opacity":1,
         "type":"objectgroup",
         "visible":true,
         "x":0,
         "y":0
        }],
 "nextlayerid":3,
 "nextobjectid":15,
 "orientation":"orthogonal",
 "renderorder":"left-down",
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
 "width":56
});