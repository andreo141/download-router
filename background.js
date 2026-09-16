let subDirs = ["looperman"]; // v1: should be populated in UI, eventually this will be a dictionary i think
const downloadMap = new Map();

async function routeDownloadFile(file, item, delta) {
  for (const dir of subDirs) {
    if (file.includes(dir)) {
      try {
        const newDownloadId = await browser.downloads.download({
          url: `${item[0].url}`,
          filename: `${dir}/${file}`,
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

      for (const dir of subDirs) {
        if (fullPath.includes(`/${dir}/`)) {
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
