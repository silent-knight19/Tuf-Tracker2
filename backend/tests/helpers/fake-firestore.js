/**
 * S3 — in-memory Firestore stub for authorization tests.
 * Supports exactly the API surface the route layer uses; anything else
 * throws (fail-loud, so tests can't silently pass on unimplemented paths).
 */

class FakeDocSnapshot {
  constructor(id, data, ref) {
    this._id = id;
    this._data = data === undefined ? undefined : { ...data };
    this.ref = ref;
  }
  get id() { return this._id; }
  get exists() { return this._data !== undefined; }
  data() { return this._data === undefined ? undefined : { ...this._data }; }
}

class FakeQuerySnapshot {
  constructor(docs) {
    this.docs = docs;
  }
  get empty() { return this.docs.length === 0; }
  get size() { return this.docs.length; }
  forEach(fn) { this.docs.forEach(fn); }
}

class FakeDocRef {
  constructor(store, colName, id) {
    this._store = store;
    this._col = colName;
    this._id = id;
  }
  get id() { return this._id; }
  _map() { return this._store._cols.get(this._col); }
  async get() {
    const data = this._map().get(this._id);
    return new FakeDocSnapshot(this._id, data, this);
  }
  async set(data) {
    this._map().set(this._id, { ...data });
  }
  async update(data) {
    if (!this._map().has(this._id)) {
      throw new Error('NOT_FOUND: no document to update');
    }
    const current = this._map().get(this._id);
    const applied = { ...data };
    for (const [k, v] of Object.entries(data)) {
      // Admin-SDK parity: FieldValue.increment resolves atomically.
      if (v && typeof v === 'object' && typeof v.__increment === 'number') {
        applied[k] = (typeof current[k] === 'number' ? current[k] : 0) + v.__increment;
      }
    }
    this._map().set(this._id, { ...current, ...applied });
  }
  async delete() {
    this._map().delete(this._id);
  }
}

function matchesFilter(id, data, { field, op, value }) {
  if (field === '__name__' && op === 'in') return value.includes(id);
  const v = data[field];
  switch (op) {
    case '==': return v === value;
    case '>': return v > value;
    case '<': return v < value;
    case '>=': return v >= value;
    case '<=': return v <= value;
    case 'array-contains': return Array.isArray(v) && v.includes(value);
    default: throw new Error(`unsupported op ${op}`);
  }
}

class FakeQuery {
  constructor(store, colName, filters = [], limitN = null, order = null) {
    this._store = store;
    this._col = colName;
    this._filters = filters;
    this._limit = limitN;
    this._order = order;
  }
  orderBy(field, dir = 'asc') {
    return new FakeQuery(this._store, this._col, this._filters, this._limit, { field, dir });
  }
  where(field, op, value) {
    return new FakeQuery(this._store, this._col, [...this._filters, { field, op, value }], this._limit);
  }
  limit(n) {
    return new FakeQuery(this._store, this._col, this._filters, n, this._order);
  }
  async get() {
    const map = this._store._cols.get(this._col);
    let entries = [...map.entries()].filter(([id, data]) =>
      this._filters.every((f) => matchesFilter(id, data, f))
    );
    if (this._order) {
      const { field, dir } = this._order;
      entries.sort(([, a], [, b]) => {
        const av = a[field];
        const bv = b[field];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        const cmp = av < bv ? -1 : 1;
        return dir === 'desc' ? -cmp : cmp;
      });
    }
    if (this._limit !== null) entries = entries.slice(0, this._limit);
    return new FakeQuerySnapshot(
      entries.map(([id, data]) => new FakeDocSnapshot(id, data, new FakeDocRef(this._store, this._col, id)))
    );
  }
}

class FakeCollection {
  constructor(store, name) {
    this._store = store;
    this._name = name;
  }
  doc(id) {
    // Firestore auto-generates an id when none is given.
    if (!id) id = `auto-${this._store._seq++}`;
    return new FakeDocRef(this._store, this._name, id);
  }
  async add(data) {
    const id = `auto-${this._store._seq++}`;
    this._store._cols.get(this._name).set(id, { ...data });
    return new FakeDocRef(this._store, this._name, id);
  }
  where(field, op, value) {
    return new FakeQuery(this._store, this._name, [{ field, op, value }]);
  }
  orderBy(field, dir = 'asc') {
    return new FakeQuery(this._store, this._name, [], null, { field, dir });
  }
  async get() {
    return new FakeQuery(this._store, this._name).get();
  }
}

class FakeBatch {
  constructor() { this._ops = []; }
  delete(ref) { this._ops.push(() => ref.delete()); return this; }
  set(ref, data) { this._ops.push(() => ref.set(data)); return this; }
  update(ref, data) { this._ops.push(() => ref.update(data)); return this; }
  async commit() { for (const op of this._ops) await op(); }
}

class FakeFirestore {
  constructor() {
    this._cols = new Map();
    this._seq = 1;
  }
  collection(name) {
    if (!this._cols.has(name)) this._cols.set(name, new Map());
    return new FakeCollection(this, name);
  }
  batch() { return new FakeBatch(); }
  seed(col, id, data) {
    if (!this._cols.has(col)) this._cols.set(col, new Map());
    this._cols.get(col).set(id, { ...data });
  }
  read(col, id) {
    const data = (this._cols.get(col) || new Map()).get(id);
    return data === undefined ? undefined : { ...data };
  }
}

const fakeAdmin = {
  firestore: {
    FieldValue: {
      serverTimestamp: () => new Date(),
      increment: (n) => ({ __increment: n }),
    },
  },
};

module.exports = { FakeFirestore, fakeAdmin };
