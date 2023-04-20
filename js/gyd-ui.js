const gydSelect = {
  init: (props) => {
    if (!props.placeholder) {
      props.placeholder = "请选择";
    }
    if (props.emptyItem && props.options.length > 0) {
      props.options.unshift({ label: "-清空-", value: "" });
    }
    const selectDom = document.querySelector(`#${props.id}`);
    if (props.align) {
      selectDom.style.textAlign = props.align;
    }
    let defaultIndex = props.defaultIndex;
    if (typeof defaultIndex === "number" && props.options.length > defaultIndex) {
      if (props.emptyItem) {
        defaultIndex++;
      }
      selectDom.innerHTML = `<div class="select-value">${props.options[defaultIndex].label}</div>`;
    } else {
      selectDom.innerHTML = `<div class="select-placeholder">${props.placeholder}</div>`;
    }

    selectDom.addEventListener("click", () => {
      const optionContain = selectDom.querySelector(".options-contain");
      if (!optionContain) {
        // 加载options
        let selectDomWidth = selectDom.offsetWidth + "px";
        let optionStr = `<div class="options-contain" style="min-width: ${selectDomWidth}">`;
        props.options.forEach((option) => {
          optionStr += `<div class="option-item" value="[${option.value}]">${option.label}</div>`;
        });
        optionStr += "</div>";
        selectDom.append(gyd.parseTdDom(optionStr)[0]);
        // option添加点击事件
        const optionList = selectDom.querySelectorAll(".option-item");
        optionList.forEach((option) => {
          const label = option.innerText;
          const value = option.getAttribute("value");
          option.addEventListener("click", (event) => {
            event.stopPropagation();
            optionClick(props, selectDom, label, value);
          });
        });
      } else {
        gyd.switchNoneBlock(optionContain);
      }
    });

    const optionClick = (props, selectDom, label, value) => {
      let placeholderDom = selectDom.querySelector(".select-placeholder") || selectDom.querySelector(".select-value");
      if (value !== "[]") {
        placeholderDom.classList.remove("select-placeholder");
        placeholderDom.classList.add("select-value");
        placeholderDom.innerText = label;
        placeholderDom.setAttribute("value", value);
      } else {
        placeholderDom.classList.remove("select-value");
        placeholderDom.classList.add("select-placeholder");
        placeholderDom.innerText = props.placeholder;
        placeholderDom.removeAttribute("value");
      }
      // option改变事件
      if (typeof props.change === "function") {
        change(props, label, value);
      }
      const optionContain = selectDom.querySelector(".options-contain");
      optionContain.style.display = "none";
    };

    const change = (props, label, value) => {
      props.change({ label, value: gyd.parseSelectValue(value) });
    };
  },
  getData: () => {
    console.log();
  },
};

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
          obj[item.id] = gyd.parseSelectValue(selectDom.getAttribute("value"));
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
