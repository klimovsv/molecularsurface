'use strict';
class Vector{
    constructor(x,y,z){
        this.x = x;
        this.y = y;
        this.z = z;
        this.t = 1;
    }

    get vec3(){
        return new THREE.Vector3(this.x,this.y,this.z);
    }

    clone(){
        return new Vector(this.x,this.y,this.z);
    }

    normalize(){
        const length = this.computeLength();
        return new Vector(this.x/length,this.y/length,this.z/length);
    }

    computeLength(){
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2);
    }

    static getValue(row,column,mat1,mat2){
        return mat1[row][0] * mat2[0][column] + mat1[row][1] * mat2[1][column] + mat1[row][2] * mat2[2][column] + mat1[row][3] * mat2[3][column];
    }

    static matrMultiply(mat1,mat2){
        const val = function (row,col) {
            return Vector.getValue(row,col,mat1,mat2);
        };
        return [
            [val(0,0),val(0,1),val(0,2),val(0,3)],
            [val(1,0),val(1,1),val(1,2),val(1,3)],
            [val(2,0),val(2,1),val(2,2),val(2,3)],
            [val(3,0),val(3,1),val(3,2),val(3,3)]
        ]
    }

    multiply(factor){
        return new Vector(this.x * factor , this.y * factor , this.z * factor);
    }

    multiplyByMatr(matr){
        const x = this.x * matr[0][0] + this.y * matr[0][1] + this.z * matr[0][2] + this.t * matr[0][3];
        const y = this.x * matr[1][0] + this.y * matr[1][1] + this.z * matr[1][2] + this.t * matr[1][3];
        const z = this.x * matr[2][0] + this.y * matr[2][1] + this.z * matr[2][2] + this.t * matr[2][3];
        return new Vector(x,y,z);
    }

    cross(vec){
        const x = this.y * vec.z  - this.z * vec.y;
        const y = this.z * vec.x - this.x * vec.z;
        const z = this.x * vec.y - this.y * vec.x;
        return new Vector(x, y, z);
    }

    angCos(vec){
        return this.dot(vec)/(vec.computeLength() * this.computeLength())
    }

    dot(vec){
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    translate(vec){
        return new Vector(this.x + vec.x,this.y + vec.y ,this.z + vec.z);
    }

    static rotateMatr(vec , angle){
        const radAng = THREE.Math.degToRad(angle);
        const cos = Math.cos(radAng);
        const sin = Math.sin(radAng);
        const x = vec.x;
        const y = vec.y;
        const z = vec.z;
        return [
            [cos + (1 - cos) * x**2 , (1 - cos) * x * y - sin * z , (1 - cos) * x * z + sin * y,0],
            [(1 - cos) * x * y + sin * z , cos + (1 - cos) * y**2 , (1 - cos) * y * z - sin * x,0],
            [(1 - cos) * x * z - sin * y , (1 - cos) * z * y + sin * x , cos + (1 - cos) * z**2,0],
            [0,0,0,1]
        ]
    }

    static diff(vec2,vec1){
        return new Vector(vec1.x-vec2.x,vec1.y-vec2.y,vec1.z-vec2.z);
    }

    static distance(vec1, vec2){
        return Vector.diff(vec1,vec2).computeLength();
    }
}