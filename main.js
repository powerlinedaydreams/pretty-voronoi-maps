import { Point, Vector } from "./modules/geometry.js"
import { Voronoi } from "./modules/voronoi_min.js"
import { openSimplexNoise } from "./modules/simplexNoise.js"

var draw
var index = 2
var parentArray


function prepare() {
    draw = SVG().addTo('#svg').size(1280, 720)
    
    var array = [100]
    
    for(var x = 0; x < 10; x++) {
        for(var y = 0; y < 10; y++) {
        var pt = {x: x * 128 + 59, y: y * 72 + 31}
        draw.circle(10).move(pt.x, pt.y)
        array[x * 10 + y] = pt
        }
    }
        
    return array
}

function prepare_() {
    draw = SVG().addTo('#svg').size(1280, 720)
    
    var array = [100]
    
    for(var i = 0; i < 100; i++) {
        var pt = { x: Math.random() * 1280, y: Math.random() * 720, cells: [] }
        array[i] = pt
    }
    
    return array
}

function calculateVor(pointArray) {
    var voronoi = new Voronoi()
    var bbox = {xl: 0, xr: 1280, yt: 0, yb: 720}
    var diagram = voronoi.compute(pointArray, bbox)
    
    console.log(diagram)
    return diagram
}

function drawVor(voronoi) {
    var cells = voronoi.cells
    var group = draw.group()
    
    for(var i = 0; i < cells.length; i++) {
        var poly = drawCell(group, cells[i])
        poly.fill({ color: "#014", opacity: 1 }).stroke({ color:"#fff", opacity: 1, width: 1 })
    }
    
    return group
}

function drawCell(group, cell) {
    var def = ""
    var site = Point.fromSite(cell.site)
    var edges = cell.halfedges
    for(var i = 0; i < edges.length; i++) {
        var edge = edges[i].edge
        if(site.equals(edge.lSite)) {
            def = def.concat(edge.vb.x + "," + edge.vb.y + " ")
        } else if(site.equals(edge.rSite)) {
            def = def.concat(edge.va.x + "," + edge.va.y + " ") 
        } else {
            console.log(cell)
            console.log(edge)
            throw "Neither site on a Cell's edge matches the Cell's site"
        }
    }
    
    return group.polygon(def).fill({ color: "#f06", opacity: 0 }).stroke({ color: "#fff", opacity: 0, width: 2})
}

function randPointsInCell(cell, poly, numPoints) {
    var result = []
    
    var cellVectors = []
    var lx = poly.bbox().x
    var ty = poly.bbox().y
    var width = poly.bbox().width
    var height = poly.bbox().height
    
    var site = Point.fromSite(cell.site)
    
    //transform cell edges to vectors
    for(let i = 0; i < cell.halfedges.length; i++) {
        var edge = cell.halfedges[i].edge
        var p0, p1
        
        if(site.equals(edge.lSite)) {
            p0 = new Point(edge.va.x, edge.va.y)
            p1 = new Point(edge.vb.x, edge.vb.y)
        } else if(site.equals(edge.rSite)) {
            p0 = new Point(edge.vb.x, edge.vb.y)
            p1 = new Point(edge.va.x, edge.va.y)
        } else {
            console.log(cell)
            console.log(edge)
            throw "Neither site on a Cell's edge matches the Cell's site"
        }
        
        cellVectors.push(Vector.fromPoints(p0, p1))
    }
    
    while(numPoints > 0) {
        var rand = new Point(Math.random() * width + lx, Math.random() * height + ty)
        var testVector = Vector.fromPoints(new Point(lx - 1.0, rand.y), rand)
        
        var intersections = 0
        
        for(let i = 0; i < cellVectors.length; i++) {
            if(testVector.intersection(cellVectors[i])) {
                intersections++
            }
        }
        
        if(intersections % 2 == 1) {
            result.push(rand)
            numPoints--
        }    
    }
    
    cell.points = result
    
    return result
}

function newPoints(voronoi) {
    var result = []
    var cells = voronoi.cells
    var symbol = draw.symbol()
    
    for(let i = 0; i < cells.length; i++) {
        var cell = cells[i]
        var poly = drawCell(symbol, cell)
        result = result.concat(randPointsInCell(cell, poly, 10))
    }
    
    for(let i = 0; i < cells.length; i++) {
        var cell = cells[i]
        
        for (let j = 0; j < parentArray.length; j++) {
            var parent = parentArray[j]
            
            if(parent.points) {
                for (let k = 0; k < parent.points.length; k++) {
                    if (parent.points[k].equals(cell.site)) {
                        parent.points.splice(k, 1)
                        parent.points = parent.points.concat(cell.points)
                    }
                }
            } else {
                let pt = Point.fromSite(cell.site)
                if(pt.equals(parent.site)) {
                    parent.points = cell.points
                }
            }
        }
    }
    
    symbol.remove()
    
    return result
}

function blobbify(data) {
    var cells = data.cells
    var sym = draw.symbol()
    
    for(let i = 0; i < parentArray[0].points.length; i++) {
        let point = parentArray[0].points[i]
        draw.circle(4).fill("#f06").move(point.x - 2, point.y - 2)
    }
    
    var w = new Worker("workers/polygonWorker.js")
    w.addEventListener("message", function(e) {
        var g = draw.group()
        for(let i = 0; i < e.data.length; i++) {
            g.polygon(e.data[i]).fill("#f06").stroke({ color:"#fff", opacity: 1, width: 2})
        }
    })
    
    w.postMessage({ parents: parentArray, cells: cells })
}

var pts = prepare_()
console.log(parentArray)

var worker = new Worker("workers/voronoiWorker.js")
worker.addEventListener("message", function(e) {
    if(parentArray == undefined) {
        parentArray = e.data.cells
        console.log(parentArray)
    }
    
    index--
    
    if(index > 0) {
        var pts = newPoints(e.data)
        worker.postMessage(pts)
        drawVor(e.data)
    } else {
        drawVor(e.data)
        blobbify(e.data)
    }
})
    
worker.postMessage(pts)
