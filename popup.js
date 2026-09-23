const addRuleBtn = document.getElementById("add-rule-btn");
const rulesList = document.getElementById("rules-list");

const getRules = async () => {
  const data = await browser.storage.local.get("rules");
  return data.rules;
};

const addListElement = (rule) => {
  const listElem = document.createElement("li");
  const listText = document.createTextNode(rule);

  const deleteBtn = document.createElement("button");
  deleteBtn.dataset.rule = rule;
  deleteBtn.textContent = "delete";

  listElem.appendChild(listText);
  listElem.appendChild(deleteBtn);
  rulesList.appendChild(listElem);
};

async function deleteRuleHandler(ruleToDelete, deleteRuleBtn) {
  let rules = await getRules();
  rules = rules.filter((rule) => ruleToDelete !== rule);
  deleteRuleBtn.parentElement.remove();
  await browser.storage.local.set({ rules });
}

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

rulesList.addEventListener("click", (e) => {
  const deleteRuleBtn = e.target.closest("[data-rule]");
  if (deleteRuleBtn) {
    const ruleToDelete = deleteRuleBtn.dataset.rule;
    deleteRuleHandler(ruleToDelete, deleteRuleBtn);
  }
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
