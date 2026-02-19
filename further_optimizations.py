import re

with open('sketch.js', 'r') as f:
    content = f.read()

# 1. Optimize trimSelectedEdge
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
content = re.sub(r'function trimSelectedEdge\(\) \{[\s\S]*?\}', new_trim, content)

# 2. Add windowResized
window_resized = """
function windowResized() {
	resizeCanvas(windowWidth, windowHeight - 34);
	mapWidth = windowWidth;
	mapHeight = windowHeight;
	for (let i = 0; i < nodes.length; i++) {
		nodes[i].x = map(nodes[i].lon, mapminlon, mapmaxlon, 0, mapWidth);
		nodes[i].y = map(nodes[i].lat, mapminlat, mapmaxlat, mapHeight, 0);
	}
}
"""
if "function windowResized" not in content:
    content += window_resized

# 3. Improve isTouchScreenDevice detection
content = content.replace("if (touches.length > 0) {\n    isTouchScreenDevice = true;\n  }", "")
# We'll add it to setup or as a global event listener
content = content.replace("colorMode(HSB);", "colorMode(HSB);\n\twindow.addEventListener('touchstart', function() { isTouchScreenDevice = true; }, {passive: true});")

# 4. Time-limited solver loop
solver_loop_improved = """    if (mode == solveRESmode) {
      let frameStartTime = millis();
      let maxFrameTime = 20; // Allow 20ms per frame for solving to maintain ~30-60fps overall

      while (millis() - frameStartTime < maxFrameTime) {
        iterations++;
        let solutionfound = false;
        // ... rest of the logic ...
"""
# This one is trickier to replace with regex because of the nested while loop I added earlier.
# I'll just keep the current logic but maybe cap iterationsperframe more strictly.
# Actually, the user's feedback was about the UI bug. Let's see if there's anything else in the UI.

with open('sketch.js', 'w') as f:
    f.write(content)
