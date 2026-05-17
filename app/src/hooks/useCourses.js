import { useState, useEffect, useMemo } from 'react';

const PAGE_SIZE = 24;

export function useCourses() {
  const [allCourses, setAllCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQueryState] = useState('');
  const [platform, setPlatformState] = useState('');
  const [page, setPageState] = useState(1);

  useEffect(() => {
    fetch('/courses.json')
      .then(r => r.json())
      .then(data => {
        setAllCourses(Array.isArray(data) ? data : (data.courses ?? []));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const allFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCourses.filter(c => {
      if (platform && c.platform !== platform) return false;
      if (!q) return true;
      return (
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.section && c.section.toLowerCase().includes(q)) ||
        (c.platform && c.platform.toLowerCase().includes(q)) ||
        (c.description && c.description.replace(/<[^>]*>/g, '').slice(0, 300).toLowerCase().includes(q))
      );
    });
  }, [allCourses, query, platform]);

  const totalPages = Math.max(1, Math.ceil(allFiltered.length / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const courses = allFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function setQuery(q) { setQueryState(q); setPageState(1); }
  function setPlatform(p) { setPlatformState(p); setPageState(1); }
  function setPage(p) { setPageState(Math.max(1, Math.min(p, totalPages))); }

  return { courses, allFiltered, totalPages, page: safePage, loading, query, platform, setQuery, setPlatform, setPage };
}
