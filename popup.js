const extensionsList = document.getElementById('extensionsList');
const disableBtn = document.getElementById('disableBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const reloadBtn = document.getElementById('reloadBtn');
const thisExtensionId = chrome.runtime.id;

let extensions = [];
let selectedExtensions = new Set();
let allSelected = false;
let currentTabId = null;

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  if (tabs[0]) {
    currentTabId = tabs[0].id;
  }
});

chrome.storage.sync.get(['disabledByUs', 'selectedExtensions'], (result) => {
  const disabledByUs = result.disabledByUs || [];
  selectedExtensions = new Set(result.selectedExtensions || []);
  
  loadExtensions(disabledByUs);
});

function loadExtensions(disabledByUs) {
  chrome.management.getAll((allExtensions) => {
    extensions = allExtensions.filter(ext => 
      ext.id !== thisExtensionId && 
      ext.type === 'extension'
    );
    
    if (selectedExtensions.size === 0) {
      extensions.forEach(ext => {
        if (ext.enabled) {
          selectedExtensions.add(ext.id);
        }
      });
      chrome.storage.sync.set({ selectedExtensions: Array.from(selectedExtensions) });
      allSelected = true;
    }
    
    renderExtensions(disabledByUs);
  });
}

function renderExtensions(disabledByUs) {
  if (extensions.length === 0) {
    extensionsList.innerHTML = '<div class="empty-state">No extensions found</div>';
    return;
  }
  
  const anyDisabledByUs = disabledByUs.length > 0;
  
  if (anyDisabledByUs) {
    disableBtn.textContent = 'Re-enable';
    disableBtn.className = 'btn btn-success';
  } else {
    disableBtn.textContent = 'Disable and Reload';
    disableBtn.className = 'btn btn-danger';
  }
  
  const enabledExtensions = extensions.filter(ext => ext.enabled);
  allSelected = selectedExtensions.size === enabledExtensions.length;
  selectAllBtn.textContent = allSelected ? 'Deselect All' : 'Select All';
  
  extensionsList.innerHTML = extensions.map(ext => {
    const isChecked = selectedExtensions.has(ext.id);
    const isDisabledByUs = disabledByUs.includes(ext.id);
    const isEnabled = ext.enabled;
    
    let statusText = 'Active';
    if (isDisabledByUs) {
      statusText = 'Disabled by us';
    } else if (!isEnabled) {
      statusText = 'Disabled by user';
    }
    
    const itemClass = isEnabled ? 'extension-item' : 'extension-item disabled';
    
    return `
      <div class="${itemClass}">
        <input 
          type="checkbox" 
          class="checkbox" 
          data-id="${ext.id}"
          ${isChecked ? 'checked' : ''}
          ${anyDisabledByUs || !isEnabled ? 'disabled' : ''}
        >
        <img 
          class="extension-icon" 
          src="${ext.icons?.[0]?.url || 'icons/icon16.png'}" 
          alt=""
        >
        <div class="extension-info">
          <div class="extension-name">${ext.name}</div>
          <div class="extension-status">${statusText}</div>
        </div>
      </div>
    `;
  }).join('');
  
  document.querySelectorAll('.checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', handleCheckboxChange);
  });
}

function handleCheckboxChange(e) {
  const extId = e.target.dataset.id;
  
  if (e.target.checked) {
    selectedExtensions.add(extId);
  } else {
    selectedExtensions.delete(extId);
  }
  
  const enabledExtensions = extensions.filter(ext => ext.enabled);
  allSelected = selectedExtensions.size === enabledExtensions.length;
  selectAllBtn.textContent = allSelected ? 'Deselect All' : 'Select All';
  
  chrome.storage.sync.set({ 
    selectedExtensions: Array.from(selectedExtensions) 
  });
}

selectAllBtn.addEventListener('click', () => {
  chrome.storage.sync.get(['disabledByUs'], (result) => {
    const anyDisabled = (result.disabledByUs || []).length > 0;
    if (anyDisabled) return;
    
    if (allSelected) {
      selectedExtensions.clear();
    } else {
      selectedExtensions.clear();
      extensions.forEach(ext => {
        if (ext.enabled) {
          selectedExtensions.add(ext.id);
        }
      });
    }
    
    allSelected = !allSelected;
    selectAllBtn.textContent = allSelected ? 'Deselect All' : 'Select All';
    
    chrome.storage.sync.set({ 
      selectedExtensions: Array.from(selectedExtensions) 
    }, () => {
      chrome.storage.sync.get(['disabledByUs'], (result) => {
        renderExtensions(result.disabledByUs || []);
      });
    });
  });
});

disableBtn.addEventListener('click', () => {
  chrome.storage.sync.get(['disabledByUs'], (result) => {
    const disabledByUs = result.disabledByUs || [];
    
    if (disabledByUs.length > 0) {
      chrome.runtime.sendMessage({ action: 'enableExtensions' });
      window.close();
    } else {
      if (selectedExtensions.size === 0) {
        alert('Select at least one extension');
        return;
      }
      chrome.runtime.sendMessage({ 
        action: 'disableExtensions',
        extensionIds: Array.from(selectedExtensions),
        tabId: currentTabId
      });
      window.close();
    }
  });
});

reloadBtn.addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.runtime.sendMessage({ 
        action: 'hardReload',
        tabId: tabs[0].id,
        url: tabs[0].url
      });
      window.close();
    }
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'extensionsUpdated') {
    chrome.storage.sync.get(['disabledByUs'], (result) => {
      loadExtensions(result.disabledByUs || []);
    });
  }
});