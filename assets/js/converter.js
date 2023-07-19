const modal = document.getElementById("loading-modal");
const progress = document.getElementById("loading-progress");
const urlInput = document.getElementById("url-input");
const idInput = document.getElementById("id-input");

const mrApi = "https://api.modrinth.com/v2/project/"
const mrApiGetVersions = "/version"

function downloadButton() {
  downloadPack(urlInput.value);
}

function downloadLatestButton() {
  downloadLatestPack(idInput.value);
}

async function downloadLatestPack(id) {
  const response = await fetch(mrApi + id + mrApiGetVersions);

  try {
    const response = await fetch(mrApi + id + mrApiGetVersions);
  
    if (!response.ok) { 
      alert("Invalid project ID or server error!");
    }
  
  } catch (error) {
    alert("An unknown error occurred!");
  }

  if (response == 'undefined') {
    alert("Server error!");
  }
  let data = await response.json();

  if (data == 'undefined') {
    alert("Invalid project ID!");
  }
  else if(data[0].files[0].url == 'undefined'){
    alert("No files found!");
  }

  downloadPack(data[0].files[0].url);
}


function downloadPack(url) {
  if (url.includes("modpack")) {
    alert("Please copy the link of the green download button, not the version page!");
    return;
  } else if (!url.includes("mrpack")) {
    alert("That is not a valid mrpack URL.");
    return;
  }

  // Show the modal
  modal.classList.add("is-active");

  // Start creating a new zip file
  var newZip = new JSZip();

  JSZipUtils.getBinaryContent(url, function (err, data) {
    if (err) {
      throw err; // or handle err
    }

    // Read the zip file, so we can read the manifest
    JSZip.loadAsync(data)
      .then(async function (zip) {

        // Read the manifest
        const manifestRaw = await zip.files['modrinth.index.json'].async('string');
        const manifest = JSON.parse(manifestRaw);

        for (const fileName in zip.files) {
          const file = zip.files[fileName];
          if (file.dir) {
            continue;
          }

          if (file.name.startsWith("overrides/")) {
            const properFileName = file.name.substring("overrides/".length);
            newZip.file(properFileName, file.async('blob'));
          }

          if (file.name.startsWith("client-overrides/")) {
            const properFileName = file.name.substring("client-overrides/".length);
            newZip.file(properFileName, file.async('blob'));
          }
        }

        var totalFileSize = 0;
        var downloaded = 0;

        for (const fileIndex in manifest.files) {
          const file = manifest.files[fileIndex];

          totalFileSize += file.fileSize;
        }
        progress.max = totalFileSize;

        const filePromises = [];
        for (const fileIndex in manifest.files) {
          const file = manifest.files[fileIndex];

          newZip.file(file.path, fetch(file.downloads[0]).then(function (f) {
            downloaded += file.fileSize;
            progress.value = downloaded;
            return f.blob();
          }));
        }

        newZip.generateAsync({
          type: "blob"
        }).then(function (content) {
          saveAs(content, manifest['name'] + '-' + manifest['versionId'] + '.zip');

          // Close the modal
          modal.classList.remove("is-active");
        });

      });
  });


}