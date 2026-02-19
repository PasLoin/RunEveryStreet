function calculateTheoreticalMin() {
	let oddNodes = nodes.filter(n => n.edges.length % 2 !== 0);
	if (oddNodes.length === 0) {
		theoreticalMinDistance = totaledgedistance;
		return;
	}

	let addedDistance = 0;
	let unmatchedSet = new Set(oddNodes);

	while (unmatchedSet.size > 1) {
		let u = unmatchedSet.values().next().value;
		unmatchedSet.delete(u);

		let path = findShortestPath(u, (n) => n !== u && unmatchedSet.has(n));

		if (path) {
			let d = 0;
			for (let i = 0; i < path.length - 1; i++) {
				d += findEdgeBetween(path[i], path[i+1]).distance;
			}
			addedDistance += d;
			let v = path[path.length - 1];
			unmatchedSet.delete(v);
		}
	}

	theoreticalMinDistance = totaledgedistance + addedDistance;
}
