let subDirs = ["looperman"]; // v1: should be populated in UI, eventually this will be a dictionary i think
let overwrittenId;

async function routeDownloadFile(file, item, delta) {
  for (const dir of subDirs) {
    if (file.includes(dir)) {
      overwrittenId = delta.id;
      try {
        await browser.downloads.download({
          url: `${item[0].url}`,
          filename: `${dir}/${file}`,
          conflictAction: "uniquify",
        });
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
          await browser.downloads.removeFile(overwrittenId);
          return;
        }
      }

      await routeDownloadFile(filename, downloadItem, downloadDelta);
    } catch (err) {
      console.error("Failed to search download");
    }
}

browser.downloads.onChanged.addListener(listener);
