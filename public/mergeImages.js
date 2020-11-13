function MidiaKitApplicator(config) {
    this.canvas = new fabric.Canvas();
    this.widthLimitToApply = config.widthLimit;
    this.heightLimitToApply = config.heightLimit;
    this.proportionOfLimit = this.widthLimitToApply / this.heightLimitToApply;
    this.midiaKits = config.midiaKits;
    this.logo = null;
    this.zip = new JSZip();
}

MidiaKitApplicator.prototype.getImageFromUrl = function (url) {
    return new Promise(function (resolve) {
        fabric.Image.fromURL(url, resolve);
    });
}

MidiaKitApplicator.prototype.setBackgroundImage = function (backgroundImage) {
    this.canvas.setWidth(backgroundImage.width);
    this.canvas.setHeight(backgroundImage.height);
    this.canvas.setBackgroundImage(backgroundImage, this.canvas.renderAll.bind(this.canvas));
}

MidiaKitApplicator.prototype.setLogoByUrl = function (logoUrl) {
    var self = this;
    return this.getImageFromUrl(logoUrl)
        .then(function (logo) {
            // var proportionOfImage = logo.width / logo.height;
            //
            // if (proportionOfImage <= self.proportionOfLimit) {
            //     //vertical
            //     logo.scaleToHeight(self.heightLimitToApply);
            // } else {
            //     //horizontal
            //     logo.scaleToWidth(self.widthLimitToApply);
            // }
            self.logo = logo.set({originX: 'right', originY: 'bottom'});
        });
}

MidiaKitApplicator.prototype.setProportionOfLogo = function (midiaKit) {
    var proportionOfImage = this.logo.width / this.logo.height;
    var areaLimits = midiaKit.areaLimits;
    var proportionOfLimit = areaLimits.width / areaLimits.height;

    if (proportionOfImage <= proportionOfLimit) {
        //vertical
        this.logo.scaleToHeight(areaLimits.height);
    } else {
        //horizontal
        this.logo.scaleToWidth(areaLimits.width);
    }
}

MidiaKitApplicator.prototype.applyLogo = function (imageToApplyLogo, whereApply) {
    this.canvas.clear();

    this.setBackgroundImage(imageToApplyLogo);

    if (!this.logo) {
        alert('N�o foi informado um logo para uso.');
        throw new Error('N�o foi informado um logo para uso.');
    }
    this.logo.set(whereApply);
    this.canvas.add(this.logo);
}

MidiaKitApplicator.prototype.prepareDownload = function (name) {
    var urlBase64 = this.canvas.toDataURL({
        format: 'png',
    });
    this.zip.file(name, urlBase64.replace('data:image/png;base64,', ''), {base64: true});
}

MidiaKitApplicator.prototype.download = function () {
    return this.zip.generateAsync({type: 'blob'})
        .then(function (content) {
            saveAs(content, 'midiakit.zip');
        });
}

MidiaKitApplicator.prototype.processMidiaKits = function () {
    var self = this;
    var promisePipeline = Promise.resolve();
    for (const midiakit of Object.values(this.midiaKits)) {
        promisePipeline = promisePipeline.then(function () {
            self.setProportionOfLogo(midiakit);
            return self.processMidiaKit(midiakit);
        });
    }
    return promisePipeline;
}

MidiaKitApplicator.prototype.processMidiaKit = function (midiaKit) {
    var self = this;

    return Promise.all(
        midiaKit.urls.map(self.getImageFromUrl))
        .then(function (images) {
            images.forEach(function (image) {
                var imageSrcSplited = image.getSrc().split('/');
                var imageName = imageSrcSplited[imageSrcSplited.length - 1];
                self.applyLogo(image, {
                    left: midiaKit.finalPosition.x,
                    top: midiaKit.finalPosition.y
                });
                self.prepareDownload(imageName);
            });
        });
}

MidiaKitApplicator.prototype.execute = function () {
    var self = this;
    return this.processMidiaKits()
        .then(function () {
            return self.download();
        })
        .then(function () {
            alert('Midiakits baixados');
        });
}

var fileSelectLabel = document.getElementById('file-select-label');

function handleFileSelect(event) {
    var file = event.target.files[0];
    if (!file.type.match('image.*')) {
        alert('Arquivo deve ser do tipo JPG ou PNG');
        return;
    }
    var srcFile = URL.createObjectURL(file);

    alert('Estamos montando o midia kit. Voc� receber� um alert quando terminarmos :-)');

    const configMidiaKit = {
        midiaKits: {
            '1200X1200': {
                urls: [
                    '/img/apps/imobiliaria/kit/Mkit__AssinaturaEletronica.png',
                    '/img/apps/imobiliaria/kit/Mkit__Boletos1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__CartaodeCredito1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__CheckList1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__FaleConosco1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__Fiador1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__ImpostodeRenda1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__Manutencao1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__Negociacao1200X1200 .png',
                    '/img/apps/imobiliaria/kit/Mkit__Notificacoes1200X1200.png',
                    '/img/apps/imobiliaria/kit/Mkit__Repasse1200X1200.png'
                ],
                areaLimits: {
                    width: 320,
                    height: 200,
                },
                finalPosition: {
                    x: 1170,
                    y: 1170,
                }
            },
            '1080x1920': {
                urls: [
                    '/img/apps/imobiliaria/kit/Mkit__AssinaturaEletronica1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__Boletos1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__CartaodeCredito1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__CheckList1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__FaleConosco1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__Fiador1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__ImpostodeRenda1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__Manutencao1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__Negociacao1080X1920.png',
                    '/img/apps/imobiliaria/kit/Mkit__Repasse1080X1920.png'
                ],
                areaLimits: {
                    width: 320,
                    height: 200,
                },
                finalPosition: {
                    x: 1020,
                    y: 1600,
                }
            }
        }
    };

    var midiaKitApplicator = new MidiaKitApplicator(configMidiaKit);

    fileSelectLabel.innerText = 'Configurando...';
    midiaKitApplicator.setLogoByUrl(srcFile)
        .then(function () {
            fileSelectLabel.innerText = 'Processando...';
            return midiaKitApplicator.execute();
        })
        .then(function () {
            fileSelectLabel.innerText = 'Midia Kit gerado e baixado com sucesso!';
        })
}

document.getElementById('file-select').onchange = handleFileSelect;
