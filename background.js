function routeDownloadFile(file) {}

async function listener(downloadDelta) {
  if (downloadDelta.state.current === "complete")
    try {
      const downloadItem = await browser.downloads.search({
        id: downloadDelta.id,
      });
      const filename = downloadItem[0].filename.split("/").pop();
      console.log("filename", filename);
    } catch (err) {
      console.error("Failed to search download");
    }
}

browser.downloads.onChanged.addListener(listener);
