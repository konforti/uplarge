import Uplarge from "../src/Uplarge";

let pickerEl = document.getElementById("picker");
let clearEl = document.getElementById("clear");
let statusEl = document.getElementById("status");
let progressEl = document.getElementById("progress");
let urlEl = document.getElementById("url");
let containerEl = document.querySelector(".container");
let progressToolsEl = document.querySelector(".progress-tools");
let uploadToolsEl = document.querySelector(".upload-tools");
let finishToolsEl = document.querySelector(".finish-tools");

function upload(file) {
    let urlParams = new URLSearchParams(window.location.search);
    let cloudName = urlParams.get("cloud_name") || "demo";
    let uploadPreset = urlParams.get("upload_preset") || "unsigned";

    let props = {
        cloudName,
        uploadPreset,
    };
    let uplarge = Uplarge(props);
    uplarge.uploadFile(file);

    uplarge.on.addEventListener("progress", (evt) => {
        progressEl.value = Math.round(evt.detail.percent);
        statusEl.innerHTML = `${Math.round(evt.detail.percent)}%`;
    });
    uplarge.on.addEventListener("success", (evt) => {
        let res = evt.detail.response;
        let url = res.playback_url;
        if (res.resource_type !== "video") {
            url = res.secure_url;
        }
        urlEl.innerHTML = url;
        urlEl.href = url;
        showFinish();
    });
    uplarge.on.addEventListener("error", (evt) => {
        errEl.innerHTML = `Error during the upload: [${evt.detail.status}] ${evt.detail.message}.`;
    });
}

clearEl.addEventListener("click", (e) => {
    if (!pickerEl.value) return;
    pickerEl.disabled = null;
    progressEl.value = 0;
    statusEl.innerHTML = "0%";
    urlEl.innerHTML = null;
    urlEl.href = null;
    showPicker();
});

pickerEl.addEventListener("input", (e) => {
    upload(pickerEl.files[0]);
    pickerEl.disabled = "disabled";
    showProgress();
});

containerEl.addEventListener(
    "dragenter",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        containerEl.classList.add("active");
    },
    false
);

containerEl.addEventListener(
    "dragleave",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        containerEl.classList.remove("active");
    },
    false
);

containerEl.addEventListener(
    "dragover",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        containerEl.classList.add("active");
    },
    false
);

containerEl.addEventListener(
    "drop",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        containerEl.classList.remove("active");
        let draggedData = e.dataTransfer;
        upload(draggedData.files[0]);
        showProgress();
    },
    false
);

function showPicker() {
    progressToolsEl.classList.add("hide");
    progressToolsEl.classList.remove("show");
    uploadToolsEl.classList.add("show");
    uploadToolsEl.classList.remove("hide");
    finishToolsEl.classList.add("hide");
    finishToolsEl.classList.remove("show");
}

function showProgress() {
    progressToolsEl.classList.add("show");
    progressToolsEl.classList.remove("hide");
    uploadToolsEl.classList.add("hide");
    uploadToolsEl.classList.remove("show");
    finishToolsEl.classList.add("hide");
    finishToolsEl.classList.remove("show");
}

function showFinish() {
    progressToolsEl.classList.add("hide");
    progressToolsEl.classList.remove("show");
    uploadToolsEl.classList.add("hide");
    uploadToolsEl.classList.remove("show");
    finishToolsEl.classList.add("show");
    finishToolsEl.classList.remove("hide");
}
