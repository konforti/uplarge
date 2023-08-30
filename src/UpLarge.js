let cloudName,
    publicId,
    uploadPreset,
    chunkSize,
    xUniqueUploadId,
    chunkCount,
    totalChunks,
    startTime,
    file,
    fileSize,
    fromByte,
    toByte,
    offline,
    retries,
    retriesCount,
    eventTarget;

window.addEventListener("online", () => {
    offline = false;
    console.debug("Online");
});

window.addEventListener("offline", () => {
    offline = true;
    console.debug("Offline");
});

function Uplarge(props) {
    xUniqueUploadId = +new Date();
    publicId = (props && props.publicId) || xUniqueUploadId;
    cloudName = (props && props.cloudName) || "demo";
    uploadPreset = (props && props.uploadPreset) || "unsigned";
    chunkSize = 6000000; // Bytes (must be larger than 5,000,000)
    fromByte = 0;
    toByte = 0;
    offline = false;
    chunkCount = 0;
    retries = 5;
    retriesCount = 0;
    eventTarget = new EventTarget();
    return {
        on: eventTarget,
        uploadFile,
    };
}

function uploadFile(fileToUpload) {
    if (!fileToUpload) {
        return new TypeError("The file is missing");
    }
    file = fileToUpload;
    fileSize = file.size;
    totalChunks = Math.ceil(fileSize / chunkSize);
    startTime = Date.now();
    processFile();
}

function processFile(retry = false) {
    if (offline) {
        console.debug("Still offline ...");
        return setTimeout(processFile, 1000, retry); // Wait for online and retry.
    }
    toByte = fromByte + chunkSize;
    if (toByte > fileSize) {
        toByte = fileSize;
    }
    let part = file.slice(fromByte, toByte);
    if (!retry) {
        chunkCount++;
    }
    send(part)
        .then((res) => {
            if (res.status / 100 === 2) {
                retriesCount = 0;
                if (toByte < fileSize) {
                    fromByte = toByte;
                    console.debug(`Uploaded chunk number ${chunkCount}`);
                    processFile();
                } else {
                    eventTarget.dispatchEvent(
                        new CustomEvent("success", {
                            detail: { response: JSON.parse(res.response) },
                        })
                    );
                }
            } else if (retriesCount < retries) {
                retriesCount++;
                console.debug(
                    `${retriesCount}/${retries} retries to upload chunk number ${chunkCount}`
                );
                return setTimeout(processFile, 1000, true); // Retry with count.
            } else {
                eventTarget.dispatchEvent(
                    new CustomEvent("error", {
                        detail: res,
                    })
                );
            }
        })
        .catch((error) => {
            console.error(error);
        });

    function send(part) {
        let formdata = new FormData();
        formdata.append("file", part);
        formdata.append("upload_preset", uploadPreset);
        formdata.append("cloud_name", cloudName);
        formdata.append("public_id", publicId);

        let xhr = new XMLHttpRequest();
        return new Promise((resolve, reject) => {
            xhr.open(
                "POST",
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
            );
            xhr.setRequestHeader("X-Unique-Upload-Id", xUniqueUploadId);
            xhr.setRequestHeader(
                "Content-Range",
                `bytes ${fromByte}-${toByte - 1}/${fileSize}`
            );

            xhr.onload = () => {
                // Fired when an XMLHttpRequest transaction completes successfully
                if (xhr.readyState !== 4) {
                    return; // Only run if the request is complete (4 == Done)
                }
                resolve(xhr);
            };

            xhr.upload.onloadstart = () => {
                // Fired when a request has started to load data
            };

            xhr.upload.onloadend = () => {
                // Fired when a request has been completed, whether successfully (after load) or unsuccessfully (after abort or error)
            };

            xhr.upload.onabort = () => {
                // Fired when a request has been aborted, for example, because the program called XMLHttpRequest.abort().
                resolve(xhr);
            };

            xhr.upload.onprogress = (event) => {
                // Fired periodically when a request receives more data
                let total = Math.max(event.total, fileSize); // Bytes
                let uploaded = (chunkCount - 1) * chunkSize + event.loaded; // Bytes
                let percent = (uploaded / total) * 100;
                let elapsed = (Date.now() - startTime) / 1000; // Seconds
                let speed = Math.max(uploaded / elapsed, 1); // Bytes/Second
                eventTarget.dispatchEvent(
                    new CustomEvent("progress", {
                        detail: { percent, speed, uploaded, total },
                    })
                );
            };

            xhr.upload.ontimeout = () => {
                // Fired when progress is terminated due to preset time expiring.
                resolve(xhr);
            };

            xhr.upload.onerror = () => {
                // Fired when the request encountered an error.
                resolve(xhr);
            };

            xhr.onerror = (e) => {
                console.log(e);
            };

            xhr.send(formdata);
        });
    }
}

export default Uplarge;
