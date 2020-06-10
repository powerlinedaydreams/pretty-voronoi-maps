importScripts('dependencies/voronoi.js')

onmessage = function(event) {
    var voronoi = new Voronoi()
    var bbox = {xl: 0, xr: 1400, yt: 0, yb: 900}
    var diagram = voronoi.compute(event.data, bbox)
    
    postMessage(diagram)
}