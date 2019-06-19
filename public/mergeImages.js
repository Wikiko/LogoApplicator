function WatermarkApplicator() {
    var maxHeightWatermark = null;
    var maxWidthWatermark = null;
    var imagesToApply = null;
    var watermarkImage = null;
    var watermarkPosition = null;

    function getNewMeasures(image) {
        if (image.height / maxHeightWatermark > image.width / maxWidthWatermark) {
            return {
                width: threeRule(image.height, maxHeightWatermark, image.width),
                height: maxHeightWatermark
            };
        }
        return {
            width: maxWidthWatermark,
            height: threeRule(image.width, maxWidthWatermark, image.height)
        };
    }

    function threeRule(a, b, c) {
        return c * b / a;
    }

    function setWatermarkPosition(x, y) {
        watermarkPosition = {
            x,
            y
        }
    }

    function setWatermarkImage(image) {
        watermarkImage = image;
    }

    function setImagesToApply(images) {
        imagesToApply = images;
    }

    function setMaxWidthWatermark(maxWidth) {
        maxWidthWatermark = maxWidth;
    }

    function setMaxHeightWatermark(maxHeight) {
        maxHeightWatermark = maxHeight;
    }

    function last(array) {
        return array[array.length - 1];
    }

    function applyAndDownload() {
        var zip = new JSZip();

        if (imagesToApply === null) {
            alert('Houve um erro no carregamento das imagens do midia kit.');
            return;
        }
        if (imagesToApply.length === 0) {
            alert('Não há midia kits disponíveis atualmente.');
            return;
        }
        if (watermarkImage === null) {
            alert('Houve um problema ao selecionar seu logo.');
            return;
        }

        return Promise.all(imagesToApply.map(image => {
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext('2d');

            canvas.width = image.width;
            canvas.height = image.height;

            const measures = getNewMeasures(watermarkImage);

            canvasContext.drawImage(image, 0, 0);

            canvasContext.drawImage(watermarkImage, watermarkPosition.x, watermarkPosition.y, measures.width, measures.height);

            return new Promise(resolve => {
                canvas.toBlob(blob => {
                    var imageName = last(image.src.split('/'));
                    zip.file(imageName + '.png', blob);
                    resolve();
                }, 'image/png');
            });
        }))
            .then(() => zip
                .generateAsync({type: 'blob'})
                .then(content => saveAs(content, 'midiakit.zip')));
    }

    return {
        setWatermarkImage,
        setWatermarkPosition,
        setImagesToApply,
        setMaxWidthWatermark,
        setMaxHeightWatermark,
        applyAndDownload
    };
}

var maxHeight = 92;
var maxWidth = 420;

var defaultPosition = {
    x: 50,
    y: 885
};

var imagesNode = document.getElementsByClassName('midia-kit');

var images = Object.keys(imagesNode).map(key => imagesNode[key]);

var waterMarkApplicator = WatermarkApplicator();

waterMarkApplicator.setImagesToApply(images);
waterMarkApplicator.setWatermarkPosition(defaultPosition.x, defaultPosition.y);
waterMarkApplicator.setMaxWidthWatermark(maxWidth);
waterMarkApplicator.setMaxHeightWatermark(maxHeight);

function handleFileSelect(event) {
    var file = event.target.files[0];

    if (!file.type.match('image.*')) {
        throw Error('File is not an image');
    }

    var imgSelected = new Image();

    imgSelected.onload = function () {
        waterMarkApplicator.setWatermarkImage(imgSelected);
    };

    imgSelected.src = URL.createObjectURL(file);
}

document.getElementById('files').onchange = handleFileSelect;
document.getElementById('downloadImage').onclick = waterMarkApplicator.applyAndDownload;
