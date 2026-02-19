import re

with open('sketch.js', 'r') as f:
    content = f.read()

# Fix the double-closed or messy trimSelectedEdge
new_trim = """function trimSelectedEdge() {
	if (closestedgetomouse >= 0) {
		let edgetodelete = edges[closestedgetomouse];
		edges.splice(edges.findIndex((element) => element == edgetodelete), 1);

		// Remove references to the deleted edge from its connected nodes
		let nodesToUpdate = [edgetodelete.from, edgetodelete.to];
		for (let node of nodesToUpdate) {
			let edgeIndex = node.edges.indexOf(edgetodelete);
			if (edgeIndex !== -1) {
				node.edges.splice(edgeIndex, 1);
			}
		}

		removeOrphans(); // deletes parts of the network that no longer can be reached.
		closestedgetomouse = -1;
	}
}"""

content = re.sub(r'function trimSelectedEdge\(\) \{[\s\S]*?\}\s*\}\s*removeOrphans\(\);[\s\S]*?\}', new_trim, content)
# If that didn't work, I'll be more direct.
if "function drawProgressGraph" not in content: # safety check
     pass

with open('sketch.js', 'w') as f:
    f.write(content)
