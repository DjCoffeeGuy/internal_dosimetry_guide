/**
 * Internal Dosimetry Glossary Definitions
 * Scientifically accurate definitions following ICRP publications and professional health physics standards
 * Last Updated: August 5, 2025
 */

const GLOSSARY_DEFINITIONS = {
    // Core Dosimetry Concepts
    'internal-dosimetry': {
        term: 'Internal Dosimetry',
        definition: 'The assessment of radiation dose to organs and tissues from radioactive material that has been taken into the body through inhalation, ingestion, or absorption through wounds or intact skin. Unlike external dosimetry, internal dose is inferred rather than directly measured.',
        category: 'fundamental',
        relatedTerms: ['radiobioassay', 'biokinetic-models', 'committed-effective-dose'],
        references: 'ICRP Publication 78 (1997)'
    },

    'radionuclides': {
        term: 'Radionuclides',
        definition: 'Unstable atomic nuclei that spontaneously emit ionizing radiation (alpha particles, beta particles, gamma rays, or combinations thereof) in the process of transforming to more stable configurations. Each radionuclide has characteristic physical and biological properties that affect its behavior in the body.',
        category: 'fundamental',
        relatedTerms: ['absorbed-dose', 'biokinetic-models'],
        references: 'ICRP Publication 107 (2008)'
    },

    'intake': {
        term: 'Intake',
        definition: 'The activity of a radionuclide that enters the body through inhalation, ingestion, or absorption through wounds or intact skin during a specified time period. Intake is typically expressed in becquerels (Bq) and represents the starting point for internal dose calculations.',
        category: 'fundamental',
        relatedTerms: ['radiobioassay', 'biokinetic-models', 'committed-effective-dose'],
        references: 'ICRP Publication 78 (1997)'
    },

    // Dose Quantities
    'absorbed-dose': {
        term: 'Absorbed Dose',
        definition: 'The fundamental dosimetric quantity representing the mean energy imparted by ionizing radiation per unit mass of matter. Measured in gray (Gy), where 1 Gy = 1 J/kg. Absorbed dose does not account for the biological effectiveness of different radiation types.',
        category: 'dose-quantities',
        relatedTerms: ['equivalent-dose', 'effective-dose'],
        references: 'ICRP Publication 103 (2007)'
    },

    'equivalent-dose': {
        term: 'Equivalent Dose',
        definition: 'The absorbed dose in an organ or tissue weighted by the radiation weighting factor (wR) to account for the relative biological effectiveness of different radiation types. Measured in sievert (Sv). HT = wR × DT, where DT is the absorbed dose and wR accounts for radiation quality.',
        category: 'dose-quantities',
        relatedTerms: ['absorbed-dose', 'effective-dose', 'committed-effective-dose'],
        references: 'ICRP Publication 103 (2007)'
    },

    'effective-dose': {
        term: 'Effective Dose',
        definition: 'The sum of weighted equivalent doses in all organs and tissues of the body, where the weighting factor (wT) represents the relative sensitivity of each tissue to radiation-induced stochastic effects. E = ΣwT × HT. Used for radiation protection purposes to compare different exposure scenarios.',
        category: 'dose-quantities',
        relatedTerms: ['equivalent-dose', 'committed-effective-dose'],
        references: 'ICRP Publication 103 (2007)'
    },

    'committed-effective-dose': {
        term: 'Committed Effective Dose',
        definition: 'The effective dose calculated from an intake of radioactive material, integrated over a specified time period (50 years for adults, 70 years for children). Represents the total dose that will be delivered over the commitment period, accounting for biological and physical decay processes.',
        category: 'dose-quantities',
        relatedTerms: ['effective-dose', 'dose-coefficients', 'biokinetic-models'],
        references: 'ICRP Publication 78 (1997)'
    },

    'dose-coefficients': {
        term: 'Dose Coefficients',
        definition: 'Conversion factors that relate intake (Bq) to committed effective dose (Sv) for specific radionuclides, chemical forms, and exposure pathways. Published by ICRP and used to calculate internal doses without performing detailed biokinetic calculations for each case. Units: Sv/Bq.',
        category: 'calculation',
        relatedTerms: ['committed-effective-dose', 'biokinetic-models', 'intake'],
        references: 'ICRP Publications 68, 71, 72 (1994-1996)'
    },

    // Bioassay and Measurement
    'radiobioassay': {
        term: 'Radiobioassay',
        definition: 'The measurement of radioactive material in the body or in biological samples (urine, feces, breath, etc.) to assess internal contamination. Bioassay data provides the foundation for intake assessment and internal dose calculations in occupational and medical scenarios.',
        category: 'measurement',
        relatedTerms: ['in-vitro', 'in-vivo', 'intake', 'biokinetic-models'],
        references: 'ICRP Publication 78 (1997)'
    },

    'in-vitro': {
        term: 'In Vitro Bioassay',
        definition: 'Bioassay measurements performed on biological samples collected from the body (urine, feces, blood, breath condensate, etc.) and analyzed in a laboratory setting. "In vitro" means "in glass," referring to analysis outside the living body. Examples include urine tritium analysis and fecal plutonium measurements.',
        category: 'measurement',
        relatedTerms: ['in-vivo', 'radiobioassay', 'mda', 'decision-level'],
        references: 'ICRP Publication 78 (1997)'
    },

    'in-vivo': {
        term: 'In Vivo Bioassay',
        definition: 'Direct measurement of radioactive material in the living body using external detectors such as whole body counters, chest counters, or thyroid counters. "In vivo" means "in the living," referring to measurements made while the radioactive material remains in the body.',
        category: 'measurement',
        relatedTerms: ['in-vitro', 'radiobioassay', 'mda', 'decision-level'],
        references: 'ICRP Publication 78 (1997)'
    },

    'decision-level': {
        term: 'Decision Level (DL)',
        definition: 'The minimum measurement value above which it can be concluded with reasonable confidence that radioactive material is present in a sample. Statistically defined as the measurement value that provides 95% confidence that activity is present when it exceeds this level. Used to distinguish between "detected" and "not detected" results.',
        category: 'measurement',
        relatedTerms: ['mda', 'in-vitro', 'in-vivo'],
        references: 'ANSI N13.30 (1996), ISO 11929'
    },

    'mda': {
        term: 'Minimum Detectable Activity (MDA)',
        definition: 'The minimum activity in a sample that can be detected with 95% probability when the activity is actually present, with only 5% probability of falsely detecting activity when none is present. MDA defines the measurement system capability and is used to establish bioassay program sensitivity requirements.',
        category: 'measurement',
        relatedTerms: ['decision-level', 'in-vitro', 'in-vivo'],
        references: 'ANSI N13.30 (1996), ISO 11929'
    },

    // Biokinetic Models
    'biokinetic-models': {
        term: 'Biokinetic Models',
        definition: 'Mathematical descriptions of the uptake, distribution, retention, and excretion of radioactive materials in the human body. These compartmental models track the movement of radionuclides between different organs and tissues over time, accounting for both biological processes and radioactive decay.',
        category: 'modeling',
        relatedTerms: ['biokinetic-model', 'irf', 'dose-coefficients'],
        references: 'ICRP Publications 66, 67, 68 (1994)'
    },

    'biokinetic-model': {
        term: 'Biokinetic Model',
        definition: 'A mathematical representation of the biological behavior of a specific radionuclide in the human body, describing its uptake, distribution among organs and tissues, retention, and excretion. Models are typically represented as systems of differential equations or transfer compartments.',
        category: 'modeling',
        relatedTerms: ['biokinetic-models', 'irf', 'intake'],
        references: 'ICRP Publications 66, 67, 68 (1994)'
    },

    'irf': {
        term: 'Intake Retention Function (IRF)',
        definition: 'A mathematical function derived from biokinetic models that describes the fraction of an initial intake that remains in a specific organ, tissue, or the whole body as a function of time after intake. IRFs are used to relate bioassay measurements to the original intake amount.',
        category: 'modeling',
        relatedTerms: ['biokinetic-model', 'biokinetic-models', 'intake'],
        references: 'ICRP Publication 78 (1997)'
    }
};

/**
 * Get definition for a glossary term
 * @param {string} termKey - The key for the glossary term
 * @returns {object|null} - The definition object or null if not found
 */
function getGlossaryDefinition(termKey) {
    return GLOSSARY_DEFINITIONS[termKey] || null;
}

/**
 * Get all terms in a specific category
 * @param {string} category - The category to filter by
 * @returns {Array} - Array of term objects in the category
 */
function getTermsByCategory(category) {
    return Object.entries(GLOSSARY_DEFINITIONS)
        .filter(([key, term]) => term.category === category)
        .map(([key, term]) => ({ key, ...term }));
}

/**
 * Search glossary terms by keyword
 * @param {string} keyword - The keyword to search for
 * @returns {Array} - Array of matching term objects
 */
function searchGlossaryTerms(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return Object.entries(GLOSSARY_DEFINITIONS)
        .filter(([key, term]) => 
            term.term.toLowerCase().includes(lowerKeyword) ||
            term.definition.toLowerCase().includes(lowerKeyword)
        )
        .map(([key, term]) => ({ key, ...term }));
}
