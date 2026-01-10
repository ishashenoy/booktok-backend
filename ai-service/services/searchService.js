// Placeholder search service to satisfy imports. Implement real search as needed.

export async function naturalLanguageSearch(query) {
  return {
    query,
    results: [],
    note: 'Search service placeholder — no results.',
  };
}

export async function aggregateExternalReviews(book) {
  return {
    book: book?.title || '',
    reviews: [],
    note: 'External reviews placeholder — not implemented.',
  };
}

export default {
  naturalLanguageSearch,
  aggregateExternalReviews,
};
