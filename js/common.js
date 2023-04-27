const gyd = {
  parseTdDom: (nodelist) => {
    var objE = document.createElement("tr");
    objE.innerHTML = nodelist;
    return objE.childNodes;
  },
  parseDom: (nodelist) => {
    var objE = document.createElement("div");
    objE.innerHTML = nodelist;
    return objE.childNodes;
  },
  parse: (value) => {
    let tempValue = value
    try {
      tempValue = JSON.parse(value)
    } catch (error) {
      tempValue = value
    }
    return tempValue
  },
  switchNoneBlock: (dom) => {
    let oriDisplay = dom.style.display;
    if (oriDisplay === "none") {
      dom.style.display = "block";
    } else {
      dom.style.display = "none";
    }
    
  }
};
