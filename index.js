document.addEventListener('DOMContentLoaded', function () {
  const addItemButton = document.getElementById('add-item-btn');
  const buildCaseButton = document.getElementById('build-case-btn');
  const itemsListContainer = document.getElementById('items-list');
  const itemPopup = document.getElementById('item-popup');
  const closePopupButton = document.getElementById('close-popup-btn');
  const addItemPopupButton = document.getElementById('add-item-popup-btn');
  const itemDropdown = document.getElementById('item-dropdown');
  const percentChanceInput = document.getElementById('percent-chance');
  const priceValue = document.getElementById('price-value');

  addItemButton.addEventListener('click', () => {
      itemPopup.style.display = 'block';
  });

  closePopupButton.addEventListener('click', () => {
      itemPopup.style.display = 'none';
  });

  addItemPopupButton.addEventListener('click', addItemFromPopup);
  buildCaseButton.addEventListener('click', buildCase);

  const itemContainer = document.getElementById('item-popup-container');
  const selectItemButton = document.getElementById('select-item-btn');

  const searchInput = document.getElementById('item-search');
  searchInput.addEventListener('input', populateItemContainer);

  let selectedItem = {};

  populateItemContainer();

  selectItemButton.addEventListener('click', () => {
    itemPopup.style.display = 'block';
  });

  function populateItemContainer() {
    fetch('./newitems.json')
      .then(response => response.json())
      .then(items => {
        itemContainer.innerHTML = '';
  
        // Get the search input value
        const searchInput = document.getElementById('item-search');
        const searchTerm = searchInput.value.toLowerCase();
  
        // Filter items based on the search query
        const filteredItems = items.filter(item => item.name.toLowerCase().includes(searchTerm));
  
        // Sort the filtered items by price
        filteredItems.sort((a, b) => b.price - a.price);
  
        // Populate the item container with filtered and sorted items
        filteredItems.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.classList.add('popup-item');
  
          itemDiv.innerHTML = `
            <p>${item.name}</p>
            <img src="${item.image}" alt="${item.name}">
            <p>Value: ${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
            <button class="select-popup-item-btn">Select</button>
          `;
  
          itemContainer.appendChild(itemDiv);
  
          const selectItemButton = itemDiv.querySelector('.select-popup-item-btn');
          selectItemButton.addEventListener('click', () => {
            setSelectedItem(item);
          });
        });
      })
      .catch(error => console.error('Error fetching items:', error));
  }

  function setSelectedItem(item) {
    itemContainer.innerHTML = '';

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('popup-item');
    itemDiv.innerHTML = `
      <p>${item.name}</p>
      <img src="${item.image}">
      <p>Value: ${item.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
    `;

    itemContainer.appendChild(itemDiv);

    selectedItem = item;
  }

  
  function addItemFromPopup() {
    const percentChance = percentChanceInput.value;

    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item');

    itemDiv.innerHTML = `
      <p>${selectedItem.name} - ${percentChance}% chance</p>
      <img src="${selectedItem.image}" alt="${selectedItem.name}">
      <span>${selectedItem.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
      <button class="remove-item-btn">Remove Item</button>
    `;

    itemsListContainer.appendChild(itemDiv);

    const removeItemButton = itemDiv.querySelector('.remove-item-btn');
    removeItemButton.addEventListener('click', () => {
      itemsListContainer.removeChild(itemDiv);
    });

    itemPopup.style.display = 'none';

    populateItemContainer();
  }

  function updatePrice() {
    priceValue.innerHTML = '';

    const items = itemsListContainer.querySelectorAll('.item');
    
    const caseItems = [];
    let totalTickets = 0;
  
    items.forEach((item, index) => {
      const itemName = item.querySelector('p').textContent.split(' - ')[0];
      const itemValue = item.querySelector('span').textContent.split('').join('').replace(/,/g, '');
      const percentChance = item.querySelector('p').textContent.split(' - ')[1].split('%')[0];
      const itemImage = item.querySelector('img').src;
  
      const ticketsStart = totalTickets + (index == 0 ? 0 : 1);
      const ticketsEnd = totalTickets + (percentChance * 1000);
  
      totalTickets = ticketsEnd; 
  
      caseItems.push({
        name: itemName,
        price: Number(itemValue),
        image: itemImage,
        ticketsStart: ticketsStart,
        ticketsEnd: ticketsEnd
      });
    });

    priceValue.innerHTML = `
      <p>${calculateCasePrice(items)}</p>
    `;
  }

  function buildCase() {
    try {
      const caseName = document.getElementById('case-name').value;
      const caseImage = document.getElementById('case-image').value;
    
      if (!caseName || !caseImage ) {
        alert('Please fill in all case details.');
        return;
      }
        
      const items = itemsListContainer.querySelectorAll('.item');

      if(!items) return 0;
    
      const caseItems = [];
      let totalTickets = 0;
    
      items.forEach((item, index) => {
        const itemName = item.querySelector('p').textContent.split(' - ')[0];
        const itemValue = item.querySelector('span').textContent.split('').join('').replace(/,/g, '');
        const percentChance = item.querySelector('p').textContent.split(' - ')[1].split('%')[0];
        const itemImage = item.querySelector('img').src;
    
        const ticketsStart = totalTickets + (index == 0 ? 0 : 1);
        const ticketsEnd = totalTickets + (percentChance * 1000);
    
        totalTickets = ticketsEnd; 
    
        caseItems.push({
          name: itemName,
          price: Number(itemValue),
          image: itemImage,
          ticketsStart: ticketsStart,
          ticketsEnd: ticketsEnd
        });
      });
    
      const caseDetails = {
        id: String(Math.floor(Date.now() / 1000)),
        slug: caseName.split().join('-'),
        name: caseName,
        image: caseImage,
        price: calculateCasePrice(caseItems),
        items: caseItems,
      };
    
      console.log('Built Case:', caseDetails);
    
      document.getElementById('case-name').value = '';
      document.getElementById('case-image').value = '';
      document.getElementById('case-price').value = '';
      itemsListContainer.innerHTML = '';
    } catch (error) {
      console.log("Error while building case: " + error)
    }
  };

  function calculateCasePrice(items) {
    let price = 0;

    for(let item of items) {
        const percent = (item.ticketsEnd - item.ticketsStart) / 100000;
        price += item.price * percent;
    }

    return Number(price * 1.08);
  }
  
});
