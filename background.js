const getRules = async () => {
  const data = await browser.storage.local.get("rules");
  return data.rules;
};

const getDownloadMap = async () => {
  const data = await browser.storage.session.get("downloadMap");
  return data.downloadMap || new Map();
};

async function routeDownloadFile(file, downloadItem, delta) {
  const rules = await getRules();
  const downloadMap = await getDownloadMap();

  for (const rule of rules) {
    if (file.includes(rule)) {
      try {
        const request = {
          url: downloadItem.url,
          filename: `${rule}/${file}`,
          conflictAction: "uniquify",
          ...(downloadItem.referrer && {
            headers: [{ name: "Referer", value: downloadItem.referrer }],
          }),
        };
        const newDownloadId = await browser.downloads.download(request);
        downloadMap.set(newDownloadId, delta.id);
        await browser.storage.session.set({ downloadMap });
      } catch (err) {
        console.error("Failed to move local download to subdirectory", err);
      }
      break;
    }
  }
}

async function downloadsListener(downloadDelta) {
  if (downloadDelta.state?.current === "complete")
    try {
      const [downloadItem] = await browser.downloads.search({
        id: downloadDelta.id,
      });

      const filename = downloadItem.filename.split("/").pop();
      const fullPath = downloadItem.filename;

      const rules = await getRules();
      const downloadMap = await getDownloadMap();

      for (const rule of rules) {
        if (fullPath.includes(`/${rule}/`)) {
          const overWrittenId = downloadMap.get(downloadDelta.id);

          if (overWrittenId) {
            await browser.downloads.removeFile(overWrittenId);
            await browser.downloads.erase({ id: overWrittenId });
            downloadMap.delete(downloadDelta.id);
            await browser.storage.session.set({ downloadMap });
          }
          return;
        }
      }

      await routeDownloadFile(filename, downloadItem, downloadDelta);
    } catch (err) {
      console.error("Failed to search download", err);
    }
}

async function onInstalledListener() {
  let rules = await getRules();
  if (!rules) {
    rules = [];
    await browser.storage.local.set({ rules });
  }
}

browser.runtime.onInstalled.addListener(onInstalledListener);
browser.downloads.onChanged.addListener(downloadsListener);
