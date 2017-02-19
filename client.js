var sharedb = require('sharedb/lib/client');
var $ = require('jQuery');
// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

// Create local Doc instance mapped to 'examples' collection document with id 'counter'
var jsons = []

function newJson() {
	var json = connection.get('examples', 'id' + Math.random().toString());
  json.create({});
  jsons.push(json);
	insertJsonManipulationElements(json.id)
  var callback = (function() {
    var id = json.id;
    return function(err){
      updateUIForJson(id);
    }
  })();
	json.subscribe(callback);
	json.on('op', callback);
}

function updateUIForJson(id) {
	for (var i = 0; i < jsons.length; i++) {
		if(jsons[i].id === id){	
	        var jsonDiv = $("#" + maskTheDot(id));
	        jsonDiv.empty();
	        jsonDiv.append("Json data type with id " + id);
	        jsonDiv.append("<div>");
	        jsonDiv.append(JSON.stringify(jsons[i].data));
	        jsonDiv.append("</div>");
		}
	};
}

function insertJsonManipulationElements(id) {
    var divElement = $("body").append("<div id=\"head"+id+"\">");
    divElement.append("<p>");
    divElement.append("<button id=\"insertJson"+id+"\" onclick=\"insertToJson('"+ id + "')\">Insert</button>");
    divElement.append("<input id=\"inputJson"+id+"\" type=\"text\"/>");
    divElement.append("</br>");
    divElement.append("<button id=\"deleteJson"+id+"\" onclick=\"deleteFromJson('"+ id + "')\">Delete</button>");
    divElement.append("</br>");
    divElement.append("<button id=\"replaceJson"+id+"\" onclick=\"replaceInJson('"+ id + "')\">Replace</button>");
    divElement.append("</br>");
    divElement.append("Path<input id=\"pathJson"+id+"\" type=\"text\"/>");
    divElement.append("</p>");
    $("body").append("</div>");
    $("body").append("<div id=\""+id+"\">");
    $("body").append("</div>");
}

function insertToJson(id) {
  for (var i = 0; i < jsons.length; i++) {
      if(jsons[i].id === id){ 
            var toInsert = $("#inputJson" + maskTheDot(id)).val();
            var where = $("#pathJson" + maskTheDot(id)).val().toString().split("/");
            jsons[i].submitOp([{p: where, oi: new String(toInsert)}]);
      }
  }
}

function deleteFromJson(id) {
    for (var i = 0; i < jsons.length; i++) {
		if(jsons[i].id === id){
      		var where = $("#pathJson" + maskTheDot(id)).val().toString().split("/");
      		jsons[i].submitOp([{p: where, od: null}]);
    	}
	}
}
function replaceInJson(id) {
    for (var i = 0; i < jsons.length; i++) {
		if(jsons[i].id === id){	
          var toInsert = $("#inputJson" + maskTheDot(id)).val();
          var where = $("#pathJson" + maskTheDot(id)).val().toString().split("/");
      		jsons[i].submitOp([{p: where, od: null, oi: toInsert}]);
    		}
	}
}
// When clicking on the '+1' button, change the number in the local
// document and sync the change to the server and other connected
// clients
function increment() {
  // Increment `doc.data.numClicks`. See
  // https://github.com/ottypes/json0 for list of valid operations.
  doc.submitOp([{p: ['numClicks'], na: 1}]);
}

function maskTheDot(id) {
  return id.replace(".", "\\.");
}

// Expose to index.html
global.newJson = newJson;
global.insertToJson = insertToJson;
global.deleteFromJson = deleteFromJson;
global.replaceInJson = replaceInJson;