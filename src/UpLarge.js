let cloudName,
    publicId,
    uploadPreset,
    chunkSize,
    xUniqueUploadId,
    chunkCount,
    totalChunks,
    file,
    fileSize,
    fromByte,
    toByte,
    percent,
    retries,
    retriesCount,
    eventTarget;

function Uplarge(props) {
    xUniqueUploadId = +new Date();
    publicId = (props && props.publicId) || xUniqueUploadId;
    cloudName = (props && props.cloudName) || "demo";
    uploadPreset = (props && props.uploadPreset) || "unsigned";
    chunkSize = 6000000; // Bytes (must be larger than 5,000,000)
    fromByte = 0;
    toByte = 0;
    chunkCount = 0;
    retries = 3;
    retriesCount = 0;
    eventTarget = new EventTarget();
    return {
        on: eventTarget,
        uploadFile: uploadFile,
    };
}

function uploadFile(fileToUpload) {
    if (!fileToUpload) {
        return new TypeError("The file is missing");
    }
    file = fileToUpload;
    fileSize = file.size;
    totalChunks = Math.ceil(fileSize / chunkSize);
    processFile();
}

function processFile(retry = false) {
    toByte = fromByte + parseInt(chunkSize);
    if (toByte > fileSize) {
        toByte = fileSize;
    }
    let part = file.slice(fromByte, toByte);
    if (!retry) {
        chunkCount++;
    }
    send(part, fromByte, toByte - 1, fileSize)
        .then((res) => {
            if (parseInt(res.status / 100) === 2) {
                retriesCount = 0;
                if (toByte < fileSize) {
                    fromByte = toByte;
                    processFile();
                } else {
                    percent = 100;
                    eventTarget.dispatchEvent(
                        new CustomEvent("success", {
                            detail: { response: JSON.parse(res.response) },
                        })
                    );
                }
            } else if (retriesCount++ <= retries) {
                console.info(`${retriesCount} retry of chunk ${chunkCount}`);
                processFile(true);
            }
        })
        .catch((error) => {
            console.error(error);
        });

    function send(part, fromByte, toByte, fileSize) {
        let formdata = new FormData();
        formdata.append("file", part);
        formdata.append("upload_preset", uploadPreset);
        formdata.append("cloud_name", cloudName);
        formdata.append("public_id", publicId);

        let xhr = new XMLHttpRequest();

        return new Promise(function (resolve, reject) {
            xhr.onload = () => {
                // Fired when an XMLHttpRequest transaction completes successfully
                if (xhr.readyState !== 4) {
                    return; // Only run if the request is complete (4 == Done)
                }
                if (parseInt(xhr.status / 100) === 2) {
                    resolve(xhr);
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText,
                    });
                }
            };

            xhr.open(
                "POST",
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
            );
            xhr.timeout = 60 * 60 * 1000;
            xhr.setRequestHeader("X-Unique-Upload-Id", xUniqueUploadId);
            xhr.setRequestHeader(
                "Content-Range",
                `bytes ${fromByte}-${toByte}/${fileSize}`
            );
            xhr.upload.onloadstart = function () {
                // Fired when a request has started to load data
            };

            xhr.onloadend = function () {
                // Fired when a request has been completed, whether successfully (after load) or unsuccessfully (after abort or error)
            };

            xhr.upload.onabort = function () {
                // Fired when a request has been aborted, for example, because the program called XMLHttpRequest.abort().
            };

            xhr.upload.onprogress = function (event) {
                // Fired periodically when a request receives more data
                let total = Math.max(event.total, fileSize);
                let uploaded = (chunkCount - 1) * chunkSize + event.loaded;
                percent = (uploaded / total) * 100;
                percent = Math.max(percent, 1); // For large we want to show progress right from the start.
                percent = Math.min(percent, 99); // Same goes for the end 100% before finish can be misleading.
                eventTarget.dispatchEvent(
                    new CustomEvent("progress", {
                        detail: { percent },
                    })
                );
            };

            xhr.upload.ontimeout = function () {
                // Fired when progress is terminated due to preset time expiring
            };

            xhr.upload.onerror = function (event) {
                eventTarget.dispatchEvent(
                    new CustomEvent("error", {
                        detail: {
                            status: xhr.status,
                            message: event.target.responseText,
                        },
                    })
                );
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText,
                });
            };

            xhr.send(formdata);
        });
    }
}

export default Uplarge;
