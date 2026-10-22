// Geographic hierarchy: Panchayat -> Ward.
// Challapalli Gram Panchayat has 18 wards. Official ward names were not
// verifiable from public sources at the time of writing, so neutral
// numeric labels (Ward 1 … Ward 18) are used. Replace `name` on any
// ward entry below when verified names are available — ids are stable
// and should not change.

export const PANCHAYAT = {
  id: "challapalli",
  name: "Challapalli Gram Panchayat",
};

// Kept as CONSTITUENCY alias too, so legacy imports keep working while
// the codebase is being migrated.
export const CONSTITUENCY = PANCHAYAT;

export const WARDS = Array.from({ length: 18 }, (_, i) => {
  const n = i + 1;
  return {
    id: `ward-${n}`,
    number: n,
    name: `Ward ${n}`,
  };
});

export const getWardById = (id) => WARDS.find((w) => w.id === id);

export const getWardByNumber = (n) =>
  WARDS.find((w) => w.number === Number(n));

export const WARD_IDS = WARDS.map((w) => w.id);
