// Mirrors the frontend's src/data/geography.js. Duplicated (not imported across
// the client/server boundary) so the backend stays a self-contained deployable.

export const PANCHAYAT = { id: "challapalli", name: "Challapalli Gram Panchayat" };
export const CONSTITUENCY = PANCHAYAT;

export const WARDS = Array.from({ length: 18 }, (_, i) => {
  const n = i + 1;
  return { id: `ward-${n}`, number: n, name: `Ward ${n}` };
});

export const getWardById = (id) => WARDS.find((w) => w.id === id);
export const WARD_IDS = WARDS.map((w) => w.id);
