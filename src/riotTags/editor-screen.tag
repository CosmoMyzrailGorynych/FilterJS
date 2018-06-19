editor-screen
    .Tabs
        button(onclick="{openImage}" title="Open Image")
            icon(icon="loadImage")
        button(onclick="{newImage}" title="New Image")
            icon(icon="newImage")
        .aTab(class="{active: tab === 'output'}" onclick="{switchTab('output')}") Rendered Image
        .aTab(class="{active: tab === 'edit'}" onclick="{switchTab('edit')}") Editor
        button(onclick="{saveFilter}" title="Save filter")
            icon(icon="save")
        button(onclick="{openFilter}" title="Open Filter")
            icon(icon="folder")
        button(onclick="{newFilter}" title="New Filter")
            icon(icon="newFilter")
    #theEditingPanel(show="{tab === 'edit'}")
        canvas.aPreview(ref="prewiew" width="256" height="256")
        components-palette(filter="{filter}")
        div.split
            button Save
            button(onclick="{render}") Render
        graph-editor(graph="{filter.graph}" view="{filter.view}")
    #theOutputScreen(show="{tab === 'output'}" )
        // .anOriginal
        .anOutput(ref="output")
        button(if="{currentResult}" onclick="{copyToClipboard}") Copy to Clipboard
        button(if="{currentResult}" onclick="{exportPNG}") Export as PNG
        button(if="{currentResult}" onclick="{exportJPG}") Export as JPG
        input(type="file" hidden ref="imageSaver" onchange="{finishExportImage}" accept=".{imageSaveFormat}" nw-saveas="{filter.name}.{imageSaveFormat}")
        input(type="file" hidden ref="imageFinder" onchange="{finishImportImage}" accept="image/*")
        input(type="file" hidden ref="filterSaver" onchange="{finishSaveFilter}" nw-saveas="{filter.name}.fjs" accept=".fjs")
        input(type="file" hidden ref="filterFinder" onchange="{finishLoadFilter}" accept=".fjs")
    script.
        const glob = require('./js/global.js'),
              Filter = require('./js/types/Filter.js'),
              fs = require('fs-extra');
        this.tab = 'edit';
        this.filter = glob.filter = new Filter('New filter');
        this.loadSampleImage = () => {
            var sampleImage = document.createElement('img');
            sampleImage.onload = () => {
                glob.sourceImage.getContext('2d').drawImage(sampleImage, 0, 0);
                setTimeout(this.render, 0);
            };
            sampleImage.src = 'img/sampleImage.png';
        };
        this.on('mount', this.loadSampleImage);
        this.imageSaveFormat = 'png';

        this.switchTab = tab => e => {
            this.tab = tab;
        };

        this.render = e => {
            this.filter.exec()
            .then(results => {
                this.currentResult = results;
                var c = this.refs.prewiew,
                    cx = c.getContext('2d');
                while (this.refs.output.hasChildNodes()) {
                    this.refs.output.removeChild(this.refs.output.lastChild);
                }
                this.refs.output.appendChild(results);
                cx.clearRect(0, 0, c.width, c.height);
                cx.drawImage(results, 0, 0, c.width, c.height);
                this.update();
            })
            .then(() => this.filter.cleanUp());
        };

        this.openImage = e => {
            this.refs.imageFinder.click();
        };
        this.newImage = e => {
            var width = Number(prompt('Image width:', 512));
            if (width && width > 0) {
                var height = Number(prompt('Image height:', 512));
                if (height && height > 0) { 
                    var c = document.createElement('canvas');
                    c.width = width;
                    c.height = height;
                    glob.sourceImage = c;
                }
            }
        };
        this.saveFilter = e => {
            this.refs.filterSaver.click();
        };
        this.openFilter = e => {
            if (this.filter.graph.length > 2) {
                if (!confirm('Are you sure you want to open another filter?\nAll the unsaved changes will be lost!')) {
                    return false;
                }
            }
            this.refs.filterFinder.click();
        };
        this.newFilter = e => {
            if (confirm('Are you sure you want to create a new filter?\nAll the unsaved changes will be lost!')) {
                this.filter = glob.filter = new Filter('New filter');
                this.loadSampleImage();
                this.update();
            }
        };
        this.copyToClipboard = e => {
            var clip = nw.Clipboard.get();
            clip.set(this.currentResult.toDataURL(), 'png');
        };
        this.exportPNG = e => {
            this.imageSaveFormat = 'png';
            this.refs.imageSaver.click();
        };
        this.exportJPG = e => {
            this.imageSaveFormat = 'jpg';
            this.refs.imageSaver.click();
        };
        this.finishExportImage = e => {
            var data;
            if (this.imageSaveFormat === 'jpg') {
                data = this.currentResult.toDataURL('image/jpeg');
            } else {
                data = this.currentResult.toDataURL();
            }
            data = data.replace(/^data:image\/\w+;base64,/, '');
            var buff = new Buffer(data, 'base64');
            fs.writeFile(e.target.value, buff);
            e.target.value = '';
        };
        this.finishImportImage = e => {
            var img = document.createElement('img');
            img.onload = () => {
                glob.sourceImage.width = img.width;
                glob.sourceImage.height = img.height;
                var x = glob.sourceImage.getContext('2d');
                x.clearRect(0, 0, img.width, img.height);
                x.drawImage(img, 0, 0);
            };
            e.target.value = '';
        };
        this.finishSaveFilter = e => {
            fs.outputFile(e.target.value, this.filter.toJSON(), {
                encoding: 'utf8'
            });
            e.target.value = '';
        };
        this.finishLoadFilter = e => {
            fs.readFile(e.target.value, {
                encoding: 'utf8'
            })
            .then(data => {
                this.Filter.fromJSON(data);
            });
            e.target.value = '';
        };
