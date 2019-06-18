(function () {
    var maxHeight = 92;
    var maxWidth = 420;

    var defaultPosition = {
        x: 50,
        y: 885
    };

    var images = null;

    var selectedImage = null;

    function downloadImage() {
        var zip = new JSZip();

        Promise.all(images.map((image, index) => {
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext('2d');

            canvas.width = image.width;
            canvas.height = image.height;

            const measures = getNewMeasures(selectedImage);

            canvasContext.drawImage(image, 0, 0);

            canvasContext.drawImage(selectedImage, defaultPosition.x, defaultPosition.y, measures.width, measures.height);

            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    zip.file('image' + index + '.jpg', blob);
                    resolve();
                }, 'image/png')
            });
        }))
            .then(() => zip
                .generateAsync({type: 'blob'})
                .then(content => saveAs(content, 'midiakit.zip')));

    }

    function threeRule(a, b, c) {
        return c * b / a;
    }

    function getNewMeasures(img) {
        if (img.height / maxHeight > img.width / maxWidth) {
            return {
                width: threeRule(img.height, maxHeight, img.width),
                height: maxHeight
            };
        }
        return {
            width: maxWidth,
            height: threeRule(img.width, maxWidth, img.height)
        };
    }

    function handleFileSelect(event) {
        var file = event.target.files[0];

        if (!file.type.match('image.*')) {
            throw Error('File is not an image');
        }

        var imgSelected = new Image();

        imgSelected.onload = function () {
            selectedImage = imgSelected;
        };

        imgSelected.src = URL.createObjectURL(file);
    }

    function createImageFromPath(path) {
        return new Promise(resolve => {
            var image = new Image();
            image.onload = function () {
                resolve(image);
            };
            image.src = path;
        });
    }

    function init() {
        return fetch('http://localhost:3000/midiakits')
            .then(response => response.json())
            .then(imageNames => imageNames
                .map(imageName => './imgs/midiakit/' + imageName))
            .then(imagePaths => Promise.all(imagePaths.map(createImageFromPath)))
            .then(imagesCreated => {
                images = imagesCreated;
            });
    }

    document.body.onload = init;

    document.getElementById('files').onchange = handleFileSelect;
    document.getElementById('downloadImage').onclick = downloadImage;

})();
