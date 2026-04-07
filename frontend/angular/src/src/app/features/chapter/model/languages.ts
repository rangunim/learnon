export const POPULAR_LANGUAGES = [
    'Angielski',
    'Niemiecki',
    'Francuski',
    'Hiszpański',
    'Polski'
];

export const ALL_LANGUAGES = [
    ...POPULAR_LANGUAGES,
    'Arabski',
    'Chiński',
    'Chorwacki',
    'Czeski',
    'Duński',
    'Fiński',
    'Grecki',
    'Hebrajski',
    'Hindi',
    'Holenderski',
    'Indonezyjski',
    'Irlandzki',
    'Islandzki',
    'Japoński',
    'Koreański',
    'Litewski',
    'Łaciński',
    'Łotewski',
    'Norweski',
    'Portugalski',
    'Rosyjski',
    'Rumuński',
    'Słowacki',
    'Słoweński',
    'Szwedzki',
    'Tajski',
    'Turecki',
    'Ukraiński',
    'Węgierski',
    'Wietnamski',
    'Włoski'
].sort((a, b) => {
    // Keep first 5 in place, then sort the rest
    const aIdx = POPULAR_LANGUAGES.indexOf(a);
    const bIdx = POPULAR_LANGUAGES.indexOf(b);

    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;

    return a.localeCompare(b, 'pl');
});
