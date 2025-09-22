const openAds = [
"/ad ^*^3Myers Morning Shack^0 is ^1OPEN^0! Delicious 🍩 ^9Donuts^0, House ☕ ^1Coffee^0, and Aromatic 🚬 ^7Ciggies^0 | Located behind ^5LSC Back Gate^0!",
"/ad ^*^3Myers Morning Shack^0 is ^1OPEN^0! ^9🍩LIMITED TIME DONUT^0🍩 is ^9AVAILABLE!^0 | Located behind ^5LSC Back Gate^0!",
"/ad ^*^3Myers Morning Shack^0 now has a ^1INSERT AMOUT HERE^0 TAB thanks to ^7INSERT NAME^0!",
"/ad ^*^3Myers Morning Shack^0 is ^1OPEN^0! ^9🍩LIMITED TIME DONUT^0🍩 is ^9AVAILABLE!^0 | Located behind ^5LSC Back Gate^0! ^8 INDOORS TODAY^0!"
];

const closingAds = [
"/ad ^*^3Myers Morning Shack^0 is now ^8CLOSING^0! Thank you to everyone who stopped by. We'll see you again soon for more 🍩 ^9Donuts^0 and ☕ ^1Coffee^0!",
"/ad ^*^3Myers Morning Shack^0 is ^8CLOSING SOON^0! Last call for delicious 🍩 ^9Donuts^0, fresh ☕ ^1Coffee^0, and 🚬 ^7Ciggies^0! Get them before they're gone!",
"/ad ^*^3Myers Morning Shack^0 is wrapping up for the morning! Thanks for letting us start your day with fresh 🍩 ^9Donuts^0 and ☕ ^1Coffee^0. See you next time!",
];

const statusSelector = document.getElementById('ad-status-selector');
const adListContainer = document.getElementById('ad-list');
const copyStatus = document.getElementById('copy-status');

function renderAdList(mode) {
  const list = mode === 'OPEN' ? openAds : closingAds;
  adListContainer.innerHTML = '';

  list.forEach(ad => {
    const div = document.createElement('div');
    div.className = 'ad-list-item';
    div.textContent = ad;
    div.title = 'Click to copy';
    div.addEventListener('click', () => {
      navigator.clipboard.writeText(ad).then(() => {
        copyStatus.textContent = 'Ad copied to clipboard!';
        copyStatus.style.color = '#2ecc71';
      }).catch(() => {
        copyStatus.textContent = 'Copy failed.';
        copyStatus.style.color = '#e74c3c';
      });
    });
    adListContainer.appendChild(div);
  });

  copyStatus.textContent = '';
}

statusSelector.addEventListener('change', () => {
  renderAdList(statusSelector.value);
});

renderAdList('OPEN');
