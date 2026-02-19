class PriorityQueue {
    constructor(comparator = (a, b) => a < b) {
        this._heap = [];
        this._comparator = comparator;
    }
    size() { return this._heap.length; }
    isEmpty() { return this.size() == 0; }
    peek() { return this._heap[0]; }
    push(...values) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > 0) {
            this._swap(0, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    _swap(i, j) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > 0 && this._comparator(this._heap[node], this._heap[Math.floor((node - 1) / 2)])) {
            this._swap(node, Math.floor((node - 1) / 2));
            node = Math.floor((node - 1) / 2);
        }
    }
    _siftDown() {
        let node = 0;
        while (
            (node * 2 + 1 < this.size() && this._comparator(this._heap[node * 2 + 1], this._heap[node])) ||
            (node * 2 + 2 < this.size() && this._comparator(this._heap[node * 2 + 2], this._heap[node]))
        ) {
            let nextChild = (node * 2 + 2 < this.size() && this._comparator(this._heap[node * 2 + 2], this._heap[node * 2 + 1])) ? node * 2 + 2 : node * 2 + 1;
            this._swap(node, nextChild);
            node = nextChild;
        }
    }
}

function findShortestPath(startNode, endNodeCondition) {
    let target = null;
    if (typeof endNodeCondition !== 'function') {
        target = endNodeCondition;
        endNodeCondition = (n) => n === target;
    }

    let distances = new Map();
    let previous = new Map();
    let pq = new PriorityQueue((a, b) => distances.get(a) < distances.get(b));

    distances.set(startNode, 0);
    pq.push(startNode);

    let foundNode = null;

    while (!pq.isEmpty()) {
        let u = pq.pop();

        if (endNodeCondition(u)) {
            foundNode = u;
            break;
        }

        if (u.edges) {
            for (let edge of u.edges) {
                let v = edge.OtherNodeofEdge(u);
                let alt = distances.get(u) + edge.distance;
                if (!distances.has(v) || alt < distances.get(v)) {
                    distances.set(v, alt);
                    previous.set(v, u);
                    pq.push(v);
                }
            }
        }
    }

    if (!foundNode) return null;

    let path = [];
    let curr = foundNode;
    while (curr) {
        path.push(curr);
        curr = previous.get(curr);
    }
    return path.reverse();
}

function findEdgeBetween(from, to) {
    let bestEdge = null;
    for (let edge of from.edges) {
        if (edge.OtherNodeofEdge(from) === to) {
            if (!bestEdge || edge.distance < bestEdge.distance) {
                bestEdge = edge;
            }
        }
    }
    return bestEdge;
}
