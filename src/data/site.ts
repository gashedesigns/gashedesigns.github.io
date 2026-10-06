export const site = {
  name: 'George Ashe',
  profession: 'Engineering Physicist',
  domains: 'Experimental Diagnostics · Hardware · Controls · Plasma & Aerospace',
  descriptor: 'Engineering Physicist | Experimental Systems | Plasma & Aerospace',
  positioning: 'Building the instruments that make complex physics measurable.',
  introduction: 'Experimental hardware, diagnostics, and integrated systems — from the first design sketch to fabrication, acquisition, and analysis.',
  email: undefined as string | undefined,
  github: 'https://github.com/gashedesigns',
  linkedin: undefined as string | undefined,
};

// Stable keys keep labels independently editable. Add a key here to extend the schema.
export const categories = {
  diagnostics: { label: 'Experimental Hardware & Diagnostics', shortLabel: 'Hardware & diagnostics', description: 'Instruments that connect physical phenomena to reliable measurements.' },
  controls: { label: 'Controls, Sensors & Embedded Systems', shortLabel: 'Controls & sensing', description: 'Acquisition, telemetry, and feedback across integrated systems.' },
  fabrication: { label: 'Design & Fabrication', shortLabel: 'Design & fabrication', description: 'Turning engineering requirements into physical hardware.' },
  computing: { label: 'Modeling & Scientific Computing', shortLabel: 'Modeling & computing', description: 'Numerical tools that complement experimental engineering.' },
} as const;
export type Category = keyof typeof categories;

export const capabilities = [
  { title: 'Diagnostics & instrumentation', items: ['Optical diagnostics', 'Thermal sensing', 'Radiation detectors', 'Sensor integration', 'DAQ & calibration'], category: 'diagnostics' },
  { title: 'Hardware development', items: ['CAD & mechanical design', 'CNC machining', 'Additive manufacturing', 'Fixtures & assemblies', 'Electromechanical integration'], category: 'fabrication' },
  { title: 'Controls & embedded systems', items: ['Embedded sensing', 'Telemetry', 'Feedback control', 'Microcontrollers', 'Real-time acquisition'], category: 'controls' },
  { title: 'Scientific computing', items: ['Python & MATLAB', 'CFD', 'Numerical methods', 'Plasma modeling', 'Scientific software'], category: 'computing' },
] as const;

export const background = {
  summary: 'An engineering physics perspective across experimental diagnostics, plasma physics, aerospace systems, and hands-on hardware development.',
  note: 'Detailed positions, dates, education, and research programs will be added after review.',
};
