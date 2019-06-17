(function () {
    var maxHeight = 92;
    var maxWidth = 420;

    var canvas = document.getElementById('canvas');

    // var canvas = document.createElement('canvas');
    var canvasContext = canvas.getContext('2d');

    var defaultPosition = {
        x: 50,
        y: 885
    };

    function draw() {
        var img = new Image();
        img.crossOrigin = 'Anonymous'; // local não existe CORS
        img.src = './imgs/midiakit/midia-kit-manutencao.png';
        img.onload = function () {

            canvas.width = img.width;
            canvas.height = img.height;

            canvasContext.drawImage(img, 0, 0);
            // canvasContext.strokeRect(defaultPosition.x, defaultPosition.y, maxWidth, maxHeight);
        };
    }

    function downloadImage() {
        var image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
        var aLink = document.createElement('a');
        aLink.download = 'image.png';
        aLink.href = image;
        aLink.click();
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
            const measures = getNewMeasures(imgSelected);
            canvasContext.drawImage(imgSelected, defaultPosition.x, defaultPosition.y, measures.width, measures.height);
        };

        imgSelected.src = URL.createObjectURL(file);
    }

    document.body.onload = draw;
    document.getElementById('files').onchange = handleFileSelect;
    document.getElementById('downloadImage').onclick = downloadImage;
})();
