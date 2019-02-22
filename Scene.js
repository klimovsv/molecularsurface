'use strict';
let animation;
class Scene{

    get meshes(){
        return {
            0 : this.molecule.mesh,
            1 : this.molecule.solventMesh,
            2 : this.molecule.vanDerWaalsMesh,
        }
    }

    get mesh(){
        return this.meshes[this.meshNumb];
    }

    constructor(){
        let self = this;
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
        this.camera.position.set(10,0,10);
        this.camera.lookAt(new THREE.Vector3(0,0,0));

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth -60, window.innerHeight - 60 );
        this.renderer.autoClear = true;
        this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
        this.renderer.shadowMapEnabled = true;
        this.renderer.setClearColor(new THREE.Color(0x303030));

        this.cameraControls = new THREE.OrbitControls(this.camera,this.renderer.domElement);
        this.cameraControls.target = new THREE.Vector3(0,0,0);
        this.cameraControls.maxPolarAngle = Math.PI;

        document.body.appendChild( this.renderer.domElement );

        this.meshNumb = 0;
        this.molecule = undefined;
        this.scene = new THREE.Scene();




        const ambient = new THREE.AmbientLight(new THREE.Color(0.0005,0.0005,0.0005));
        this.scene.add( ambient );


        const color =0x010101;
        const intensity = 0.6;
        const spotLight = new THREE.SpotLight(color,intensity);
        spotLight.castShadow = true;
        spotLight.shadowCameraVisible = true;
        spotLight.angle = 0.90;
        spotLight.shadowDarkness = 0.1;
        spotLight.position.set(20,20,20);
        this.scene.add(spotLight);

        let added = false;
        let helper = new THREE.CameraHelper(spotLight.shadow.camera);
        // this.scene.add(helper);


        const materialr = new THREE.LineBasicMaterial({color:0xff0000});
        const materialg = new THREE.LineBasicMaterial({color:0x00ff00});
        const materialb = new THREE.LineBasicMaterial({color:0x0000ff});
        const o = new THREE.Vector3(0,0,0);
        const o1 = new THREE.Vector3(10,0,0);
        const o2 = new THREE.Vector3(0,10,0);
        const o3 = new THREE.Vector3(0,0,10);
        const g1 = new THREE.Geometry();
        const g2 = new THREE.Geometry();
        const g3 = new THREE.Geometry();
        g1.vertices.push(o,o1);
        g2.vertices.push(o,o2);
        g3.vertices.push(o,o3);
        const l1 = new THREE.Line(g1,materialr);
        const l2 = new THREE.Line(g2,materialg);
        const l3 = new THREE.Line(g3,materialb);
        this.scene.add(l1);
        this.scene.add(l2);
        this.scene.add(l3);


        let lightPosXOZ = new Vector(spotLight.position.x,0,spotLight.position.z);
        let lightPos = new Vector(spotLight.position.x,spotLight.position.y,spotLight.position.z);
        let axis = lightPosXOZ.cross(lightPos).normalize();
        // console.log(axis);
        let OY = new Vector(0,1,0);
        let rotAxisPlus = Vector.rotateMatr(axis,1);
        let rotAxisMinus = Vector.rotateMatr(axis,-1);
        let rotOYplus = Vector.rotateMatr(OY,1);
        let rotOYminus = Vector.rotateMatr(OY,-1);
        // console.log(rotOYminus);
        // console.log(rotOYplus);
        // console.log(lightPosXOZ);
        window.addEventListener('keydown', function(event) {
            switch (event.keyCode) {
                case 82: // R
                    self.scene.remove(self.mesh);
                    self.meshNumb = 0;
                    self.scene.add(self.mesh);
                    break;

                case 84: // T
                    self.scene.remove(self.mesh);
                    self.meshNumb = 1;
                    self.scene.add(self.mesh);
                    break;

                case 89: // Y
                    self.scene.remove(self.mesh);
                    self.meshNumb = 2;
                    self.scene.add(self.mesh);
                    break;

                case 65: // A
                    lightPosXOZ  = lightPosXOZ.multiplyByMatr(rotOYminus);
                    axis = axis.multiplyByMatr(rotOYminus);
                    rotAxisPlus = Vector.rotateMatr(axis,1);
                    rotAxisMinus = Vector.rotateMatr(axis,-1);
                    spotLight.position.set(lightPosXOZ.x,spotLight.position.y,lightPosXOZ.z);
                    lightPos = new Vector(spotLight.position.x,spotLight.position.y,spotLight.position.z);
                    break;
                case 68: // D
                    lightPosXOZ  = lightPosXOZ.multiplyByMatr(rotOYplus);
                    axis = axis.multiplyByMatr(rotOYplus);
                    rotAxisPlus = Vector.rotateMatr(axis,1);
                    rotAxisMinus = Vector.rotateMatr(axis,-1);
                    spotLight.position.set(lightPosXOZ.x,spotLight.position.y,lightPosXOZ.z);
                    lightPos = new Vector(spotLight.position.x,spotLight.position.y,spotLight.position.z);
                    break;
                case 87: // W
                    lightPos  = lightPos.multiplyByMatr(rotAxisPlus);
                    lightPosXOZ = new Vector(lightPos.x,0,lightPos.z);
                    spotLight.position.set(lightPos.x,lightPos.y,lightPos.z);
                    break;
                case 83: // S
                    lightPos = lightPos.multiplyByMatr(rotAxisMinus);
                    lightPosXOZ = new Vector(lightPos.x,0,lightPos.z);
                    spotLight.position.set(lightPos.x,lightPos.y,lightPos.z);
                    break;
                case 187:
                    if(!added){
                        added = true;
                        self.scene.add(helper);
                    }else{
                        added = false;
                        self.scene.remove(helper);
                    }
                    break;
            }
        }, false);

    }

    createMolecule(text) {

        if (!(this.molecule === undefined)){
            this.scene.remove(this.mesh);
        }

        this.molecule = new Molecule(text);
        this.scene.add(this.mesh);
        //this.scene.add(this.molecule.helper);

        requestAnimationFrame(animation);
    };
}
