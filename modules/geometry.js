export class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
    
    static fromSite(site) {
        return new Point(site.x, site.y)
    }
    
    static ORIGIN = new Point(0, 0)
    
    equals(other) {
        return this.x === other.x && this.y === other.y
    }
    
    sub(other) {
        return new Point(this.x - other.x, this.y - other.y)
    }

    distance(other) {
        var disp = this.sub(other)
        return Math.sqrt(disp.x * disp.x + disp.y * disp.y)
    }
}

export class Vector {
    constructor(p0, u, v) {
        this.p0 = p0
        this.u = u
        this.v = v
    }
    
    static fromPoints(p0, p1) {
        return new Vector(p0, p1.x - p0.x, p1.y - p0.y)
    }
    
    get magnitude() {
        return Math.sqrt(this.u * this.u + this.v * this.v)
    }
    
    add(other) {
        return new Vector(this.p0, this.u + other.u, this.v + other.v)
    }
        
    get normalized() {
        var magnitude = this.magnitude
        if(magnitude === 0) return null
        return new Vector(Point.ORIGIN, this.u / magnitude, this.v / magnitude)
    }
    
    isParallel(other) {
        return (this.u / other.u) === (this.v / other.v)
    }
    
    intersection(other) {
        if(this.isParallel(other)) {
            return false
        } 
        
        var w = Vector.fromPoints(this.p0, other.p0)
        var D = other.perpProduct(this)
        
        var s = other.perpProduct(w) / D
        
        if(s < 0 || s > 1) {
            
            return false
        }
        
        return new Point(this.p0.x + this.u * s, this.p0.y + this.v * s)
    }
        
    get perp() {
        return new Vector(this.p0, -this.v, this.u)
    }
        
    perpProduct(other) {
        return this.perp.dot(other)
    }
        
    dot(other) {
        return this.u * other.v - this.v * other.u
    }
    
    div(scalar) {
        return new Vector(this.p0, this.u / scalar, this.v / scalar)
    }
}