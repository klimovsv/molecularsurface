'use strict';



class Application {
    constructor(){
        this.scene = new Scene();
    }

    getByHttp(id) {
        let thisApp = this;
        const xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                thisApp.scene.createMolecule(xmlHttp.responseText);
        };
        xmlHttp.open("GET", `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${id}/JSON?record_type=3d`, true);
        xmlHttp.send(null);
    };

    getByFile(file) {
        let thisApp = this;

        const filename = file.name;

        if(/\w+.json/.test(filename)){
            const reader = new FileReader();

            reader.onload = function (event) {
                thisApp.scene.createMolecule(event.target.result)
            };

            reader.readAsText(file);
        }else {
            readFile(file)
        }
    };
}

const app = new Application();
const scene = app.scene;
let stats = new Stats();
document.body.appendChild( stats.dom );
stats.showPanel(0);
animation = function () {
    stats.begin();
    scene.cameraControls.update();
    requestAnimationFrame(animation);
    scene.renderer.render(scene.scene,scene.camera);
    stats.end();
};