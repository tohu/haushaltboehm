var xmlToJson2 = function(rootxml)
  {
    var DEF = 0;
    var EIN = 1;
    var AUS = 3;
    var NAME = 2;

    function recurse(xml, depth, mode) {



      if(mode === DEF) {
        var newnode = {name:'ERROR',size:0};
        if(xml.tagName ==='haushalt') {
          newnode = {name:'haushalt'};
          newnode.children = [];
          for(var i = 0; i < xml.childNodes.length; i++) {
            var child = xml.childNodes[i];
            newnode.children.push(recurse(child, depth +1, DEF));
          }
        }
        else if(xml.tagName === 'einzelplan') {
          var name = recurse(xml, depth, NAME);
          var size = recurse(xml, depth, AUS);
          console.log(size);
          newnode = {name:name, size:size};
        }
        return newnode;
      }
      else if(mode === EIN) {
        return 1;
      }
      else if(mode === AUS) {
        if(xml.tagName === 'einnahmen') {
          return 1;
        }
        else if(xml.tagName === 'ausgaben') {
          var sum = 0;
          for(var i = 0; i < xml.childNodes.length; i++) {
            var child = xml.childNodes[i];
            sum += recurse(child, depth +1, AUS);
          }
          return sum;
        }
        else if(xml.tagName === 'soll') {
          var wert = xml.getAttribute('wert');
          wert = parseInt(wert);
          return wert;
        }
        else {
          var sum = 0;
          for(var i = 0; i < xml.childNodes.length; i++) {
            var child = xml.childNodes[i];
            sum += recurse(child, depth +1, AUS);
          }
          return sum;
        }
      }
      else if(mode===NAME) {
        var name = "NO NAME CHILDS";
        if (xml.hasChildNodes()) {
          name = "NO NAME TEXT";
          for(var i = 0; i < xml.childNodes.length; i++) {
            var child = xml.childNodes[i];
            if(child.tagName === "text") {
              name = child.innerHTML;
            }
          }
        }
        return name;
      }
    }

    return recurse(rootxml.firstChild, 0, DEF);
  };

var xmlToJson = function(draw)
{
  d3.xml("../data/Haushalt_2016.xml", function(error, xml) {
    var json = xmlToJson2(xml);
    draw(json);
  });
};