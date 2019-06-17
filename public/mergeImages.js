(function () {
    var maxHeight = 92;
    var maxWidth = 420;

    var defaultPosition = {
        x: 50,
        y: 885
    };

    var listOfCanvasToApplyLogo = [];

    function downloadImage() {
        var zip = new JSZip();

        var promisesToWait = listOfCanvasToApplyLogo.map((canvas, index) => {
            return new Promise(resolve => {
                canvas.toBlob(resolve, 'image/jpeg');
            })
                .then(blob =>{
                    zip.file('image' + index + '.jpg', blob);
                    console.log('feito', 'image' + index + '.jpg');
                });
        });

        Promise.all(promisesToWait)
            .then(() => {
                zip.generateAsync({type: 'blob'})
                    .then(function (content) {
                        saveAs(content, 'midiakit.zip');
                    });
            });

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
        var zip = new JSZip();
        var file = event.target.files[0];

        if (!file.type.match('image.*')) {
            throw Error('File is not an image');
        }

        var imgSelected = new Image();

        imgSelected.onload = function () {
            var canvas = document.createElement('canvas');
            var canvasContext = canvas.getContext('2d');
            
            const measures = getNewMeasures(imgSelected);
            listOfCanvasToApplyLogo.forEach(canvas => {
                console.log('processando...');
                var canvasContext = canvas.getContext('2d');
                canvasContext.drawImage(imgSelected, defaultPosition.x, defaultPosition.y, measures.width, measures.height);
            })
        };

        imgSelected.src = URL.createObjectURL(file);
    }
    
    function init(){
        fetch('http://localhost:3000/midiakits')
            .then(response => response.json())
            .then(imageNames => imageNames
                .map(imageName => './imgs/midiakit/' + imageName))
            .then(imagePaths => {
                listOfCanvasToApplyLogo = imagePaths.map(imagePath => {
                    var canvas = document.createElement('canvas');
                    var canvasContext = canvas.getContext('2d');

                    var image = new Image();
                    image.onload = function () {
                        canvas.width = image.width;
                        canvas.height = image.height;

                        canvasContext.drawImage(image, 0, 0);
                    };
                    image.src = imagePath;
                    return canvas;
                });
            })
    }
    
    document.body.onload = init;
    
    document.getElementById('files').onchange = handleFileSelect;
    document.getElementById('downloadImage').onclick = downloadImage;
    
})();
