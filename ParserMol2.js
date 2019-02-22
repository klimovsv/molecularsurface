let xCoords =[],yCoords =[],zCoords=[],elements=[];
let conformers = {};
let parsedJson = {};
let source = {};

function readFile(data) {
    xCoords =[],yCoords =[],zCoords=[],elements=[];
    conformers = {};
    parsedJson = {};
    source = {};

    const r = new FileReader();
    r.onload = ({target}) => {
        const file = target.result;
        parseMol(file);
        parsedJson['atoms'] = {};
        parsedJson['atoms']['element'] = elements;
        conformers['z'] = zCoords;
        conformers['x'] = xCoords;
        conformers['y'] = yCoords;
        parsedJson['coords'] = [{}];
        parsedJson['coords'][0]['conformers'] = [];
        parsedJson['coords'][0]['conformers'][0] = conformers;
        source['PC_Compounds'] = [];
        source['PC_Compounds'][0] = parsedJson;
        scene.createMolecule(JSON.stringify(source))
    };
    r.readAsText(data);
}



function parseMol(file) {

    const lines = file.split('\n').map(s => s.replace(/\s+/g,' '))
        .map(s => s.replace(/^\s*|\s*$/g, ""))
        .filter(x => x && !(x.startsWith('#')));


    // console.log(lines);

    let currLineNum = 0;
    while (currLineNum < lines.length-1){
        const currLine = lines[currLineNum];
        if (currLine == "@<TRIPOS>MOLECULE") {

            ++currLineNum;
            currLineNum = parseMolecule(undefined, lines, currLineNum);
        }  else if (currLine == "@<TRIPOS>ATOM"){
            // console.log("here");

            ++currLineNum;
            currLineNum = parseAtom(undefined, lines, currLineNum);
        } else if (currLine == "@<TRIPOS>BOND"){
            // console.log("here2");

            ++currLineNum;
            currLineNum = parseBond(undefined, lines, currLineNum);
        } else if (currLine[0] == "@"){
            ++currLineNum;
            currLineNum = skipLines(lines, currLineNum);
        } else {
            alert("Ошибка в файле");
            break;
        }
    }

    // console.log(molecule);
    // drawMolecules();
}

function skipLines(lines, currLineNum){
    // console.log(lines);
    // console.log(currLineNum);
    let currLine = lines[currLineNum];
    while (currLineNum < lines.length && currLine[0] != '@'){
        ++currLineNum;
        currLine = lines[currLineNum];
    }
    return currLineNum;
}

function parseMolecule(molecule, lines, currLineNum){
    // molecule.setName(lines[currLineNum]);
    // molecule.setType(lines[currLineNum+2]);
    currLineNum += 4;
    let currLine = lines[currLineNum];
    while (currLineNum < lines.length && currLine[0] != '@'){
        ++currLineNum;
        currLine = lines[currLineNum];
    }
    return currLineNum;
}

function parseAtom(molecule, lines, currLineNum ){
    let currLine = lines[currLineNum];
    while (currLineNum < lines.length && currLine[0] != '@'){
        const lineSplitted = currLine.split(' ');
        let id, x, y, z, element;
        id = lineSplitted[0];

        x = parseFloat(lineSplitted[2]);
        y = parseFloat(lineSplitted[3]);
        z = parseFloat(lineSplitted[4]);

        xCoords.push(x);
        yCoords.push(y);
        zCoords.push(z);
        element = elMap[lineSplitted[5].split(".")[0]];
        elements.push(element);


        ++currLineNum;
        currLine = lines[currLineNum];
    }
    return currLineNum;
}

function parseBond(molecule, lines, currLineNum ){
    let currLine = lines[currLineNum];
    while ( currLineNum < lines.length && currLine[0] != '@'){
        const lineSplitted = currLine.split(' ');
        let bondFrom, bondTo, typeOfBond;
        // bondFrom = molecule.getAtomNumById(lineSplitted[1]);
        // bondTo = molecule.getAtomNumById(lineSplitted[2]);
        // typeOfBond = lineSplitted[3];
        // const bond = new Bond(bondFrom, bondTo, typeOfBond);
        // molecule.addBond(bond);
        ++currLineNum;
        currLine = lines[currLineNum];
    }

    return currLineNum;
}