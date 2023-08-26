import Uplarge from "../src/Uplarge";

let pickerEl = document.getElementById("picker");
let clearEl = document.getElementById("clear");
let statusEl = document.getElementById("status");
let progressEl = document.getElementById("progress");
let urlEl = document.getElementById("url");
let errEl = document.getElementById("err");

function upload(file) {
    let props = {
        cloudName: "demo",
        uploadPreset: "unsigned",
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
    });
    uplarge.on.addEventListener("error", (evt) => {
        errEl.innerHTML = `Error during the upload: [${evt.detail.status}] ${evt.detail.message}.`;
    });
}

function pickerAction() {
    if (pickerEl.value) {
        pickerEl.disabled = "disabled";
    } else {
        pickerEl.disabled = null;
        progressEl.value = 0;
        statusEl.innerHTML = "0%";
        urlEl.innerHTML = null;
        urlEl.href = null;
    }
}

clearEl.addEventListener("click", (e) => {
    if (!pickerEl.value) return;
    pickerEl.value = null;
    pickerAction();
});

pickerEl.addEventListener("input", (e) => {
    upload(pickerEl.files[0]);
    pickerAction();
});

let container = document.querySelector(".container");
container.addEventListener(
    "dragenter",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        container.classList.add("active");
    },
    false
);

container.addEventListener(
    "dragleave",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove("active");
    },
    false
);

container.addEventListener(
    "dragover",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        container.classList.add("active");
    },
    false
);

container.addEventListener(
    "drop",
    (e) => {
        if (pickerEl.value) return;
        e.preventDefault();
        e.stopPropagation();
        container.classList.remove("active");
        let draggedData = e.dataTransfer;
        upload(draggedData.files[0]);
    },
    false
);
