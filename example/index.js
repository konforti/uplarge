import UpLarge from "../src/UpLarge";

function upload(file) {
  let props = {
    cloudName: "dxuiuruim",
    uploadPreset: "unsigned"
  };
  let upLarge = UpLarge(props);
  upLarge.uploadFile(file);

  upLarge.emitter.addEventListener("progress", (evt) => {
    document.getElementById("progress").value = Math.round(evt.detail.percent);
    document.getElementById("status").innerHTML = `${Math.round(
      evt.detail.percent
    )}%`;
  });
  upLarge.emitter.addEventListener("success", (evt) => {
    let res = evt.detail.response;
    let url = res.playback_url;
    if (res.resource_type !== "video") {
      url = res.secure_url;
    }
    document.getElementById("url").innerHTML = url;
    document.getElementById("url").href = url;
  });
  upLarge.emitter.addEventListener("error", (evt) => {
    document.getElementById(
      "status"
    ).innerHTML = `Error during the upload: [${evt.detail.status}] ${evt.detail.message}.`;
  });
}

let picker = document.getElementById("picker");
picker.addEventListener("change", (e) => {
  upload(picker.files[0]);
});

let container = document.querySelector(".container");
container.addEventListener(
  "dragenter",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.add("active");
  },
  false
);

container.addEventListener(
  "dragleave",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.remove("active");
  },
  false
);

container.addEventListener(
  "dragover",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.add("active");
  },
  false
);

container.addEventListener(
  "drop",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.remove("active");
    let draggedData = e.dataTransfer;
    upload(draggedData.files[0]);
  },
  false
);
