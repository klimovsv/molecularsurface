'use strict';
class Molecule{
    static get colors(){
        return colors;
    }
    static get vanDerWaals() {
        return vanDerWaals;
    }

    static testInter(a1,a2){
        return (a1.r + a2.r) > Vector.distance(a1.pos,a2.pos);
    }

    static testAtoms(a1,a2,r){
        return (a1.r + a2.r + 2 * r) > Vector.distance(a1.pos, a2.pos);
    }

    toroidalGeometry(startVec,angle,X){
        const self = this;
        let vertices = [];
        let normals = [];
        let faces = [];
        const OZ = new Vector(0,0,1);
        let OX = new Vector(1,0,0);
        let delta = angle / self.partition;
        let vertexArray = [],normalArray = [];
        let tmpVec = startVec.clone();
        vertexArray.push(tmpVec.clone().translate(X));
        normalArray.push(tmpVec.clone().multiply(-1).normalize());

        let mat3 = Vector.rotateMatr(OZ,delta);
        for (let i = 1  ; i < self.partition + 1 ; i++){
            tmpVec = tmpVec.multiplyByMatr(mat3);
            vertexArray.push(tmpVec.clone().translate(X));
            normalArray.push(tmpVec.clone().multiply(-1).normalize());
        }


        delta = 360 / self.layers;
        mat3 = Vector.rotateMatr(OX,delta);
        let count = 0;
        for ( let i = 0 ; i < self.layers + 1 ; i++,count++){
            for ( let n = 0 ; n < vertexArray.length ; n++ ){
                let newVec = vertexArray[n].multiplyByMatr(mat3);
                let newNorm = normalArray[n].multiplyByMatr(mat3);
                normalArray[n] = newNorm;
                vertexArray[n] = newVec;

                vertices.push(newVec.clone());
                normals.push(newNorm.clone());

            }
        }

        let getVertInd = function (partitions) {
            return function (x,y) {
                return partitions * x + y;
            }
        };

        let ind = getVertInd(self.partition + 1,self.layers + 1);

        for(let i = 0 ; i < count - 1; i++){
            for (let n = 0 ;n < vertexArray.length - 1; n++){
                let a = ind(i+1,n),b = ind(i,n),c =ind(i,n+1);
                let x = ind(i+1,n),y = ind(i,n+1),z = ind(i+1,n+1);
                let faceA = new THREE.Face3(a,c,b);
                let faceB = new THREE.Face3(x,z,y);
                let color = new THREE.Color(255,255,153);
                faceA.vertexColors = [color,color,color];
                faceB.vertexColors = [color,color,color];
                faceA.color = color;
                faceB.color = color;
                faceA.vertexNormals = [normals[a],normals[c],normals[b]];
                faceB.vertexNormals = [normals[x],normals[z],normals[y]];
                faces.push(faceA, faceB);
            }
        }


        const toroidalGeometry = new THREE.Geometry();
        toroidalGeometry.vertices=vertices;
        toroidalGeometry.faces=faces;
        return toroidalGeometry;
    }

    checkAng(testArray){
        let up = this.up;
        let check = this.check;
        let rVec = this.rVec;
        let change = this.change;

        let newTestArray = testArray.map(pair => {
            return pair.map( v => {
                let v1 = v.clone();
                v1[change] = 0;
                return v1.normalize();
            }) ;
        });

        newTestArray = newTestArray.map(pair =>{
            if(pair[0].cross(pair[1])[check] > 0){
                return [pair[1],pair[0]];
            }
            return pair;
        });
        // console.log(newTestArray);

        // console.log(Math.acos(0));
        let angled = [];
        newTestArray.forEach(pair => {
            let newPair = [];
            pair.forEach(v => {
                if(v[up] > 0 ){
                    newPair.push(Math.PI - Math.acos(v.angCos(rVec)));
                } else {
                    newPair.push(Math.PI + Math.acos(v.angCos(rVec)));
                }
            });
            angled.push(newPair);
        });


        // console.log(angled);

        let comp = function(pair1 , pair2){
            return pair1[0] - pair2[0];
        };
        angled.sort(comp);
        angled = angled.map(pair => {
            if(pair[1] < pair[0]) return [pair[0],pair[1] + Math.PI *2];
            else return pair;
        });

        angled.forEach(pair => {
            if((pair[1] - pair[0]) > Math.PI){
                console.log("странно")
            }
        });

        // console.log(angled);
        let min = angled[0][0];
        let max = angled[0][1];
        // let len = angled.length;
        for( let i = 1 ; i < angled.length ; i++){
            // console.log(angled[i],i);
            let tmp1 = angled[i][0];
            let tmp2 = angled[i][1];
            if(max >= tmp1){
                if(max <= tmp2){
                    max = tmp2;
                }
                //max = angled[i][1];
                //console.log(angled[i-1]);
                // angled = angled.splice(i,1);
                // console.log(angled[i-1]);
                // angled[i-1][1] = max;
                // i--;
                // len--;
            }else{
                // console.log((max - min),(max - min)<Math.PI *2);
                // min = angled[i][0];
                // max = angled[i][1];
                return true
            }
        }

        // console.log((max - min),(max - min)< Math.PI * 2);
        return (max - min) < Math.PI * 2;
        // console.log(angled);
        // let t = angled[0];
        // console.log(angled[0]);
        // console.log(t[1]);
        // console.log(t[0]);
        // console.log(angled[0][1] - angled[0][0]);

    }

    testAngles(testArray){

        const test = function (coords, pair) {
            const p1 = pair[0];
            const p2 = pair[1];
            const c1 = coords[0];
            const c2 = coords[1];
            return p1[c2] !== 0 && p2[c1] !== 0 || p1[c1]!==0 && p2[c2]!==0;
        };

        let testPair = testArray[0];
        let oxy = ['x','y'] , oxz = ['x','z'] , ozy = ['z','y'];
        let oxyFlag = false,oxzFlag = false,ozyFlag = false;

        // if(test(oxy,testPair)) oxyFlag = true;
        // if(test(oxz,testPair)) oxzFlag = true;
        // if(test(ozy,testPair)) ozyFlag = true;

        // console.log(test(oxy,testPair),test(ozy,testPair),test(oxz,testPair));

        if(test(oxy,testPair)) {
            this.up = 'y';
            this.check = 'z';
            this.rVec = new Vector(1,0,0);
            this.change = 'z';
            oxyFlag = this.checkAng(testArray);
        }
        if(test(ozy,testPair)) {
            this.up = 'z';
            this.check = 'x';
            this.rVec = new Vector(0,1,0);
            this.change = 'x';
            ozyFlag = this.checkAng(testArray);
        }
        if(test(oxz,testPair)) {
            this.up = 'x';
            this.rVec = new Vector(0,0,1);
            this.check = 'y';
            this.change = 'y';
            oxzFlag = this.checkAng(testArray);
        }
        // console.log(oxyFlag,oxzFlag,ozyFlag);
        return oxyFlag || oxzFlag || ozyFlag;

    }

    toroidal(pair){
        pair = pair[0].index < pair[1].index ? [pair[1],pair[0]] : pair;
        // console.log(this.str(pair),this.drawMap.get(this.str(pair)));
        if(this.drawMap.get(this.str(pair)) === false) {
            // console.log(this.str(pair));
            // console.log("returned");
            return;
        }

        // console.log(this.str(pair));
        const testArray = this.toroidalMap.get(this.str(pair));
        // console.log(testArray!==undefined);
        // if(testArray !== undefined && !this.testAngles(testArray)) {
        // console.log("returned");
        // return;
        // }

        this.partition = 10;
        this.layers = 35;
        const self = this;
        const rad = this.solventRad;
        const o1 = self.atoms[pair[0]];
        const o2 = self.atoms[pair[1]];
        const dir = Vector.diff(o1.pos,o2.pos);
        const distDir = dir.computeLength();
        const distO1toX = o1.r + rad;
        const distO2toX = o2.r + rad;
        const cosBetwO1toXAndDir = (distO2toX**2 - distO1toX**2 - distDir**2)/-(2 * distDir * distO1toX);
        const cosBetwXtoO2AndXtoO1 = (distDir**2 - distO1toX**2 -distO2toX**2)/-(2 * distO1toX * distO2toX);
        const sinBetwO1toXAndDir = Math.sqrt(1-cosBetwO1toXAndDir**2);
        const distO1toA = distO1toX * cosBetwO1toXAndDir;
        const pointA = o1.pos.translate(dir.normalize().multiply(distO1toA));
        const distXtoA = distO1toX * sinBetwO1toXAndDir;
        const pointX1 = new Vector(o1.r * cosBetwO1toXAndDir - distO1toA,o1.r * sinBetwO1toXAndDir,0);

        const phiAng = THREE.Math.radToDeg(Math.acos(cosBetwXtoO2AndXtoO1));
        const X = new Vector(0,distXtoA,0);
        let OX = new Vector(1,0,0);
        let axis = OX.cross(dir).normalize();
        let startVec = Vector.diff(X,pointX1).translate(new Vector(0,0.002,0));

        const tmp = Math.abs(this.solventRad * Math.cos(Math.asin(-distXtoA/this.solventRad)));
        const pointX2 = new Vector(-tmp,0,0);
        const pointX3 = new Vector(tmp,0,0);

        let geometry = new THREE.Geometry();
        if(X.y >= self.solventRad){
            geometry = this.toroidalGeometry(startVec,phiAng,X);
        }else{

            // geometry = this.toroidalGeometry(startVec,phiAng,X);

            const ang = THREE.Math.radToDeg(Math.acos(Vector.diff(X,pointX1).angCos(Vector.diff(X,pointX2))));
            const start2 = Vector.diff(X,pointX3).translate(new Vector(0,0.002,0));
            geometry = this.toroidalGeometry(start2,ang,X);
            const geometry2 = this.toroidalGeometry(startVec,ang,X);

            const f = geometry2.faces;
            const v = geometry2.vertices;
            const vert = geometry.vertices;
            const faces = geometry.faces;
            f.forEach(face =>{
                face.a += vert.length;
                face.b += vert.length;
                face.c += vert.length;
                faces.push(face);
            });
            v.forEach(ver => vert.push(ver));
        }

        let toroidalGeometry = geometry;
        let material = new THREE.MeshLambertMaterial();
        material.side = THREE.FrontSide;
        material.vertexColors = THREE.FaceColors;


        let toroidalMesh = new THREE.Mesh(toroidalGeometry,material);
        toroidalMesh.position.set(pointA.x,pointA.y,pointA.z);
        if(isNaN(axis.x)){
            const OY = new Vector(0,1,0);
            let ang = 0;
            if(dir.normalize !== new Vector(-1,0,0)){
                ang = Math.PI;
            }
            toroidalMesh.rotateOnAxis(OY,ang);
        }else {
            toroidalMesh.rotateOnAxis(axis,Math.acos(OX.angCos(dir)));
        }
        toroidalMesh.castShadow = true;
        toroidalMesh.receiveShadow = true;
        toroidalMesh.autoUpdate = false;

        self.mesh.add(toroidalMesh);
    }

    static pushVector(sphere, vec){
        const rad = sphere.r;
        const pos = sphere.pos;
        const dir = Vector.diff(pos,vec);
        return pos.translate(dir.normalize().multiply(rad));
    }

    generateSectorMesh(keyPoints,s,depth,frontSide,color,testFunc,normalOrient){
        const faces = [];
        const vertices = keyPoints.map(keyPoint => Molecule.pushVector(s,keyPoint));
        const normals = vertices.map(keyPoint => Vector.diff(s.pos,keyPoint).multiply(normalOrient).normalize());
        const polyQueue = [{points : vertices , indices : [0,1,2]}];

        let maxInd = 2;
        let nmbPolygons = 1;
        for(let i = 0 ; i < depth ; i++){
            let added = 0;
            for(let n = 0 ; n < nmbPolygons ; n++){
                const poly = polyQueue.shift();
                const centers = [];
                const indices = [];
                for(let m = 0 ; m < 3 ; m++){
                    const start = poly.points[m%3];
                    const end = poly.points[(m+1)%3];
                    const direction = Vector.diff(start,end);
                    let cent = start.translate(direction.normalize().multiply(direction.computeLength()/2));
                    cent = Molecule.pushVector(s,cent);
                    centers.push(cent);
                    vertices.push(cent);
                    normals.push(Vector.diff(s.pos,cent).multiply(normalOrient).normalize());
                    maxInd++;
                    indices.push(maxInd);
                }
                for(let m = 0 ; m < 3 ; m++){
                    const vertex = poly.points[m];
                    const ind1 = m;
                    const ind2 = (m-1) < 0 ? 2 : m-1;
                    const points = [vertex,centers[ind1],centers[ind2]];
                    if(testFunc(points)){
                        polyQueue.push({points : points , indices:[poly.indices[m],indices[ind1],indices[ind2]]});
                        added++;
                    }
                }
                if(testFunc(centers)) {
                    added++;
                    polyQueue.push({points: centers, indices: indices});
                }
            }
            nmbPolygons = added;
        }

        polyQueue.forEach((poly) => {
            let face = new THREE.Face3(poly.indices[0],poly.indices[1],poly.indices[2]);
            face.vertexNormals = [normals[poly.indices[0]],normals[poly.indices[1]],normals[poly.indices[2]]];
            face.color = color;
            face.vertexColors = [color,color,color];
            faces.push(face);
        });

        const geometry = new THREE.Geometry();
        geometry.faces = faces;
        geometry.vertices = vertices;


        const material = new THREE.MeshLambertMaterial();
        material.vertexColors = THREE.FaceColors;
        material.side = THREE.FrontSide;
        //console.log(geometry);
        let mesh = new THREE.Mesh(geometry,material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.autoUpdate = false;
        return mesh;
    }

    getKeyPoints(atoms,solvent){
        return atoms.map((atom) => {
            return Molecule.pushVector({r:solvent.r,pos:solvent.pos} ,atom.pos);
        })
    }

    push(arr,concArr){
        if(arr!== undefined){
            arr.push(concArr);
        }else{
            arr = [concArr]
        }
        return arr;
    }

    sphereSector(arr){
        this.i++;
        const O1 = this.atoms[arr[0]];
        const O2 = this.atoms[arr[1]];
        const O3 = this.atoms[arr[2]];

        const pairO1O2 = O1.index < O2.index ? [O1.index,O2.index] : [O2.index,O1.index];
        const pairO1O3 = O1.index < O3.index ? [O1.index,O3.index] : [O3.index,O1.index];
        const pairO2O3 = O2.index < O3.index ? [O2.index,O3.index] : [O3.index,O2.index];
        // console.log(pairO1O3,pairO1O2,pairO2O3);

        const dO1O2 = Vector.diff(O1.pos,O2.pos).computeLength();
        const dO1O3 = Vector.diff(O1.pos,O3.pos).computeLength();
        const dO2O3 = Vector.diff(O2.pos,O3.pos).computeLength();
        const dO2X = O2.r + this.solventRad;
        const dO1X = O1.r + this.solventRad;
        const dO3X = O3.r + this.solventRad;

        const cosO2O1X = (dO2X**2 - dO1O2**2 - dO1X**2)/-(2 * dO1O2 * dO1X);
        const cosO3O2X = (dO3X**2 - dO2O3**2 - dO2X**2)/-(2 * dO2O3 * dO2X);
        const cosO1O3X = (dO1X**2 - dO1O3**2 - dO3X**2)/-(2 * dO1O3 * dO3X);

        const dO1A = dO1X * cosO2O1X; // pairO1O2
        const dO2B = dO2X * cosO3O2X; // pairO2O3
        const dO3C = dO3X * cosO1O3X; // pairO1O3

        const dir = Vector.diff(O1.pos,O2.pos);
        const dirB = Vector.diff(O2.pos,O3.pos);
        const dirC = Vector.diff(O3.pos,O1.pos);

        const pointA = O1.pos.translate(dir.normalize().multiply(dO1A));
        const pointB = O2.pos.translate(dirB.normalize().multiply(dO2B));
        const pointC = O3.pos.translate(dirC.normalize().multiply(dO3C));

        //неправильная часть(неправильно считается последний косинус), переделать
        const dAX = dO1X * Math.sqrt(1 - cosO2O1X**2);
        // const dBX = dO2X * Math.sqrt(1 - cosO3O2X**2);
        // const dCX = dO3X * Math.sqrt(1 - cosO1O3X**2);

        //console.log(Math.sqrt(dAX**2 + dO1A**2) - dO1X);
        const AO3 = Vector.diff(pointA,O3.pos);
        // const BO1 = Vector.diff(pointB,O1.pos);
        // const CO2 = Vector.diff(pointC,O2.pos);

        // const dBO1 = BO1.computeLength();
        // const dCO2 = CO2.computeLength();
        const dAO3 = AO3.computeLength();


        //console.log(dAO3);
        const cosAXO3 = (dAO3**2 - dAX**2 - dO3X**2)/-(2 * dAX * dO3X);
        // const cosBXO1 = (dBO1**2 - dBX**2 - dO1X**2)/-(2 * dBX * dO1X);
        // const cosCXO2 = (dCO2**2 - dCX**2 - dO2X**2)/-(2 * dCX * dO2X);

        const cosO1O2O3 = (dO1O3**2 - dO2O3**2 - dO1O2**2)/-(2 * dO2O3 * dO1O2);
        // //console.log(cosO1O2O3);
        const cosO2O3O1 = (dO1O2**2 - dO2O3**2 - dO1O3**2)/-(2 * dO2O3 * dO1O3);
        const cosO3O1O2 = (dO2O3**2 - dO1O3**2 - dO1O2**2)/-(2 * dO1O3 * dO1O2);


        const dO3toOX = dO2O3 * Math.sqrt(1 - cosO1O2O3**2);
        // const dO2to = dO1O2 * Math.sqrt(1 - cosO3O1O2**2);
        // const dO1to = dO1O3 * Math.sqrt(1 - cosO2O3O1**2);

        //console.log(dO3toOX);
        const cosXOoY = (dAX - cosAXO3 *dO3X) / dO3toOX;
        // const cosXB = (dBX - cosBXO1 * dO1X) / dO1to;
        // const cosXC = (dCX - cosCXO2 * dO2X) / dO2to;

        //понять, какие менно торы не рисовать
        if(Math.abs(cosXOoY) > 1) {
            if(cosO1O2O3 < 0) {
                // console.log("cos > 1",this.str(pairO1O3));
                this.drawMap.set(this.str(pairO1O3),false);
            }
            if(cosO2O3O1 < 0) {
                // console.log("cos > 1",this.str(pairO1O2));
                this.drawMap.set(this.str(pairO1O2),false);
            }
            if(cosO3O1O2 < 0) {
                // console.log("cos > 1",this.str(pairO2O3));
                this.drawMap.set(this.str(pairO2O3),false);
            }
            return;
        }
        // if(cosXOoY > 1){
        //    console.log([O1,O2,O3],cosXOoY);
        // }
        //const cosXOoY = (cosAXO3 * dO3X) / (dO3toOX * dAX) - dAX;

        const normal = Vector.diff(O1.pos,O3.pos).cross(Vector.diff(O1.pos,O2.pos)).normalize();
        const cross =  Vector.diff(O1.pos,O2.pos).cross(normal);
        const tmp = pointA.translate(cross.normalize().multiply(dAX * cosXOoY));


        // console.log(cosXOoY);
        const pointX = tmp.translate(normal.normalize().multiply(dAX * Math.sqrt(1 - cosXOoY**2)));
        const negPointX = tmp.translate(normal.normalize().multiply((-1)*(dAX * Math.sqrt(1 - cosXOoY**2))));


        // console.log(pointA);
        // console.log(pointX);
        this.toroidalMap.set(this.str(pairO1O2),this.push(this.toroidalMap.get(this.str(pairO1O2)),[Vector.diff(pointA,pointX),Vector.diff(pointA,negPointX)]));
        this.toroidalMap.set(this.str(pairO1O3),this.push(this.toroidalMap.get(this.str(pairO1O3)),[Vector.diff(pointC,pointX),Vector.diff(pointC,negPointX)]));
        this.toroidalMap.set(this.str(pairO2O3),this.push(this.toroidalMap.get(this.str(pairO2O3)),[Vector.diff(pointB,pointX),Vector.diff(pointB,negPointX)]));


        const translateVec = normal.normalize().multiply(0.01);
        const color = new THREE.Color(117,15,163);
        const testFunc = poly => true;
        const pointInter = this.checkInter({r:this.solventRad,pos:pointX},arr);
        const pointNegInter = this.checkInter({r:this.solventRad,pos:negPointX},arr);
        let mesh1 = undefined, mesh2 = undefined;
        //console.log(arr);
        if(!pointInter) {
            //console.log(1);
            const keyPointsX = this.getKeyPoints([O1,O3,O2],{pos:pointX,r:this.solventRad});
            mesh1 = this.generateSectorMesh(keyPointsX, {pos: pointX, r: this.solventRad},4,false,color,testFunc,-1);
            mesh1.geometry.vertices.forEach(v =>{
                v.x +=translateVec.x;
                v.y +=translateVec.y;
                v.z +=translateVec.z;
            });
            //mesh1.position.set(mesh1.position.x + translateVec.x , mesh1.position.y + translateVec.y, mesh1.position.z + translateVec.z);
            this.tmpMesh.push(mesh1);
            //this.sphereSectorMesh.add(mesh1);
        }
        if(!pointNegInter){
            //console.log(2);
            const keyPointsNegX = this.getKeyPoints([O1,O2,O3],{pos:negPointX,r:this.solventRad});
            mesh2 = this.generateSectorMesh(keyPointsNegX, {pos: negPointX, r: this.solventRad},4,false,color,testFunc,-1);
            //mesh2.position.set(mesh2.position.x - translateVec.x , mesh2.position.y - translateVec.y, mesh2.position.z - translateVec.z);
            mesh2.geometry.vertices.forEach(v =>{
                v.x -=translateVec.x;
                v.y -=translateVec.y;
                v.z -=translateVec.z;
            });
            this.tmpMesh.push(mesh2);
            //this.sphereSectorMesh.add(mesh2);
        }
        // if(!pointInter && !pointNegInter && (dAX * Math.sqrt(1 - cosXOoY**2) < this.solventRad)){
        //     console.log(3);
        //     this.sphereSectorMesh.remove(mesh1);
        //     this.sphereSectorMesh.remove(mesh2);
        //     const plane1 = new THREE.Plane();
        //     const plane2 = new THREE.Plane();
        //     plane1.setFromCoplanarPoints(O1.pos,O2.pos,O3.pos);
        //     plane2.setFromCoplanarPoints(O1.pos,O3.pos,O2.pos);
        //     const material1 = new THREE.MeshLambertMaterial({color:color,clippingPlanes:[plane1]});
        //     const material2 = new THREE.MeshLambertMaterial({color:color,clippingPlanes:[plane2]});
        //     mesh1.material = material1;
        //     mesh2.material = material2;
        //     this.sphereSectorMesh.add(new THREE.Mesh(mesh1.geometry,material1));
        //     this.sphereSectorMesh.add(new THREE.Mesh(mesh2.geometry,material2));
        // }
    }


    checkInter(solvent,arr){
        for(let i = 0 ; i < this.atoms.length ; i++){
            if(!arr.includes(i)){
                if(Molecule.testInter(this.atoms[i],solvent)){
                    return true;
                }
            }
        }
        return false;
    }


    combineAtoms(){
        const self = this;


        this.tmpMesh = [];
        this.sphereSectorMesh = new THREE.Mesh();
        this.sphereSectorMesh.castShadow = true;
        this.sphereSectorMesh.receiveShadow = true;
        this.toroidalMesh = new THREE.Mesh();
        this.toroidalMesh.receiveShadow = true;
        this.toroidalMesh.castShadow = true;

        let test = function (a1,a2) {
            return  Molecule.testAtoms(a1,a2,self.solventRad);
        };

        let a1,a2,a3;
        for (let i = 0 ; i < this.atoms.length - 2 ; i++){
            for( let n = i + 1 ; n < this.atoms.length - 1 ; n++){
                a1 = this.atoms[i];
                a2 = this.atoms[n];

                if (test(a1,a2)){
                    //this.toroidal([i,n]);
                    for( let m = n + 1 ; m < this.atoms.length ; m++){

                        a3 = this.atoms[m];
                        if(test(a3,a1) && test(a3,a2)){
                            this.sphereSector([i,n,m]);
                        }
                    }

                }
            }
        }

        // console.log(this.atoms);

        //переделать генерацию тороидальных поверхностей


        for (let i = 0 ; i < this.atoms.length - 1 ; i++) {
            for (let n = i + 1; n < this.atoms.length; n++) {
                a1 = this.atoms[i];
                a2 = this.atoms[n];

                if (test(a1,a2)) {
                    //console.log("teste");
                    this.toroidal([i,n]);
                }
            }
        }

        // for(let i = 0 ; i < this.atoms.length -1 ; i++){
        //     let n = this.atoms.length - 1;
        //     if(test(this.atoms[i],this.atoms[n])){
        //         this.toroidal([i,n]);
        //     }
        // }

        let vert = [];
        let faces = [];
        this.tmpMesh.forEach(mesh => {
            const v = mesh.geometry.vertices;
            const f = mesh.geometry.faces;
            f.forEach(face =>{
                face.a += vert.length;
                face.b += vert.length;
                face.c += vert.length;
                faces.push(face);
            });
            v.forEach(ver => vert.push(ver));
        });

        const geometry = new THREE.Geometry();
        geometry.faces = faces;
        geometry.vertices = vert;

        const material = new THREE.MeshLambertMaterial();
        material.vertexColors = THREE.FaceColors;
        material.side = THREE.FrontSide;
        //console.log(geometry);
        let mesh = new THREE.Mesh(geometry,material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.autoUpdate = false;

        //this.mesh.add(this.sphereSectorMesh);
        this.mesh.add(mesh);
        //this.mesh.add(this.toroidalMesh);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;


    }


    generateSphere(atom,depth){
        const self = this;
        const r = atom.r;
        const subR = Math.sqrt(8)*r/3;
        const pos = atom.pos;
        const sin = 1/2;
        const cos = Math.cos(Math.asin(sin));
        const rcos = subR * cos;
        const rsin = subR * sin;
        const keyPointsArrays = [];
        const v1 = pos.translate(new Vector(0,0,r));
        const v2 = pos.translate(new Vector(rcos,-rsin,-r/3));
        const v3 = pos.translate(new Vector(-rcos,-rsin,-r/3));
        const v4 = pos.translate(new Vector(0,subR,-r/3));
        keyPointsArrays.push([v1,v3,v2],[v1,v4,v3],[v1,v2,v4],[v4,v2,v3 ]);
        const testFunc = poly => true;
        const mesh = keyPointsArrays.map( keyPoints => {
            return this.generateSectorMesh(keyPoints,atom,depth,true,atom.color,testFunc,1);
        });

        let vert = [];
        let faces = [];
        mesh.forEach(m => {
            const v = m.geometry.vertices;
            const f = m.geometry.faces;
            f.forEach(face =>{
                face.a += vert.length;
                face.b += vert.length;
                face.c += vert.length;
                faces.push(face);
            });
            v.forEach(ver => vert.push(ver));
        });

        const geometry = new THREE.Geometry();
        geometry.vertices = vert;
        geometry.faces = faces;
        const material = new THREE.MeshLambertMaterial();
        material.vertexColors = THREE.FaceColors;
        material.side = THREE.FrontSide;

        const sphere = new THREE.Mesh(geometry,material);

        sphere.castShadow = true;
        sphere.receiveShadow = true;
        return sphere;
    }

    str(obj){
        return JSON.stringify(obj);
    }

    obj(string){
        return JSON.parse(string);
    }

    constructor(json){
        console.log("start constr");
        let start = performance.now();
        const self = this;
        const parsedJson = JSON.parse(json)['PC_Compounds'][0];
        const conformers = parsedJson['coords'][0]['conformers'][0];
        const xCoords = conformers['x'];
        const yCoords = conformers['y'];
        const zCoords = conformers['z'];
        const elements = parsedJson['atoms']['element'];
        const radius = elements.map((el) => Molecule.vanDerWaals[el]);
        console.log("end parsing");
        this.solventRad = 1.4;
        //test 2atoms
        // this.atoms = [{atomId:1,r:1.2,pos:new Vector(-1,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        //     {atomId:1,r:1.2,pos:new Vector(0,1,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        //     {atomId:1,r:1.2,pos:new Vector(1,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:0}];

        //
        // this.atoms = [{atomId:1,r:1.2,pos:new Vector(-2.3,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        //     {atomId:1,r:1.2,pos:new Vector(2.3,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:0}];


        //test drawMap
        // this.atoms = [
        //     {atomId:1,r:1.2,pos:new Vector(-2.3,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        //     {atomId:1,r:1.2,pos:new Vector(2.3,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:0},
        //     //{atomId:1,r:1.2,pos:new Vector(-2.3,0,1.2),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        //     {atomId:1,r:1.2,pos:new Vector(0,0.25,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:2}
        // ];

        //test2
        // this.atoms = [{atomId:1,r:1.2,pos:new Vector(2.3,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:0},
        //     {atomId:1,r:1.2,pos:new Vector(-2.3,0,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        // //     {atomId:1,r:1.2,pos:new Vector(2.3,0,1.2),color:new THREE.Color(255,255,255),sphereObj:undefined,index:0},
        // //     {atomId:1,r:1.2,pos:new Vector(-2.3,0,1.2),color:new THREE.Color(255,255,255),sphereObj:undefined,index:1},
        // //      //{atomId:1,r:1.2,pos:new Vector(0,0.25,0),color:new THREE.Color(255,255,255),sphereObj:undefined,index:2}
        //     ];

        this.atoms = [];
        xCoords.forEach((coord,index) => {
            let c = Molecule.colors[elements[index]];
            if(c === undefined){
                c = Molecule.colors.other;
            }
            // console.log(radius[index]);
            self.atoms.push({
                pos : new Vector(xCoords[index],yCoords[index],zCoords[index]) ,
                r : radius[index],
                index : index ,
                atomId : elements[index],
                sphereObj : undefined,
                color:c
            })
        });

        console.log("end atoms");
        this.toroidalMap = new Map();
        this.drawMap = new Map();
        this.mesh = new THREE.Mesh();
        this.solventMesh = new THREE.Mesh();
        this.vanDerWaalsMesh = new THREE.Mesh();

        // console.log(this.atoms.length);
        this.atoms.forEach((atom) => {
            const mesh = this.generateSphere(atom,4);
            self.mesh.add(mesh);
            self.mesh.receiveShadow = true;
            self.mesh.castShadow = true;
            self.mesh.autoUpdate = false;

            const mesh2 = this.generateSphere(atom,4);
            self.vanDerWaalsMesh.add(mesh2);
            self.vanDerWaalsMesh.receiveShadow = true;
            self.vanDerWaalsMesh.castShadow = true;
            self.vanDerWaalsMesh.autoUpdate = false;

            const new_atom = {
                pos : atom.pos,
                r : atom.r + this.solventRad,
                color : atom.color
            };
            const mesh3 = this.generateSphere(new_atom,4);
            self.solventMesh.add(mesh3);
            self.solventMesh.receiveShadow = true;
            self.solventMesh.castShadow = true;
            self.solventMesh.autoUpdate = false;

        });
        console.log("end spheres");
        this.combineAtoms();
        console.log("end combine");
        console.log(performance.now());
        console.log(start);
        console.log("generation time in miliseconds   "  + ((performance.now() - start)/1000).toString() )
    }
}