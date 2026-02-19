function getOverpassData() { //load nodes and edge map data in XML format from OpenStreetMap via the Overpass API
	showMessage("Loading map data...");
	canvas.position(0, 34); // start canvas just below logo image
	bestroute = null;
	totaluniqueroads=0;
	var extent = ol.proj.transformExtent(openlayersmap.getView().calculateExtent(openlayersmap.getSize()), 'EPSG:3857', 'EPSG:4326'); //get the coordinates current view on the map
	mapminlat = extent[1];
	mapminlon = extent[0];
	mapmaxlat = extent[3];
	mapmaxlon = extent[2]; //51.62354589659512,0.3054885475158691,51.635853268644496,0.33291145248413084
	dataminlat = extent[1] + (extent[3] - extent[1]) * margin; //51.62662273960746,0.31234427375793455,51.63277642563215,0.3260557262420654
	dataminlon = extent[0] + (extent[2] - extent[0]) * margin;
	datamaxlat = extent[3] - (extent[3] - extent[1]) * margin;
	datamaxlon = extent[2] - (extent[2] - extent[0]) * margin;

	let OverpassURL = "https://overpass-api.de/api/interpreter?data=";
	let bbox = dataminlat + "," + dataminlon + "," + datamaxlat + "," + datamaxlon;
	let baseFilters = "['highway' !~ 'primary']['highway' !~ 'steps']['highway' !~ 'motorway']['highway' !~ 'motorway_link']['highway' !~ 'raceway']['highway' !~ 'bridleway']['highway' !~ 'proposed']['highway' !~ 'construction']['highway' !~ 'elevator']['highway' !~ 'bus_guideway']['highway' !~ 'trunk']['highway' !~ 'platform']['foot' !~ 'no']['service' !~ 'drive-through']['service' !~ 'parking_aisle']['access' !~ 'private']['access' !~ 'no']";

	let queryParts = [];
	queryParts.push("way(" + bbox + ")['highway']" + baseFilters + "['highway' !~ 'footway']['highway' !~ 'pedestrian']['highway' !~ 'path']['highway' !~ 'cycleway']");

	if (includeFootway) queryParts.push("way(" + bbox + ")['highway'='footway']" + baseFilters);
	if (includePath) queryParts.push("way(" + bbox + ")['highway'='path']" + baseFilters);
	if (includeCycleway) queryParts.push("way(" + bbox + ")['highway'='cycleway']" + baseFilters);
	if (includePedestrian) {
		if (pedestrianOnlyBicycle) {
			queryParts.push("way(" + bbox + ")['highway'='pedestrian']['bicycle'='yes']" + baseFilters);
		} else {
			queryParts.push("way(" + bbox + ")['highway'='pedestrian']" + baseFilters);
		}
	}

	let overpassquery = "(" + queryParts.join(";") + ";node(w)(" + bbox + "););out;";
	OverpassURL = OverpassURL + encodeURI(overpassquery);

	httpGet(OverpassURL, 'text', false, function (response) {
		let OverpassResponse = response;
		var parser = new DOMParser();
		OSMxml = parser.parseFromString(OverpassResponse, "text/xml");
		var XMLnodes = OSMxml.getElementsByTagName("node")
		var XMLways = OSMxml.getElementsByTagName("way")
		numnodes = XMLnodes.length;
		numways = XMLways.length;
		for (let i = 0; i < numnodes; i++) {
			var lat = XMLnodes[i].getAttribute('lat');
			var lon = XMLnodes[i].getAttribute('lon');
			minlat = min(minlat, lat);
			maxlat = max(maxlat, lat);
			minlon = min(minlon, lon);
			maxlon = max(maxlon, lon);
		}
		nodes = []; nodesMap = new Map();
		edges = [];
		for (let i = 0; i < numnodes; i++) {
			var lat = XMLnodes[i].getAttribute('lat');
			var lon = XMLnodes[i].getAttribute('lon');
			var nodeid = XMLnodes[i].getAttribute('id');
			let node = new Node(nodeid, lat, lon);
			nodes.push(node);
			nodesMap.set(nodeid, node);
		}
		//parse ways into edges
		for (let i = 0; i < numways; i++) {
			let wayid = XMLways[i].getAttribute('id');
			let nodesinsideway = XMLways[i].getElementsByTagName('nd');
			for (let j = 0; j < nodesinsideway.length - 1; j++) {
				fromnode = getNodebyId(nodesinsideway[j].getAttribute("ref"));
				tonode = getNodebyId(nodesinsideway[j + 1].getAttribute("ref"));
				if (fromnode != null & tonode != null) {
					let newEdge = new Edge(fromnode, tonode, wayid);
					edges.push(newEdge);
					totaledgedistance += newEdge.distance;
				}
			}
		}
		mode = selectnodemode;
		showMessage("Click on start of route");
	});
}
