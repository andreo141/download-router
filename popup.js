const addRuleBtn = document.getElementById("add-rule-btn");

const getRules = async () => {
  const data = await browser.storage.local.get("rules");
  return data.rules;
};

async function addRuleHandler() {
  const rules = await getRules();
  const rule = document.getElementById("add-rule-input").value;
  rules.push(rule);
  await browser.storage.local.set({ rules });
}

addRuleBtn.addEventListener("click", (e) => {
  addRuleHandler();
});
