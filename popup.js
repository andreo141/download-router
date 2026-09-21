const addRuleBtn = document.getElementById("add-rule-btn");
const rulesList = document.getElementById("rules-list");

const getRules = async () => {
  const data = await browser.storage.local.get("rules");
  return data.rules;
};

const addListElement = (rule) => {
  const listElem = document.createElement("li");
  const listText = document.createTextNode(rule);
  listElem.appendChild(listText);
  rulesList.appendChild(listElem);
};

async function addRuleHandler() {
  const rules = await getRules();
  const rule = document.getElementById("add-rule-input").value;
  if (rule.trim() === "") return;
  rules.push(rule);
  addListElement(rule);
  await browser.storage.local.set({ rules });
  reset();
}

addRuleBtn.addEventListener("click", (e) => {
  addRuleHandler();
});

const populateExistingRules = (async () => {
  const rules = await getRules();
  rules.forEach((rule) => {
    addListElement(rule);
  });
})();

const reset = () => {
  document.getElementById("add-rule-input").value = "";
};
