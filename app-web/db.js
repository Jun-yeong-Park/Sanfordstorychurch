// IndexedDB — 설교 노트(텍스트), 첨부(주보 사진·손글씨 PNG), 로컬 나눔 글
window.DB = (() => {
  let dbp;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open("story-app", 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        d.createObjectStore("notes", { keyPath: "issue" });
        d.createObjectStore("attachments", { keyPath: "id" }).createIndex("issue", "issue");
        d.createObjectStore("posts", { keyPath: "id" });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  async function tx(store, mode, fn) {
    const d = await open();
    return new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const req = fn(t.objectStore(store));
      let out;
      if (req) req.onsuccess = () => { out = req.result; };
      t.oncomplete = () => res(out);
      t.onerror = () => rej(t.error);
    });
  }
  return {
    get: (s, k) => tx(s, "readonly", st => st.get(k)),
    all: s => tx(s, "readonly", st => st.getAll()),
    byIssue: issue => tx("attachments", "readonly", st => st.index("issue").getAll(issue)),
    put: (s, v) => tx(s, "readwrite", st => st.put(v)),
    del: (s, k) => tx(s, "readwrite", st => st.delete(k)),
  };
})();
