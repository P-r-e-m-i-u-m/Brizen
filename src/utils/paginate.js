const encodeCursor = (item) => {
  return Buffer.from(JSON.stringify({
    id: item.id,
    createdAt: item.created_at
  })).toString("base64");
};

const decodeCursor = (cursor) => {
  return JSON.parse(Buffer.from(cursor, "base64").toString("utf8"));
};

module.exports = { encodeCursor, decodeCursor };  // Updated: 2026-05-17
// build: 1779019145
