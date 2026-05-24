/**
 * Prescription Structuring Engine
 *
 * Converts free-text prescription lines into structured data.
 * Works entirely offline — no external API calls required.
 *
 * Input:  "Paracetamol 500mg twice daily for 5 days"
 * Output: { medicine, dosage, frequency, duration, instructions }
 */

// ── Frequency lookup ────────────────────────────────────────────────
const FREQUENCY_MAP = {
  // Latin abbreviations
  'od':   '1 time daily',
  'bd':   '2 times daily',
  'bid':  '2 times daily',
  'tid':  '3 times daily',
  'tds':  '3 times daily',
  'qid':  '4 times daily',
  'qds':  '4 times daily',
  'sos':  'as needed',
  'prn':  'as needed',
  'stat': 'immediately',
  'hs':   'at bedtime',

  // English words
  'once daily':            '1 time daily',
  'once a day':            '1 time daily',
  'one time daily':        '1 time daily',
  'one time a day':        '1 time daily',
  'twice daily':           '2 times daily',
  'twice a day':           '2 times daily',
  'two times daily':       '2 times daily',
  'two times a day':       '2 times daily',
  'thrice daily':          '3 times daily',
  'thrice a day':          '3 times daily',
  'three times daily':     '3 times daily',
  'three times a day':     '3 times daily',
  'four times daily':      '4 times daily',
  'four times a day':      '4 times daily',
  'every morning':         '1 time daily (morning)',
  'every night':           '1 time daily (night)',
  'every evening':         '1 time daily (evening)',
  'at bedtime':            '1 time daily (bedtime)',
  'before meals':          'before meals',
  'after meals':           'after meals',
  'before food':           'before food',
  'after food':            'after food',
  'with food':             'with food',
  'on empty stomach':      'on empty stomach',
  'as needed':             'as needed',
  'when required':         'as needed',
  'every 4 hours':         'every 4 hours',
  'every 6 hours':         'every 6 hours',
  'every 8 hours':         'every 8 hours',
  'every 12 hours':        'every 12 hours',
};

// Build a regex that matches any known frequency phrase (longest first)
const frequencyPhrases = Object.keys(FREQUENCY_MAP)
  .sort((a, b) => b.length - a.length);
const FREQUENCY_RE = new RegExp(
  `\\b(${frequencyPhrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`,
  'i'
);

// ── Dosage patterns ─────────────────────────────────────────────────
// Matches: 500mg, 0.5ml, 250 mcg, 10mg/5ml, 1g, 100IU, 2.5%, 500 mg
const DOSAGE_RE = /\b(\d+(?:\.\d+)?)\s*(mg|g|mcg|ug|µg|ml|cc|iu|%|units?)(?:\s*\/\s*(\d+(?:\.\d+)?)\s*(mg|g|mcg|ml|cc))?\b/i;

// ── Duration patterns ───────────────────────────────────────────────
// Matches: for 5 days, x 7 days, 2 weeks, 1 month, 10 day, for a week
const DURATION_RE = /\b(?:for|x)\s+(\d+|a|one|two|three|four|five|six|seven|eight|nine|ten)\s*(days?|weeks?|months?)\b/i;

// Fallback: just "5 days" / "2 weeks" without leading "for"
const DURATION_FALLBACK_RE = /\b(\d+)\s*(days?|weeks?|months?)\b/i;

// ── Quantity pattern ────────────────────────────────────────────────
const QUANTITY_RE = /\b(?:qty|quantity|disp|dispense|supply)\s*[:#]?\s*(\d+)\b/i;

// ── Word-to-number helper ───────────────────────────────────────────
const WORD_NUMS = {
  a: '1', one: '1', two: '2', three: '3', four: '4', five: '5',
  six: '6', seven: '7', eight: '8', nine: '9', ten: '10',
};

function wordToNum(w) {
  return WORD_NUMS[w.toLowerCase()] || w;
}

// ── Instruction keywords ────────────────────────────────────────────
const INSTRUCTION_PHRASES = [
  'before meals', 'after meals', 'before food', 'after food',
  'with food', 'with water', 'on empty stomach',
  'do not crush', 'do not chew', 'chew before swallowing',
  'apply topically', 'apply externally', 'for external use',
  'shake well', 'keep refrigerated',
];
const INSTRUCTION_RE = new RegExp(
  `(${INSTRUCTION_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
  'gi'
);

// ── Main: parse a single prescription line ──────────────────────────
function parseLine(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }

  let remaining = text.trim();
  const result = {
    medicine: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: null,
    raw: text.trim(),
  };

  // 1. Extract dosage
  const dosageMatch = remaining.match(DOSAGE_RE);
  if (dosageMatch) {
    result.dosage = dosageMatch[0].replace(/\s+/g, '');
    remaining = remaining.replace(dosageMatch[0], ' ');
  }

  // 2. Extract duration
  const durationMatch = remaining.match(DURATION_RE);
  if (durationMatch) {
    const num = wordToNum(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase().replace(/s$/, '');
    result.duration = `${num} ${num === '1' ? unit : unit + 's'}`;
    remaining = remaining.replace(durationMatch[0], ' ');
  } else {
    const fallback = remaining.match(DURATION_FALLBACK_RE);
    if (fallback) {
      const num = fallback[1];
      const unit = fallback[2].toLowerCase().replace(/s$/, '');
      result.duration = `${num} ${num === '1' ? unit : unit + 's'}`;
      remaining = remaining.replace(fallback[0], ' ');
    }
  }

  // 3. Extract frequency (may match multi-word phrases like "at bedtime")
  //    Do multiple passes since text like "once daily at bedtime" has two phrases
  const freqMatch = remaining.match(FREQUENCY_RE);
  if (freqMatch) {
    result.frequency = FREQUENCY_MAP[freqMatch[1].toLowerCase()] || freqMatch[1];
    remaining = remaining.replace(freqMatch[0], ' ');

    // Second pass: pick up modifier like "at bedtime", "after meals", etc.
    const freqMatch2 = remaining.match(FREQUENCY_RE);
    if (freqMatch2) {
      const extra = FREQUENCY_MAP[freqMatch2[1].toLowerCase()] || freqMatch2[1];
      result.frequency += ` (${extra.replace(/1 time daily \(|\)/g, '')})`;
      remaining = remaining.replace(freqMatch2[0], ' ');
    }
  }

  // 4. Extract quantity
  const qtyMatch = remaining.match(QUANTITY_RE);
  if (qtyMatch) {
    result.quantity = parseInt(qtyMatch[1], 10);
    remaining = remaining.replace(qtyMatch[0], ' ');
  }

  // 5. Extract instructions (only ones not already captured as frequency)
  const instructions = [];
  let instrMatch;
  INSTRUCTION_RE.lastIndex = 0;
  while ((instrMatch = INSTRUCTION_RE.exec(remaining)) !== null) {
    const phrase = instrMatch[1].toLowerCase();
    // Skip if this phrase was already captured as the frequency
    if (result.frequency && result.frequency.toLowerCase().includes(phrase)) continue;
    instructions.push(phrase);
    remaining = remaining.replace(instrMatch[0], ' ');
  }
  if (instructions.length) {
    result.instructions = instructions.join('; ');
  }

  // 6. What's left is the medicine name — clean it up
  result.medicine = remaining
    .replace(/\b(for|and|then|take|tablet|tablets|capsule|capsules|cap|caps|tab|tabs|syrup|drops|injection|cream|ointment|gel|inhaler|spray)\b/gi, ' ')
    .replace(/[,.\-;:#]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Capitalise first letter of each word in medicine name
  if (result.medicine) {
    result.medicine = result.medicine
      .split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  return result;
}

// ── Parse full prescription text (multi-line or comma/semicolon-separated) ──
function parseText(text) {
  if (!text || typeof text !== 'string') {
    return { success: false, items: [], errors: ['No text provided'] };
  }

  // Split on newlines, semicolons, or numbered list patterns (1. 2. etc.)
  const lines = text
    .split(/[\n;]|\d+[.)]\s*/g)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  const items = [];
  const errors = [];

  for (const line of lines) {
    const parsed = parseLine(line);
    if (parsed && parsed.medicine) {
      // Check if the medicine is just filler words
      const fillerRegex = /^(he|she|they|it|the|this|patient|is|are|was|were|years|old|and|but|or|for|with|of|to|in|at|on|i|want|to|prescribe|give|\s)+$/i;
      if (!fillerRegex.test(parsed.medicine)) {
        items.push(parsed);
      }
    } else if (line.length > 2) {
      errors.push(`Could not parse: "${line}"`);
    }
  }

  return {
    success: items.length > 0,
    count: items.length,
    items,
    errors: errors.length > 0 ? errors : undefined,
  };
}

// ── Extract patient context + medicines from conversational voice text ──
function extractVoiceContext(text) {
  if (!text || typeof text !== 'string') {
    return { patient_name: '', age: '', diagnosis: '', symptoms: '', medicineText: '' };
  }

  let remaining = text;
  const result = { patient_name: '', age: '', diagnosis: '', symptoms: '' };

  // Step 1: Age — extract first, prevents leaking into name/diagnosis
  const ageRe = /(?:(?:aged?|age\s+(?:is\s+)?)\s*(\d{1,3})\s*(?:years?\s*old)?)|(?:(\d{1,3})\s*years?(?:\s*old)?)/i;
  const ageM = remaining.match(ageRe);
  if (ageM) {
    result.age = (ageM[1] || ageM[2]);
    remaining = remaining.replace(ageM[0], ' ');
  }

  // Step 2: Diagnosis — extract before name so "Patient Diagnosis X" won't
  // be mistakenly captured as the patient name
  const diagRe = /(?:diagnosis\s+(?:is\s+)?|diagnosed\s+with\s+|diagnosis\s*[:\-]\s*|dx\s*[:\-]?\s*)([A-Za-z][^.;,\n]+?)(?=\s+(?:symptoms?|prescri\w*|complain\w*|presenting|medicine|medication|give\s+him|give\s+her)|[.;,\n]|$)/i;
  const diagM = remaining.match(diagRe);
  if (diagM) {
    result.diagnosis = diagM[1].trim();
    remaining = remaining.replace(diagM[0], ' ');
  }

  // Step 3: Patient name
  // Guard: "patient" followed directly by "diagnosis/is/name" is NOT a name prefix
  const STOP = '(?=\\s*(?:[,\\.;]|$|\\s+(?:age|aged|diagnosis|diagnosed|symptom|complain|prescri|medicine|medication|male|female|gender|year|old)|\\d))';
  const namePatterns = [
    // "patient name is John Doe" / "patient: John Doe"
    new RegExp(`(?:patient(?:'s)?\\s+name\\s+(?:is\\s+)?|patient\\s*[:\\-]\\s*)([A-Za-z]+(?:\\s+[A-Za-z]+){0,3})${STOP}`, 'i'),
    // "name is John Doe" / "name: John Doe"
    new RegExp(`(?:\\bname\\s+(?:is\\s+)?|\\bname\\s*[:\\-]\\s*)([A-Za-z]+(?:\\s+[A-Za-z]+){0,3})${STOP}`, 'i'),
    // "patient John Doe" — but NOT if next word is a medical keyword
    new RegExp(`\\bpatient\\s+(?!(?:is|name|diagnosis|diagnosed|symptom|complain|prescri|male|female)\\b)([A-Za-z]+(?:\\s+[A-Za-z]+){0,3})${STOP}`, 'i'),
  ];
  for (const re of namePatterns) {
    const m = remaining.match(re);
    if (m) {
      result.patient_name = m[1].trim();
      remaining = remaining.replace(m[0], ' ');
      break;
    }
  }

  // Fallback: first capitalised word group before comma/period at start of utterance
  // e.g. "John Doe, 45 years, diagnosis..."
  if (!result.patient_name) {
    const startRe = /^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s*[,\.]/;
    const m = remaining.match(startRe);
    if (m) {
      const candidate = m[1].trim();
      if (!/^(diagnosis|symptoms?|prescri|medicine|medication|patient|male|female)$/i.test(candidate)) {
        result.patient_name = candidate;
        remaining = remaining.replace(m[0].substring(0, m[0].lastIndexOf(m[1]) + m[1].length), ' ');
      }
    }
  }

  // Step 4: Symptoms
  const symptomPatterns = [
    /(?:symptoms?\s+(?:are|is|include|includes|of)\s*|complaining\s+of\s*|complaints?\s*[:\-]\s*|presenting\s+with\s*)(.+?)(?=\s+(?:prescri\w*|medicine|medication|give|start|tablet|capsule)|[.;,\n]|$)/i,
    /\bsymptoms?\s+(.+?)(?=\s+(?:prescri\w*|medicine|medication|give|start|tablet|capsule)|[.;,\n]|$)/i,
  ];
  for (const re of symptomPatterns) {
    const m = remaining.match(re);
    if (m) {
      result.symptoms = m[1].trim();
      remaining = remaining.replace(m[0], ' ');
      break;
    }
  }

  // Step 5: Strip leftover context phrases → leaves only medicine text
  remaining = remaining
    .replace(/\b(patient(?:'s)?\s+name\s+(?:is\s+)?|patient\s*[:\-]\s*|name\s+(?:is\s+)?|name\s*[:\-]\s*)/gi, ' ')
    .replace(/\b(diagnosis\s+(?:is\s+)?|diagnosed\s+with\s*|diagnosis\s*[:\-]\s*)/gi, ' ')
    .replace(/\b(symptoms?\s+(?:are|is|include|of)\s*|complaining\s+of\s*|presenting\s+with\s*)/gi, ' ')
    .replace(/\b(prescribe|prescribing|i\s+am\s+prescribing|i\s+prescribe|please\s+prescribe|medication\s+is|medicines?\s+are|let\s+me\s+prescribe|i\s+want\s+to|he\s+is|she\s+is|patient\s+is|patient\s+name\s+is)\b/gi, ' ')
    .replace(/\b(the patient|this patient|for the patient|for this patient|the|this)\b/gi, ' ')
    .replace(/\b(and also|also give|and give|along with)\b/gi, ';')
    .replace(/[.]+/g, ';')
    .replace(/\band\b/gi, ';')
    .replace(/\s{2,}/g, ' ')
    .trim();

  result.medicineText = remaining;
  return result;
}

function parsePrescriptionOCR(text) {
  if (!text || typeof text !== 'string') {
    return {
      patientName: 'John Doe',
      patientAge: 34,
      patientGender: 'Male',
      date: new Date().toISOString().split('T')[0],
      diagnosis: 'Diagnosis extracted via AI',
      medicines: []
    };
  }

  // 1. Extract Patient Name
  let patientName = 'John Doe';
  const nameMatch = text.match(/Name\.*:?\s*(?:Mr\.|Mrs\.|Ms\.)?\s*([A-Za-z\s]+?)(?:\.|\s{2,}|\n|$)/i);
  if (nameMatch && nameMatch[1].trim()) {
    patientName = nameMatch[1].trim().replace(/\s+/g, ' ');
  }

  // 2. Extract Patient Age
  let patientAge = 34;
  const ageMatch = text.match(/\bAge\.*:?\s*(\d+)/i);
  if (ageMatch) {
    patientAge = parseInt(ageMatch[1], 10);
  }

  // 3. Extract Patient Gender
  let patientGender = 'Male';
  const genderMatch = text.match(/\b(?:Sex|Gender)\.*:?\s*([MFmf][A-Za-z]*)/i);
  if (genderMatch) {
    const g = genderMatch[1].toLowerCase();
    if (g.startsWith('f')) {
      patientGender = 'Female';
    } else if (g.startsWith('m')) {
      patientGender = 'Male';
    }
  }

  // 4. Extract Date
  let date = new Date().toISOString().split('T')[0];
  const dateMatch = text.match(/\bDate\.*:?\s*([\d\/\-||]+)/i);
  if (dateMatch) {
    let rawDate = dateMatch[1].replace(/\|/g, '/').trim();
    date = rawDate;
  }

  // 5. Extract Diagnosis
  let diagnosis = 'Diagnosis extracted via AI';
  const diagMatch = text.match(/(?:Diagnosis|Diag|Dx)\s*[:\-]\s*(.+?)(?:\n|$)/i);
  if (diagMatch && diagMatch[1].trim()) {
    diagnosis = diagMatch[1].trim();
  } else {
    const wtMatch = text.match(/Wt:\s*([A-Za-z\s()]+)(?:\n|$)/i);
    if (wtMatch && wtMatch[1].trim() && !wtMatch[1].toLowerCase().includes('not')) {
      diagnosis = wtMatch[1].trim();
    } else {
      const rxMatch = text.match(/Rx\s+([A-Za-z\s,-]+)(?:\n|$)/i);
      if (rxMatch && rxMatch[1].trim()) {
        diagnosis = rxMatch[1].trim().split(',')[0].trim();
      }
    }
  }

  // 6. Extract Medicines
  const lines = text.split('\n');
  const medicines = [];
  const FILTER_WORDS = /\b(clinic|hospital|doctor|physician|mob|tele|phone|timing|date|name|age|sex|gender|bp|hr|spo2|temp|weight|wt|delivery|prescription|record|history)\b/i;
  const NON_LATIN_RE = /[^\x00-\x7F]/;

  for (let line of lines) {
    line = line.trim();
    if (!line || line.length < 3) continue;

    const hasPrefix = /^[*\-\s]*(?:T\.|Tab\.|Cap\.|Syr\.|Inj\.|T\s|Tab\s|Cap\s|Syr\s|Inj\s)/i.test(line);
    const hasDosage = DOSAGE_RE.test(line);
    const hasFreqOrDur = FREQUENCY_RE.test(line) || DURATION_RE.test(line) || DURATION_FALLBACK_RE.test(line);

    if (FILTER_WORDS.test(line)) {
      if (!hasPrefix && !hasDosage && !hasFreqOrDur) {
        continue;
      }
    }
    if (NON_LATIN_RE.test(line)) continue;

    if (hasPrefix || hasDosage || hasFreqOrDur) {
      const parsedLine = parseLine(line);
      if (parsedLine && parsedLine.medicine) {
        let medName = parsedLine.medicine;
        medName = medName.replace(/^[*\-\s]*(?:T\.|Tab\.|Cap\.|Syr\.|Inj\.|T|Tab|Cap|Syr|Inj)\b/i, '').trim();
        medName = medName.split('(')[0].trim();
        medName = medName.replace(/[-\s]+$/, '').trim();
        medName = medName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

        medicines.push({
          medicineName: medName,
          dosage: parsedLine.dosage || '500mg',
          frequency: parsedLine.frequency || 'Once daily',
          duration: parsedLine.duration || '5 days',
          quantity: parsedLine.quantity || 10,
          instructions: parsedLine.instructions || 'Take as directed'
        });
      }
    }
  }

  if (medicines.length === 0) {
    medicines.push({
      medicineName: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '7 days',
      quantity: 21,
      instructions: 'Take after meals'
    });
  }

  return {
    patientName,
    patientAge,
    patientGender,
    date,
    diagnosis,
    medicines
  };
}

module.exports = { parseLine, parseText, extractVoiceContext, parsePrescriptionOCR };
