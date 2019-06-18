(function () {
    var maxHeight = 92;
    var maxWidth = 420;

    var defaultPosition = {
        x: 50,
        y: 885
    };

    var imagesNode = document.getElementsByClassName('midia-kit');

    var images = Object.keys(imagesNode).map(key => imagesNode[key]);

    var selectedImage = null;

    function downloadImage() {

        function last(array) {
            return array[array.length - 1];
        }

        var zip = new JSZip();

        if (images === null) {
            alert('Houve um erro no carregamento das imagens do midia kit.');
            return;
        }
        if (images.length === 0) {
            alert('Não há midia kits disponíveis atualmente.');
            return;
        }
        if (selectedImage === null) {
            alert('Houve um problema ao selecionar seu logo.');
            return;
        }

        Promise.all(images.map(image => {
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext('2d');

            canvas.width = image.width;
            canvas.height = image.height;

            const measures = getNewMeasures(selectedImage);

            canvasContext.drawImage(image, 0, 0);

            canvasContext.drawImage(selectedImage, defaultPosition.x, defaultPosition.y, measures.width, measures.height);

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

    function threeRule(a, b, c) {
        return c * b / a;
    }

    function getNewMeasures(image) {
        if (image.height / maxHeight > image.width / maxWidth) {
            return {
                width: threeRule(image.height, maxHeight, image.width),
                height: maxHeight
            };
        }
        return {
            width: maxWidth,
            height: threeRule(image.width, maxWidth, image.height)
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

    document.getElementById('files').onchange = handleFileSelect;
    document.getElementById('downloadImage').onclick = downloadImage;

})();
