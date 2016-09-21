'use strict;';

var express = require('express');
var https = require('https');
var http = require('http');
var xml2js = require('xml2js');
var fs = require('fs');
var jsonfile = require('jsonfile');

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('*', function(req,res) {
  console.warn('path: ' + req.url);
  res.sendStatus(404);
});



var haushaltjsonpath = 'public/data/haushalt_2016.json';
var haushaltobj;

// From XML
// var parseString = xml2js.parseString;
// var xml = fs.readFileSync("public/data/Haushalt_2016.xml");
// parseString(xml, {async:false}, function (err, result) {
//     haushaltobj = result;
// });
//jsonfile.writeFileSync(haushaltjsonpath, haushaltobj);

// From JSON
haushaltobj = jsonfile.readFileSync(haushaltjsonpath);

var OC = {}.constructor;
function recurse(node) {
  if(node.constructor === Array) {
    var arr =[];
    node.forEach(function(item){
      arr.push(recurse(item));
    });
    node = arr;
    return node;
  }
  else if (node.constructor === OC) {
    Object.keys(node).forEach(function(key) {
      var value = node[key];

      if(key === "einnahmen") {
        value = {};
      }
      else if(key === "wert") {
        value = {text : value};
        console.log(value);
      }
      else if(value.constructor === Array) {
        var children = [];
        value.forEach(function(item){
          if(key === 'einzelplan') {
            console.log(item.$.nr);
          }
          var newchild = recurse(item);
          children.push(newchild);
        });
        node.children = children;
      }
      else {
        value = recurse(value);
      }
    });
    return node;
  }
  else {
    return node;
  }
}


function parse(node) {
  var tree = {text:"haushalt", children : []};
  if(node.einzelplan) {
    node.einzelplan.forEach(function(plan){
      var ei = {text : "EP: " + plan.text, children : []};
      plan.kapitel.forEach(function(kapitel) {
        // console.log("kapitel: " + kapitel.text)
        var ka = {text : "KA: " + kapitel.text, children : []};
        if(!kapitel.ausgaben) {
          console.log("Keine Ausgaben in: " + kapitel.text);
          return;
        }
        kapitel.ausgaben.forEach(function(ausgabe) {
          function processTitel(titel) {
            // console.log(titel.text);
            if(titel.soll.length > 1)
              console.log("LENGTH: " + titel.soll.length);
            else if(!(titel.soll[0].wert)) {
              // console.log("Kein Wert in: " + titel.text);
            }
            var cur = {text : titel.text + ": " + titel.soll[0].$.wert};
            return cur;
          }
          var au;
          if(ausgabe.einnahmen_ausgaben_art) {
            // console.log("ea art");
            au = {text:"ea-art: ", children:[]};
            ausgabe.einnahmen_ausgaben_art.forEach(function(ea_art) {
              var aua = {text : ea_art.text, children : []};
              ea_art.titel.forEach(function(titel) {
                aua.children.push(processTitel(titel));
              });
              au.children.push(aua);
            });
          }
          else if(ausgabe.titel) {
            // console.log("titel");
            au = {text:"sonstiges",children:[]};
            ausgabe.titel.forEach(function(titel) {
              au.children.push(processTitel(titel));
            });
          }
          else if(ausgabe.titelgruppe) {
            au = {text: "titelgruppen", children:[]};
            if(ausgabe.titelgruppe.text) {
              console.log(ei.text + ".." + ka.text + ".." + tg.text);
            }
            ausgabe.titelgruppe.forEach(function(titelgruppe) {
              var tg = {text : titelgruppe.text, children : []};
              titelgruppe.titel.forEach(function(titel) {
                tg.children.push(processTitel(titel));
              });
              au.children.push(tg);
            });
          }
          else {
            console.log("Unexpected in  kapitel.ausgaben: " + JSON.stringify(ausgabe, null, 2));
            return;
          }
          ka.children.push(au);
        });
        ei.children.push(ka);
      });
      tree.children.push(ei);
    });
  }
  else {
    console.log("Unexpected root: " + node);
  }
  return tree;
}
tree = parse(haushaltobj.haushalt);
var haushaltjsonpathtree = 'public/data/haushalt_2016tree.json';
jsonfile.writeFileSync(haushaltjsonpathtree, tree);

var port = 3000;
http.createServer(app).listen(port);
console.log("server listening at " + port);
