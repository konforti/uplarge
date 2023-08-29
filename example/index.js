import Uplarge from "../src/Uplarge";

let pickerEl = document.getElementById("picker");
let clearEl = document.getElementById("clear");
let statusEl = document.getElementById("status");
let progressEl = document.getElementById("progress");
let urlEl = document.getElementById("url");
let errEl = document.getElementById("err");
let infoEl = document.getElementById("info");
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

    uplarge.on.addEventListener("progress", (e) => {
        progressEl.value = Math.round(e.detail.percent);
        statusEl.innerHTML = `${Math.round(e.detail.percent)}%`;
        let speed = bytesFormat(e.detail.speed);
        let bytesLeft = e.detail.total - e.detail.uploaded;
        let secondsLeft = bytesLeft / e.detail.speed;
        let uploaded = bytesFormat(e.detail.uploaded);
        let total = bytesFormat(e.detail.total);

        infoEl.innerHTML = `${speed[0]} ${speed[1]}/s · ${uploaded[0]} ${
            uploaded[1]
        }/${total[0]} ${total[1]} · ${formatTime(secondsLeft)} left`;
    });
    uplarge.on.addEventListener("success", (e) => {
        let res = e.detail.response;
        let url = res.playback_url;
        if (res.resource_type !== "video") {
            url = res.secure_url;
        }
        urlEl.innerHTML = url;
        urlEl.href = url;
        showFinish();
    });
    uplarge.on.addEventListener("error", (e) => {
        errEl.innerHTML = `Error during the upload: [${e.detail.status}] ${e.detail.message}.`;
        showFinish();
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
    let file = pickerEl.files[0];
    upload(file);
    pickerEl.disabled = "disabled";
    let size = bytesFormat(file.size);
    console.debug(
        `Name: ${file.name} Size: ${size[0]} ${size[1]} Type: ${file.type}`
    );
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

const units = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
function bytesFormat(x) {
    let l = 0,
        n = parseInt(x, 10) || 0;
    while (n >= 1000 && ++l) {
        n = n / 1000;
    }
    return [n.toFixed(n < 10 && l > 0 ? 1 : 0), units[l]];
}

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    return [h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s]
        .filter(Boolean)
        .join(":");
}
