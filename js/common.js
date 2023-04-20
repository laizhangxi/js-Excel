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
  parseSelectValue: (value) => {
    let valueTemp = eval(value);
    if (valueTemp.length === 0) {
      value = "";
    } else if (valueTemp.length === 1) {
      value = valueTemp[0];
    } else if (valueTemp.length > 1) {
      value = valueTemp;
    }
    return value
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
