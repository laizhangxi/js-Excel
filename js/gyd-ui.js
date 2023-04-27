const gydSelect = (() => {
  let props = {};
  const init = (prame) => {
    props[prame.id] = prame;
    console.log(props, 'props=====');
    if (!props[prame.id].placeholder) {
      props[prame.id].placeholder = "请选择";
    }
    if (props[prame.id].emptyItem && props[prame.id].options.length > 0) {
      props[prame.id].options.unshift({ label: "-清空-", value: "" });
    }
    const selectDom = document.querySelector(`#${props[prame.id].id}`);
    if (props[prame.id].align) {
      selectDom.style.textAlign = props[prame.id].align;
    }
    let defaultIndex = props[prame.id].defaultIndex;
    if (typeof defaultIndex === "number" && props[prame.id].options.length > defaultIndex) {
      if (props[prame.id].emptyItem) {
        defaultIndex++;
      }
      selectDom.innerHTML = `<div class="select-value" value=${JSON.stringify(props[prame.id].options[defaultIndex].value)}>${props[prame.id].options[defaultIndex].label}</div>`;
    } else {
      selectDom.innerHTML = `<div class="select-placeholder">${props[prame.id].placeholder}</div>`;
    }
    selectDom.removeEventListener("click", selectClick);
    selectDom.addEventListener("click", selectClick);
  };
  const selectClick = (event) => {
    const selectDom = event.target.parentNode;
    if (!selectDom.classList.contains('gyd-select')) {
      return
    }
    const optionContain = selectDom.querySelector(".options-contain");
    if (!optionContain) {
      // // 加载options
      renderOptions(selectDom);
    } else {
      gyd.switchNoneBlock(optionContain);
    }
  };
  const change = (id, label, value, index) => {
    props[id].change({ label, index, value: gyd.parse(value) });
  };

  const getData = (prame) => {
    let valueDom = document.querySelector(`#${prame.id} .select-value`);
    if (!valueDom) {
      return;
    }
    let value = valueDom.getAttribute("value");
    value = gyd.parse(value);
    let label = valueDom.innerText;
    if (prame.type === "value") {
      return value;
    }
    if (prame.type === "label") {
      return label;
    }
    return { label, value };
  };
  const reLoad = (prame) => {
    for (const key in props) {
      if (key === prame.id) {
        let newProps = { ...props[key], ...prame };
        props[key] = newProps
        init(newProps);
      }
    }
  };
  const renderOptions = (selectDom) => {
    let id = selectDom.getAttribute('id')
    let selectDomWidth = selectDom.offsetWidth + "px";
    let optionStr = `<div class="options-contain" style="min-width: ${selectDomWidth};">`;
    props[id].options.forEach((option, index) => {
      let newIndex = index;
      if (props[id].emptyItem) {
        newIndex--;
      }
      optionStr += `<div class="option-item" index="${newIndex}" value=${JSON.stringify(option.value)}>${option.label}</div>`;
    });
    optionStr += "</div>";
    selectDom.append(gyd.parseTdDom(optionStr)[0]);
    // option添加点击事件(事件代理)
    let optionsDom = selectDom.querySelector(".options-contain");
    optionsDom.addEventListener("click", (event) => {
      event.stopPropagation();
      const label = event.target.innerText;
      const value = event.target.getAttribute("value");
      let index = +event.target.getAttribute("index");
      optionClick(optionsDom, selectDom, label, value, index);
      if (typeof props[id].change === "function") {
        change(id, label, value, index);
      }
    });
  };
  const optionClick = (optionsDom, selectDom, label, value, index) => {
    let valDom = selectDom.querySelector(".select-placeholder") || selectDom.querySelector(".select-value");
    if (index === -1) {
      valDom.classList.remove("select-value");
      valDom.classList.add("select-placeholder");
      valDom.innerText = props.placeholder;
      valDom.removeAttribute("value");
    } else {
      valDom.classList.remove("select-placeholder");
      valDom.classList.add("select-value");
      valDom.innerText = label;
      valDom.setAttribute("value", value);
    }
    optionsDom.style.display = "none";
  };

  return { init, getData, reLoad };
})();

const gydDialog = {
  init: (props) => {
    let dialogName = "dialog-" + Date.now();
    let dialogHtmlStr = `<div class="gyd-dialog-contain" name="${dialogName}"><div class="dialog-content" style="width: ${props.width};height: ${props.height}"><div class="dialog-form"></div></div></div>`;
    document.querySelector("body").append(gyd.parseDom(dialogHtmlStr)[0]);
    let dialogForm = document.querySelector(`.gyd-dialog-contain[name="${dialogName}"] .dialog-form`);
    dialogForm.before(gyd.parseDom(`<div class="dialog-title">${props.title}</div>`)[0]);
    props.content.forEach((item) => {
      if (item.type === "select") {
        dialogForm.append(gyd.parseDom(`<div class="form-item"><div class="form-label" style="width: ${props.labelWidth}">${item.label}</div><div class="gyd-select" id="${item.id}"></div></div>`)[0]);
        gydSelect.init(item);
      }
      if (item.type === "input") {
        dialogForm.append(gyd.parseDom(`<div class="form-item"><div class="form-label" style="width: ${props.labelWidth}">${item.label}</div><input value="${item.value || ""}" class="gyd-input" autocomplete="off" id="${item.id}"></div>`)[0]);
      }
    });
    let dialogContent = document.querySelector(`.gyd-dialog-contain[name="${dialogName}"] .dialog-content`);
    dialogContent.append(gyd.parseDom(`<div class="dialog-footer"></div>`)[0]);
    let dialogFooter = document.querySelector(`.gyd-dialog-contain[name="${dialogName}"] .dialog-footer`);
    props.btns.forEach((item) => {
      let btn = gyd.parseDom(`<div class="gyd-button">${item.name}</div>`)[0];
      dialogFooter.append(btn);
      btn.addEventListener("click", () => {
        if (typeof item.click === "function") {
          item.click(getFormData(props.content), dialogName);
        }
        if (!item.stopClose) {
          gydDialog.close(dialogName);
        }
      });
    });

    const getFormData = (content) => {
      let obj = {};
      content.forEach((item) => {
        if (item.type === "input") {
          obj[item.id] = document.querySelector(`.gyd-dialog-contain[name="${dialogName}"] #${item.id}`).value;
        }
        if (item.type === "select") {
          let selectDom = document.querySelector(`.gyd-dialog-contain[name="${dialogName}"] #${item.id} .select-value`);
          obj[item.id] = gyd.parse(selectDom.getAttribute("value"));
        }
      });
      return obj;
    };
  },
  close: (dialogName) => {
    document.querySelector(`.gyd-dialog-contain[name="${dialogName}"]`).remove();
  },
};

const gydMessage = {
  init: (props) => {
    let messageDom = gyd.parseDom(`<div class="gyd-message ${props.type || "info"}">${props.text}</div>`)[0];
    document.querySelector("body").append(messageDom);
    setTimeout(() => {
      messageDom.remove();
    }, props.duration || 2000);
  },
};

const gydSelectButton = {
  init: (props) => {
    let dom = document.querySelector("#" + props.id);
    let text = dom.innerText.trim();
    // let buttonDom = gyd.parseDom(`<div class="select-button">${text}</div>`)[0]
    // dom.append(buttonDom)
    let selectButton = gyd.parseDom(`<div class="select-button">${text}</div>`)[0];
    if (typeof props.defaultIndex === "number") {
      selectButton.setAttribute("activeIndex", props.defaultIndex);
      selectButton.innerText = props.btns[props.defaultIndex].showName;
    }
    selectButton.addEventListener("click", () => {
      let activeIndex = selectButton.getAttribute("activeIndex");
      if (activeIndex) {
        optionContain.childNodes[activeIndex].click();
      }
      if (typeof props.btnClick === "function") {
        props.btnClick();
      }
    });
    dom.innerHTML = "";
    dom.append(selectButton);
    let buttonIcon = gyd.parseDom(`<div class="select-button-icon">∨</div>`)[0];
    buttonIcon.addEventListener("click", () => {
      gyd.switchNoneBlock(optionContain);
    });
    dom.append(buttonIcon);
    let optionContain = gyd.parseDom('<div class="button-option-contain" style="display: none"></div>')[0];
    dom.append(optionContain);
    props.btns.forEach((btn, index) => {
      let optionDom = gyd.parseDom(`<div class="button-option">${btn.showName}</div>`)[0];
      optionDom.addEventListener("click", () => {
        if (props.switchShowName) {
          selectButton.innerText = btn.showName;
          selectButton.setAttribute("activeIndex", index);
        }
        if (typeof btn.click === "function") {
          btn.click(JSON.parse(JSON.stringify(btn)));
        }
        optionContain.style.display = "none";
      });
      optionContain.append(optionDom);
    });
  },
};
