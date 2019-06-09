editor-screen
    .Tabs
        button(onclick="{openImage}" title="Open Image")
            icon(icon="loadImage")
        button(onclick="{popUpSampleMenu}" title="Open a Sample Image")
            icon(icon="sampleImages")
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
            button(onclick="{saveCurrentFilter}") Save
            button(onclick="{render}") Render
        graph-editor(graph="{filter.graph}" view="{filter.view}" ref="graphEditor" error="{error}")
    #theOutputScreen(show="{tab === 'output'}" )
        // .anOriginal
        .anOutput
            .anOutputWrap
                .aLabel#theShowDifferenceLabel Show difference
                .aLabel#theShowOriginalLabel Show original
                div(ref="original")
                div(ref="output")

        .flexrow
            button(if="{currentResult}" onclick="{copyToClipboard}") Copy to Clipboard
            button(if="{currentResult}" onclick="{exportPNG}") Export as PNG
            button(if="{currentResult}" onclick="{exportJPG}") Export as JPG
        input(type="file" hidden ref="imageSaver" onchange="{finishExportImage}" accept=".{imageSaveFormat}" nwsaveas="{filter.name}.{imageSaveFormat}")
        input(type="file" hidden ref="imageFinder" onchange="{finishImportImage}" accept="image/*")
        input(type="file" hidden ref="filterSaver" onchange="{finishSaveFilter}" nwsaveas="{filter.name}.fjs" accept=".fjs")
        input(type="file" hidden ref="filterFinder" onchange="{finishLoadFilter}" accept=".fjs")
    script.
        const glob = require('./js/global.js'),
              Filter = require('./js/types/Filter.js'),
              BlockError = require('./js/types/BlockError.js'),
              fs = require('fs-extra'),
              path = require('path');
        this.tab = 'edit';
        this.filter = glob.filter = new Filter('New filter');
        this.loadSampleImage = image => {
            var sampleImage = document.createElement('img');
            sampleImage.onload = () => {
                glob.sourceImage.getContext('2d').drawImage(sampleImage, 0, 0);
                this.filter.width = sampleImage.width;
                this.filter.height = sampleImage.height;
                setTimeout(this.render, 0);
            };
            sampleImage.src = image || 'img/ThatGirl.png';
        };
        this.on('mount', this.loadSampleImage);
        this.imageSaveFormat = 'png';

        this.switchTab = tab => e => {
            this.tab = tab;
        };

        this.render = e => {
            this.filter.exec()
            .then(results => {
                this.error = false;
                this.currentResult = results;
                var c = this.refs.prewiew,
                    cx = c.getContext('2d');
                const orig = document.createElement('canvas'),
                      ocx = orig.getContext('2d');
                while (this.refs.output.hasChildNodes()) {
                    this.refs.output.removeChild(this.refs.output.lastChild);
                }
                while (this.refs.original.hasChildNodes()) {
                    this.refs.original.removeChild(this.refs.original.lastChild);
                }
                this.refs.output.appendChild(results);
                this.refs.original.appendChild(orig);
                cx.clearRect(0, 0, c.width, c.height);
                cx.drawImage(results, 0, 0, c.width, c.height);
                orig.width = glob.sourceImage.width;
                orig.height = glob.sourceImage.height;
                ocx.clearRect(0, 0, orig.width, orig.height);
                ocx.drawImage(glob.sourceImage, 0, 0);
                this.update();
            })
            .catch(e => {
                this.error = e;
                if (!(this.error instanceof BlockError)) {
                    // Show the error at the 'output image' block
                    this.error = new BlockError(this.error, glob.filter.graph[0]);
                }
                this.update();
            })
            .finally(() => this.filter.cleanUp());
        };

        this.openImage = e => {
            this.refs.imageFinder.click();
        };
        this.newImage = e => {
            var width = Number(prompt('Image width:', 1024));
            if (width && width > 0) {
                var height = Number(prompt('Image height:', 1024));
                if (height && height > 0) { 
                    glob.sourceImage.width = glob.width = width;
                    glob.sourceImage.height = glob.height = height;
                    glob.sourceImage.getContext('2d').clearRect(0, 0, width, height);
                    setTimeout(this.render, 0);
                }
            }
        };
        const sampleMenu = new nw.Menu();
        sampleMenu.append(new nw.MenuItem({
            label: 'A Girl and a Book',
            click: () => {
                this.loadSampleImage('img/ThatGirl.png');
            }
        }));
        sampleMenu.append(new nw.MenuItem({
            label: 'Speckles',
            click: () => {
                this.loadSampleImage('img/Speckles.png');
            }
        }));
        sampleMenu.append(new nw.MenuItem({
            label: 'A Doggo',
            click: () => {
                this.loadSampleImage('img/Doggo.png');
            }
        }));
        sampleMenu.append(new nw.MenuItem({
            label: 'The Duke',
            click: () => {
                this.loadSampleImage('img/TheDuke.png');
            }
        }));
        sampleMenu.append(new nw.MenuItem({
            label: 'A City',
            click: () => {
                this.loadSampleImage('img/City.png');
            }
        }));
        this.popUpSampleMenu = e => {
            sampleMenu.popup(e.clientX, e.clientY);
            e.preventDefault();
        };

        this.saveFilter = e => {
            this.refs.filterSaver.click();
        };
        this.saveCurrentFilter = e => {
            if (this.filterPath) {
                fs.outputFile(this.filterPath, this.filter.toJSON(), {
                    encoding: 'utf8'
                })
                .then(() => {
                    alertify.success('Saved!');
                });
            } else {
                this.refs.filterSaver.click();
            }
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
                this.filterPath = false;
                document.title = 'FilterJS';
                this.error = false;
                this.loadSampleImage();
                this.update();
                this.refs.graphEditor.updateLinks();
            }
        };
        this.copyToClipboard = e => {
            var clip = nw.Clipboard.get();
            clip.set(this.currentResult.toDataURL? this.currentResult.toDataURL() : this.currentResult.src, 'png');
        };
        this.exportPNG = e => {
            this.imageSaveFormat = 'png';
            this.update();
            this.refs.imageSaver.click();
        };
        this.exportJPG = e => {
            this.imageSaveFormat = 'jpg';
            this.update();
            this.refs.imageSaver.click();
        };
        this.finishExportImage = e => {
            var data;
            if (this.imageSaveFormat === 'jpg') {
                data = this.currentResult.toDataURL? this.currentResult.toDataURL('image/jpeg') : this.currentResult.src;
            } else {
                data = this.currentResult.toDataURL? this.currentResult.toDataURL() : this.currentResult.src;
            }
            data = data.replace(/^data:image\/\w+;base64,/, '');
            var buff = new Buffer(data, 'base64');
            fs.writeFile(e.target.value, buff);
            e.target.value = '';
        };
        this.finishImportImage = e => {
            var img = document.createElement('img');
            img.onload = () => {
                glob.sourceImage.width = glob.width = img.width;
                glob.sourceImage.height = glob.height = img.height;
                var x = glob.sourceImage.getContext('2d');
                x.clearRect(0, 0, img.width, img.height);
                x.drawImage(img, 0, 0);
                setTimeout(this.render, 0);
            };
            img.src = 'file:///' + e.target.value;
            e.target.value = '';
        };
        this.finishSaveFilter = e => {
            fs.outputFile(e.target.value, this.filter.toJSON(), {
                encoding: 'utf8'
            })
            .then(() => {
                alertify.success('Saved!');
            });
            this.filterPath = e.target.value;
            document.title = `${path.basename(e.target.value)} · FilterJS`;
            e.target.value = '';
        };
        this.finishLoadFilter = e => {
            this.filter = glob.filter = new Filter('New filter');
            this.error = false;
            fs.readFile(e.target.value, {
                encoding: 'utf8'
            })
            .then(data => {
                this.filter.fromJSON(data);
                this.update();
                this.refs.graphEditor.updateLinks();
            });
            this.filterPath = e.target.value;
            document.title = `${path.basename(e.target.value)} · FilterJS`;
            e.target.value = '';
        };
