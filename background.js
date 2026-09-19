const getRules = async () => {
  const data = await browser.storage.local.get("rules");
  return data.rules || [];
};

const downloadMap = new Map();

browser.storage.session.set({ downloadMap });

async function routeDownloadFile(file, item, delta) {
  const rules = await getRules();
  for (const rule of rules) {
    if (file.includes(rule)) {
      try {
        const newDownloadId = await browser.downloads.download({
          url: `${item[0].url}`,
          filename: `${rule}/${file}`,
          conflictAction: "uniquify",
        });
        downloadMap.set(newDownloadId, delta.id);
      } catch (err) {
        console.error("Failed to move local download to subdirectory");
      }
    }
  }
}

async function listener(downloadDelta) {
  if (downloadDelta.state.current === "complete")
    try {
      const downloadItem = await browser.downloads.search({
        id: downloadDelta.id,
      });
      const filename = downloadItem[0].filename.split("/").pop();
      const fullPath = downloadItem[0].filename;

      const rules = await getRules();
      for (const rule of rules) {
        if (fullPath.includes(`/${rule}/`)) {
          const overWrittenId = downloadMap.get(downloadDelta.id);
          if (overWrittenId) {
            await browser.downloads.removeFile(overWrittenId);
            downloadMap.delete(downloadDelta.id);
          }
          return;
        }
      }

      await routeDownloadFile(filename, downloadItem, downloadDelta);
    } catch (err) {
      console.error("Failed to search download");
    }
}

browser.downloads.onChanged.addListener(listener);
