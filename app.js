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
  var ha = {text:"haushalt", children : [], wert:0};
  if(node.einzelplan) {
    node.einzelplan.forEach(function(plan){
      if(plan.kapitel.length < 1) {
        console.log("Empty Einzelplan: " +  plan.text);
      }

      var ei = {text : "EP: " + plan.text, children : [], wert:0};
      var eisum = 0;

      plan.kapitel.forEach(function(kapitel) {
        if(!kapitel.ausgaben) {
          console.log("Keine Ausgaben in: " + kapitel.text);
          return;
        }
        else if(kapitel.ausgaben.length < 1) {
          console.log("Empty Kapitel: " +  kapitel.text);
        }

        var ka = {text : "KA: " + kapitel.text, children : [], wert:0};

        kapitel.ausgaben.forEach(function(ausgabe) {
          //////////////////////////////////////////////////////////////////
          function addToSum(obj, value) {
            obj.wert += parseFloat(value);
          }

          function processTitel(titel) {
            // console.log(titel.text);
            if(titel.soll.length > 1)
              console.log("LENGTH: " + titel.soll.length);
            if(titel.soll[0].$.wert !== 0) {
              if(!(titel.soll[0].$.wert)) {
                console.log("Kein Wert in: " + titel.text);
                console.log("Stattdessen: " +titel.soll[0].wert);
              }
            }
            var wert = titel.soll[0].$.wert;
            addToSum(ka, wert);
            addToSum(ei, wert);
            addToSum(ha, wert);
            var cur = {text : titel.text + ": " + wert, wert: wert};
            return cur;
          }
          //////////////////////////////////////////////////////////////////
          var entry_found;
          // var easum = 0;
          // var sonsum = 0;
          // var tgsum = 0;

          if(ausgabe.einnahmen_ausgaben_art) {
            entry_found = true;
            // console.log("ea art");
            var eas = {text:"ea-art: ", children:[], wert: 0};
            var easum;
            ausgabe.einnahmen_ausgaben_art.forEach(function(ea_art) {
              easum = 0;
              var ea = {text : ea_art.text, children : [], wert:0};
              ea_art.titel.forEach(function(titel) {
                var t = processTitel(titel);
                addToSum(ea, t.wert);
                ea.children.push(t);
              });
              addToSum(eas, ea.wert);
              ea.text += " --- " + ea.wert;
              eas.children.push(ea);
            });
            eas.text += " --- " + eas.wert;
            ka.children.push(eas);
          }
          if(ausgabe.titel) {
            entry_found = true;
            // console.log("titel");
            var tit = {text:"sonstiges",children:[], wert: 0};
            var sonsum = 0;
            ausgabe.titel.forEach(function(titel) {
              var t = processTitel(titel);
              addToSum(tit, t.wert);
              tit.children.push(t);
            });
            tit.text += " --- " + tit.wert;
            ka.children.push(tit);
          }
          if(ausgabe.titelgruppe) {
            entry_found = true;
            var tgs = {text: "titelgruppen", children:[], wert: 0};
            if(ausgabe.titelgruppe.text) {
              console.log(ei.text + ".." + ka.text + ".." + tg.text);
            }


            ausgabe.titelgruppe.forEach(function(titelgruppe) {
              var tg = {text : titelgruppe.text, children : [], wert:0};
              titelgruppe.titel.forEach(function(titel) {
                var t = processTitel(titel);
                addToSum(tg, t.wert);
                tg.children.push(t);
              });
              addToSum(tgs, tg.wert);
              tg.text += " --- " + tg.wert;
              tgs.children.push(tg);
            });
            tgs.text += " --- " + tgs.wert;
            ka.children.push(tgs);
          }
          if (!entry_found) {
            console.log("No entry in  plan:" + plan.text +" --- kapitel: " + ka.text);
            console.log(ausgabe);
            return;
          }
          // ka.children.push(au);
        });
        ka.text += " --- " + ka.wert;
        ei.children.push(ka);
      });
      ei.text += " --- " + ei.wert;
      ha.children.push(ei);
    });
  }
  else {
    console.log("Unexpected root: " + node);
  }
  ha.text += " --- " + ha.wert;
  return ha;
}
tree = parse(haushaltobj.haushalt);
var haushaltjsonpathtree = 'public/data/haushalt_2016tree.json';
jsonfile.writeFileSync(haushaltjsonpathtree, tree);

var port = 3000;
http.createServer(app).listen(port);
console.log("server listening at " + port);
