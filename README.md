Uplarge uploads large files! It's a dependency-less plain JS lib for handling large file uploads directly from the browser via chunking and making a POST request for each chunk with the correct range request headers.

Uplarge is designed to be used with [Cloudinary](https://cloudinary.com/) account, but should work with any server that supports chunked upload.

## Basic Usage

To use it with [Cloudinary](https://cloudinary.com/), you'll first need to have an account, then you'll need a cloud-name, and an upload preset checked as [unsigned](https://cloudinary.com/documentation/upload_images#unauthenticated_requests)

```js
import Uplarge from "Uplarge";

function upload(file) {
    let props = {
        cloudName: "demo",
        uploadPreset: "unsigned",
    };
    let uplarge = Uplarge(props);
    uplarge.uploadFile(file);
}

// Pretend that you have an HTML page with: <input id="picker" type="file" />
let picker = document.getElementById("picker");
picker.addEventListener("change", () => {
    upload(picker.files[0]);
});

// Subscribe to events
uplarge.on.addEventListener("progress", (e) => {
    console.log(`${Math.round(e.detail.percent)}%`);
});

uplarge.on.addEventListener("success", (e) => {
    console.log(e.detail.response);
});

uplarge.on.addEventListener("error", (e) => {
    console.log(e.detail.status, e.detail.message);
});
```

## API

#### Uplarge(props) [function]

`props` is an object

```js
{
    publicId: [string(optional)];
    cloudName: [string];
    uploadPreset: [string];
}
```

Returns an object

```js
{
    on: [event emitter],
    uploadFile: [function]
}
```

### uploadFile(file) [function]

`file` is a [File](https://developer.mozilla.org/en-US/docs/Web/API/File) object.

#
