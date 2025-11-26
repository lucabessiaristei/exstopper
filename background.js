const thisExtensionId = chrome.runtime.id;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  sendResponse({ received: true });
  
  if (message.action === 'disableExtensions') {
    disableExtensions(message.extensionIds, message.tabId);
  } else if (message.action === 'enableExtensions') {
    enableExtensions();
  } else if (message.action === 'hardReload') {
    hardReload(message.tabId, message.url);
  }
  
  return true;
});

async function disableExtensions(extensionIds, currentTabId) {
  const allExtensions = await chrome.management.getAll();
  const currentlyEnabled = new Map(allExtensions.map(ext => [ext.id, ext.enabled]));
  
  const disabledList = [];
  
  for (const extId of extensionIds) {
    if (currentlyEnabled.get(extId)) {
      try {
        await chrome.management.setEnabled(extId, false);
        disabledList.push(extId);
      } catch (error) {
        console.error(`Failed to disable ${extId}:`, error);
      }
    }
  }
  
  await chrome.storage.sync.set({ disabledByUs: disabledList });
  
  if (currentTabId) {
    await chrome.tabs.reload(currentTabId, { bypassCache: false });
  }
  
  try {
    chrome.runtime.sendMessage({ action: 'extensionsUpdated' });
  } catch(e) {}
}

async function enableExtensions() {
  const result = await chrome.storage.sync.get(['disabledByUs']);
  const extensions = result.disabledByUs || [];
  
  for (const extId of extensions) {
    try {
      await chrome.management.setEnabled(extId, true);
    } catch (error) {
      console.error(`Failed to enable ${extId}:`, error);
    }
  }
  
  await chrome.storage.sync.set({ disabledByUs: [] });
  
  try {
    chrome.runtime.sendMessage({ action: 'extensionsUpdated' });
  } catch(e) {}
}

function hardReload(tabId, url) {
  const urlObj = new URL(url);
  
  chrome.browsingData.remove({
    origins: [urlObj.origin]
  }, {
    cache: true,
    cacheStorage: true
  }, () => {
    chrome.tabs.reload(tabId, { bypassCache: true });
  });
}