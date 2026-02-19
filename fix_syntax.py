import re

with open('sketch.js', 'r') as f:
    content = f.read()

# Replace from function removeOrphans until function floodfill
content = re.sub(
    r'function removeOrphans\(\) \{[\s\S]*?function floodfill',
    r'''function removeOrphans() { // remove unreachable nodes and edges
	resetEdges();
	currentnode = startnode;
	floodfill(currentnode);
	let newedges = [];
	let newnodesSet = new Set();
	totaledgedistance = 0;
	for (let i = 0; i < edges.length; i++) {
		if (edges[i].travels > 0) {
			newedges.push(edges[i]);
			totaledgedistance += edges[i].distance;
			newnodesSet.add(edges[i].from);
			newnodesSet.add(edges[i].to);
		}
	}
	edges = newedges;
	nodes = Array.from(newnodesSet);
	nodesMap = new Map();
	for (let node of nodes) nodesMap.set(node.nodeId, node);
	resetEdges();
}

function floodfill''',
    content
)

with open('sketch.js', 'w') as f:
    f.write(content)
