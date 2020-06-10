onmessage = function(e) {
    let result = []
    let cells = e.data.cells
    
    for(let i = 0; i < e.data.parents.length; i++) {
        let parent = e.data.parents[i]
        {
            let a = []
            result.push(a)
        }
        
        while(parent.points.length > 0) {
            var cell = cells.shift()
            
            for(let j = 0; j < parent.points.length; j++) {
                let point = parent.points[j]
                
                if(pointsEqual(point, cell.site)) {
                    result[i].push(cell)
                    parent.points.splice(j, 1)
                    cell = false
                    break
                }
            }
            
            if(cell) {
                cells.push(cell)
            }
        }
        
        result[i] = blobbify(result[i])
    }
    
    console.log(result)
}

function pointsEqual(point1, point2) {
    if(point1 === null || point2 === null) { return false }
    return point1.x === point2.x && point1.y === point2.y
}

function blobbify(cells) {
    let start = cells.shift()
    
    while(cells.length > 0) {
        let candidate = cells.shift()
        let shared = areBorderingCells(start, candidate)
        
        if(shared) {
            
            for(var i = 0, i < shared.length - 1, i++) {
                
            }
            
            console.log(start.halfedges[shared[0]].edge)
            console.log(candidate.halfedges[shared[1]].edge)
            console.log("______________")
            cells = { length: 0}
        }
    }
}

function areBorderingCells(cell1, cell2) {
    var result = []
    
    for(let i = 0; i < cell1.halfedges.length; i++) {
        let edge1 = cell1.halfedges[i].edge
        
        for(let j = 0; j < cell2.halfedges.length; j++) {
            let edge2 = cell2.halfedges[j].edge
            
            if( (pointsEqual(edge1.va, edge2.va) && pointsEqual(edge1.vb, edge2.vb))
                || (pointsEqual(edge1.va, edge2.vb) && pointsEqual(edge1.vb, edge2.va))) {
                result.push([i, j])
            }
        }
    }
    
    if(result.length === 0) { return false }
    console.log(result)
    return result
}