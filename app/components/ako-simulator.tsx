'use client';

import React, { useState, useEffect, useRef } from 'react';

const CASES = {
  A: { refrigerant: 'R-407c', tRoom: 24, tEvap: 0, correct: { C2: 30, C3: 15, C6: 3, C7: 1, C8: 2, d0: 2, d1: 10, d4: 5, F0: 30, F3: 1, A1: 30, A2: 0, A5: 1 }},
  B: { refrigerant: 'R-32', tRoom: 22, tEvap: -10, correct: { C2: 25, C3: 20, C6: 3, C7: 1, C8: 1, d0: 1, d1: 15, d4: 0, F0: 25, F3: 0, A1: 25, A2: -10, A5: 2 }},
  C: { refrigerant: 'R-410A', tRoom: 2, tEvap: -20, correct: { C2: 5, C3: -5, C6: 0, C7: 0, C8: 0, d0: 5, d1: 30, d4: -5, F0: 25, F3: 1, A1: 5, A2: -20, A5: 1 }},
  D: { refrigerant: 'R-134a', tRoom: 8, tEvap: 5, correct: { C2: 15, C3: 0, C6: 1, C7: 0, C8: 0, d0: 4, d1: 20, d4: 0, F0: 15, F3: 1, A1: 15, A2: 5, A5: 3 }},
  E: { refrigerant: 'R-290', tRoom: -10, tEvap: -25, correct: { C2: 0, C3: -20, C6: 3, C7: 2, C8: 1, d0: 3, d1: 25, d4: -15, F0: 0, F3: 0, A1: 0, A2: -25, A5: 0 }},
  F: { refrigerant: 'R-134a', tRoom: 15, tEvap: 0, correct: { C2: 20, C3: 10, C6: 3, C7: 1, C8: 1, d0: 2, d1: 15, d4: 10, F0: 20, F3: 0, A1: 20, A2: 0, A5: 0 }}
};

const EXERCISE_LABELS = {
  C2: 'Tª máxima ajuste SP',
  C3: 'Tª mínima ajuste SP',
  C6: 'Relé COOL encendido si sonda 1 se avería',
  C7: 'Relé COOL apagado si sonda 1 se avería',
  C8: 'Relé COOL apagado si sonda 1 se avería',
  d0: 'Frecuencia de desescarche',
  d1: 'Tiempo de desescarche',
  d4: 'Tª para finalizar desescarche antes de tiempo previsto',
  F0: 'Temperatura de paro evaporadores',
  F3: 'Ventiladores en marcha durante desescarche',
  A1: 'Alarma de temperatura máxima (ºC por encima del SP)',
  A2: 'Alarma de temperatura mínima (ºC por debajo del SP-diff)',
  A5: 'Retardos de alarmas caso que salten'
};

const WIZARD_APPS = {
  1: { name: 'Producto variado', SP: 2, d0: 4, d1: 20, F0: 8, F3: 1, P0: 0 },
  2: { name: 'Congelados', SP: -18, d0: 4, d1: 20, F0: 0, F3: 0, P0: 0 },
  3: { name: 'Frutas y verduras', SP: 10, d0: 4, d1: 20, F0: 30, F3: 1, P0: 0 },
  4: { name: 'Pescado fresco', SP: 0, d0: 4, d1: 20, F0: 8, F3: 1, P0: 0 },
  5: { name: 'Refrescos', SP: 3, d0: 24, d1: 20, F0: 8, F3: 1, P0: 0 },
  6: { name: 'Botelleros', SP: 12, d0: 24, d1: 20, F0: 30, F3: 1, P0: 0 },
  7: { name: 'Clima', SP: 21, d0: 96, d1: 0, F0: 99, F3: 1, P0: 0 },
  8: { name: 'Calor/Incubadoras', SP: 37, d0: 0, d1: 0, F0: 0, F3: 0, P0: 1 }
};

const PARAM_CONFIG = {
  SP: { min: -50, max: 99, def: 2, menu: 'rE', desc: 'Punto de ajuste (Set Point)' },
  C0: { min: -20, max: 20, def: 0, menu: 'rE', desc: 'Calibración sonda 1 (Offset)', step: 0.1 },
  C1: { min: 0.1, max: 20, def: 2, menu: 'rE', desc: 'Diferencial sonda 1 (Histéresis)', step: 0.1 },
  C2: { min: -50, max: 99, def: 99, menu: 'rE', desc: 'Bloqueo superior del Set Point' },
  C3: { min: -50, max: 99, def: -50, menu: 'rE', desc: 'Bloqueo inferior del Set Point' },
  C4: { min: 0, max: 1, def: 0, menu: 'rE', desc: 'Tipo retardo protección compresor' },
  C5: { min: 0, max: 15, def: 3, menu: 'rE', desc: 'Tiempo retardo protección (min)' },
  C6: { min: 0, max: 3, def: 0, menu: 'rE', desc: 'Estado relé COOL fallo sonda' },
  C7: { min: 0, max: 120, def: 10, menu: 'rE', desc: 'Tiempo ON fallo sonda 1 (min)' },
  C8: { min: 0, max: 120, def: 5, menu: 'rE', desc: 'Tiempo OFF fallo sonda 1 (min)' },
  C9: { min: 0.1, max: 20, def: 2, menu: 'rE', desc: 'Diferencial sonda 2', step: 0.1 },
  C10: { min: -50, max: 99, def: 0, menu: 'rE', desc: 'Variación SP en Fast Freezing' },
  C11: { min: 0, max: 48, def: 24, menu: 'rE', desc: 'Duración máx Fast Freezing (h)' },
  C12: { min: 0, max: 10, def: 0, menu: 'rE', desc: 'Variación SP en modo ECO' },
  d0: { min: 0, max: 96, def: 4, menu: 'dEF', desc: 'Frecuencia desescarche (h)' },
  d1: { min: 0, max: 255, def: 20, menu: 'dEF', desc: 'Duración máx desescarche (min)' },
  d2: { min: 0, max: 2, def: 0, menu: 'dEF', desc: 'Mensaje durante desescarche' },
  d3: { min: 0, max: 1, def: 0, menu: 'dEF', desc: 'Desescarche al conectar' },
  d4: { min: -50, max: 99, def: 8, menu: 'dEF', desc: 'Temperatura fin desescarche (°C)' },
  d5: { min: 0, max: 3, def: 0, menu: 'dEF', desc: 'Tipo desescarche' },
  d6: { min: 0, max: 99, def: 0, menu: 'dEF', desc: 'Retardo inicio desescarche (min)' },
  d7: { min: 0, max: 1, def: 0, menu: 'dEF', desc: 'Cómputo tiempo desescarche' },
  d8: { min: 0, max: 30, def: 0, menu: 'dEF', desc: 'Tiempo de goteo (min)' },
  d9: { min: 0, max: 30, def: 0, menu: 'dEF', desc: 'Retardo arranque tras desescarche' },
  F0: { min: -50, max: 150, def: 50, menu: 'FAn', desc: 'Temp paro ventiladores (°C)' },
  F1: { min: 0, max: 1, def: 0, menu: 'FAn', desc: 'Parar ventiladores al parar compresor' },
  F2: { min: 0, max: 1, def: 1, menu: 'FAn', desc: 'Ventiladores durante desescarche' },
  F3: { min: 0, max: 99, def: 1, menu: 'FAn', desc: 'Retardo ventiladores tras desescarche' },
  F4: { min: 0, max: 1, def: 0, menu: 'FAn', desc: 'Parar ventiladores abrir puerta' },
  F5: { min: -50, max: 150, def: 50, menu: 'FAn', desc: 'Temp paro ventiladores sonda 2' },
  A0: { min: 0, max: 1, def: 0, menu: 'AL', desc: 'Config alarmas temperatura' },
  A1: { min: -50, max: 150, def: 99, menu: 'AL', desc: 'Alarma temperatura máxima (°C)' },
  A2: { min: -50, max: 150, def: -50, menu: 'AL', desc: 'Alarma temperatura mínima (°C)' },
  A3: { min: 0, max: 120, def: 30, menu: 'AL', desc: 'Retardo alarmas puesta en marcha' },
  A4: { min: 0, max: 120, def: 0, menu: 'AL', desc: 'Retardo alarmas fin desescarche' },
  A5: { min: 0, max: 120, def: 30, menu: 'AL', desc: 'Retardo alarmas desde A1/A2' },
  A6: { min: 0, max: 120, def: 0, menu: 'AL', desc: 'Retardo alarma externa' },
  A7: { min: 0, max: 120, def: 0, menu: 'AL', desc: 'Retardo desact alarma externa' },
  A8: { min: 0, max: 1, def: 0, menu: 'AL', desc: 'Aviso desescarche por tiempo máx' },
  A9: { min: 1, max: 20, def: 2, menu: 'AL', desc: 'Diferencial alarmas', step: 0.1 },
  A10: { min: 0, max: 1, def: 0, menu: 'AL', desc: 'Polaridad relé alarma' },
  A12: { min: 0, max: 255, def: 1, menu: 'AL', desc: 'Retardo alarma puerta abierta' },
  P0: { min: 0, max: 1, def: 0, menu: 'CnF', desc: 'Tipo funcionamiento (0=Frío,1=Calor)' },
  P1: { min: 0, max: 255, def: 0, menu: 'CnF', desc: 'Retardo al recibir alimentación' },
  P2: { min: 0, max: 2, def: 0, menu: 'CnF', desc: 'Función password' },
  P4: { min: 1, max: 3, def: 1, menu: 'CnF', desc: 'Tipo entradas' },
  P5: { min: 1, max: 255, def: 1, menu: 'CnF', desc: 'Dirección Modbus' },
  P6: { min: 0, max: 5, def: 1, menu: 'CnF', desc: 'Config relé AUX' },
  P7: { min: 0, max: 3, def: 0, menu: 'CnF', desc: 'Visualización Tª' },
  P8: { min: 0, max: 3, def: 1, menu: 'CnF', desc: 'Sonda a visualizar' },
  P9: { min: 0, max: 1, def: 0, menu: 'CnF', desc: 'Tipo sonda' },
  P10: { min: 0, max: 9, def: 0, menu: 'CnF', desc: 'Config entrada digital 1' },
  P11: { min: 0, max: 9, def: 0, menu: 'CnF', desc: 'Config entrada digital 2' },
  P12: { min: 0, max: 1, def: 0, menu: 'CnF', desc: 'Polaridad entrada digital 1' },
  P13: { min: 0, max: 1, def: 0, menu: 'CnF', desc: 'Polaridad entrada digital 2' },
  P14: { min: 0, max: 120, def: 0, menu: 'CnF', desc: 'Tiempo máx arranque recogida gas' },
  P15: { min: 0, max: 15, def: 0, menu: 'CnF', desc: 'Tiempo máx recogida gas' },
  P19: { min: 0, max: 1, def: 0, menu: 'CnF', desc: 'Luces en modo ECO' },
  InI: { min: 1, max: 8, def: 1, menu: 'CnF', desc: 'Asistente tipo instalación (WIZARD)', isWizard: true },
  L5: { min: 0, max: 255, def: 0, menu: 'tId', desc: 'Código acceso (Password)' },
};

const MENUS = ['rE', 'dEF', 'FAn', 'AL', 'CnF', 'tId'];

interface SevenSegmentProps {
  char: string;
  color?: string;
}

const SevenSegment = ({ char, color = '#00ff00' }: SevenSegmentProps) => {
  const segments: Record<string, string> = {
    '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
    '5': 'afgcd', '6': 'afgcde', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
    '-': 'g', ' ': '', 'A': 'abcefg', 'b': 'cdefg', 'C': 'adef', 'd': 'bcdeg',
    'E': 'adefg', 'F': 'aefg', 'H': 'bcefg', 'L': 'def', 'n': 'ceg',
    'o': 'cdeg', 'P': 'abefg', 'r': 'eg', 'S': 'afgcd', 't': 'defg',
    'U': 'bcdef', 'Y': 'bcdfg', 'I': 'ef', 'i': 'e'
  };
  const active = segments[char] || '';
  const on = color, off = '#1a1a1a';
  
  return (
    <svg width="24" height="40" viewBox="0 0 24 40">
      <polygon points="4,2 20,2 18,6 6,6" fill={active.includes('a') ? on : off} />
      <polygon points="21,3 21,18 19,16 19,7" fill={active.includes('b') ? on : off} />
      <polygon points="21,22 21,37 19,33 19,24" fill={active.includes('c') ? on : off} />
      <polygon points="4,38 20,38 18,34 6,34" fill={active.includes('d') ? on : off} />
      <polygon points="3,22 3,37 5,33 5,24" fill={active.includes('e') ? on : off} />
      <polygon points="3,3 3,18 5,16 5,7" fill={active.includes('f') ? on : off} />
      <polygon points="4,20 20,20 18,22 6,22 6,18 18,18" fill={active.includes('g') ? on : off} />
    </svg>
  );
};

interface DisplayProps {
  text: string | number;
  blink: boolean;
}

const Display = ({ text, blink }: DisplayProps) => {
  const displayStr = String(text).slice(0, 4).padStart(4, ' ');
  return (
    <div style={{ opacity: blink ? 0.2 : 1, display: 'flex', gap: '2px', padding: '8px', background: '#000', borderRadius: '4px', transition: 'opacity 0.15s' }}>
      {displayStr.split('').map((c, i) => <SevenSegment key={i} char={c} />)}
    </div>
  );
};

interface ResultDetail {
  param: string;
  expected: number;
  actual: number;
  correct: boolean;
  label: string;
}

interface Results {
  score: number;
  total: number;
  details: ResultDetail[];
  percentage: number;
}

interface CaseData {
  refrigerant: string;
  tRoom: number;
  tEvap: number;
  correct: Record<string, number>;
}

interface ResultsScreenProps {
  studentName: string;
  selectedCase: string;
  caseData: CaseData;
  results: Results;
  onClose: () => void;
}

const ResultsScreen = ({ studentName, selectedCase, caseData, results, onClose }: ResultsScreenProps) => {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'white', zIndex: 1000, overflow: 'auto' }}>
      <style>{`@media print { .no-print { display: none !important; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }`}</style>
      
      <div className="no-print" style={{ position: 'fixed', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 1001 }}>
        <button onClick={() => window.print()} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          🖨️ Imprimir / Guardar PDF
        </button>
        <button onClick={onClose} style={{ background: '#6b7280', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
          ✕ Cerrar
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Arial, sans-serif', color: '#1a1a1a' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '3px solid #2563eb', paddingBottom: '20px' }}>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#1e293b' }}>SIMULADOR TERMOSTATO AKO-D14xxx</h1>
          <h2 style={{ margin: '0', fontSize: '18px', color: '#64748b', fontWeight: 'normal' }}>Informe de Evaluación</h2>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Alumno</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{studentName || 'Sin nombre'}</div>
            </div>
            <div>
              <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>Fecha</span>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Datos del Caso</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', textAlign: 'center' }}>
            <div><span style={{ color: '#64748b', fontSize: '12px' }}>Caso</span><div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>{selectedCase}</div></div>
            <div><span style={{ color: '#64748b', fontSize: '12px' }}>Refrigerante</span><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{caseData.refrigerant}</div></div>
            <div><span style={{ color: '#64748b', fontSize: '12px' }}>Tª Recinto</span><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{caseData.tRoom}°C</div></div>
            <div><span style={{ color: '#64748b', fontSize: '12px' }}>Tª Evaporación</span><div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{caseData.tEvap}°C</div></div>
          </div>
        </div>

        <div style={{ background: results.percentage >= 80 ? '#dcfce7' : results.percentage >= 50 ? '#fef9c3' : '#fee2e2', padding: '25px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: results.percentage >= 80 ? '#16a34a' : results.percentage >= 50 ? '#ca8a04' : '#dc2626' }}>{results.percentage}%</div>
          <div style={{ fontSize: '16px', color: '#1e293b' }}>{results.score} de {results.total} parámetros correctos</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '10px', color: results.percentage >= 80 ? '#16a34a' : results.percentage >= 50 ? '#ca8a04' : '#dc2626' }}>
            {results.percentage >= 80 ? '¡EXCELENTE!' : results.percentage >= 50 ? 'NECESITA MEJORAR' : 'INSUFICIENTE'}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Detalle de Parámetros</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Parámetro</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '100px' }}>Esperado</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '100px' }}>Configurado</th>
                <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', width: '80px' }}>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {results.details.map((d, i) => (
                <tr key={d.param} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>{d.label}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold' }}>{d.expected}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', color: d.correct ? '#16a34a' : '#dc2626' }}>{d.actual}</td>
                  <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                    <span style={{ display: 'inline-block', width: '24px', height: '24px', borderRadius: '50%', background: d.correct ? '#dcfce7' : '#fee2e2', color: d.correct ? '#16a34a' : '#dc2626', lineHeight: '24px', fontWeight: 'bold' }}>{d.correct ? '✓' : '✗'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          Simulador AKO-D14xxx · Programación de recintos frigoríficos · CIFC
        </div>
      </div>
    </div>
  );
};

export default function AKOSimulator() {
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [studentName, setStudentName] = useState('');
  const [params, setParams] = useState(() => {
    const init: Record<string, number> = {};
    Object.keys(PARAM_CONFIG).forEach(k => init[k] = PARAM_CONFIG[k as keyof typeof PARAM_CONFIG].def);
    return init;
  });
  
  const [mode, setMode] = useState('normal');
  const [wizardApp, setWizardApp] = useState(1);
  const [menuLevel, setMenuLevel] = useState(0);
  const [currentMenu, setCurrentMenu] = useState(0);
  const [currentParam, setCurrentParam] = useState(0);
  const [editValue, setEditValue] = useState(0);
  const [displayText, setDisplayText] = useState('2');
  const [blinkState, setBlinkState] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showResultsScreen, setShowResultsScreen] = useState(false);
  const [standby, setStandby] = useState(false);
  const [fastFreeze, setFastFreeze] = useState(false);
  const [defrostActive, setDefrostActive] = useState(false);
  const [leds, setLeds] = useState({ eco: false, prg: false, fastFreeze: false, standby: false, fan: true, cool: true, aux: false, def: false, res: false });
  const [holdTime, setHoldTime] = useState(0);
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(0);
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getMenuParams = (menu: string) => Object.keys(PARAM_CONFIG).filter(k => PARAM_CONFIG[k as keyof typeof PARAM_CONFIG].menu === menu);

  // Efecto de parpadeo
  useEffect(() => {
    if (mode === 'wizard' || mode === 'setpoint' || menuLevel === 3) {
      blinkIntervalRef.current = setInterval(() => setBlinkState(b => !b), 400);
    } else {
      setBlinkState(false);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    }
    return () => { if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current); };
  }, [mode, menuLevel]);

  // Actualizar display y LEDs
  useEffect(() => {
    if (mode === 'wizard') {
      setDisplayText('InI' + wizardApp);
      setLeds({ eco: false, prg: false, fastFreeze: false, standby: false, fan: false, cool: false, aux: false, def: false, res: false });
      return;
    }
    
    if (standby) {
      setDisplayText('    ');
      setLeds({ eco: false, prg: false, fastFreeze: false, standby: true, fan: false, cool: false, aux: false, def: false, res: false });
      return;
    }
    
    if (mode === 'normal') {
      setDisplayText(String(params.SP));
      setLeds(l => ({ 
        ...l, 
        prg: false, 
        fan: true, 
        cool: params.P0 === 0, 
        res: params.P0 === 1,
        fastFreeze: fastFreeze,
        def: defrostActive,
        standby: false 
      }));
    } else if (mode === 'setpoint') {
      setDisplayText(String(editValue));
    } else if (mode === 'programming') {
      setLeds(l => ({ ...l, prg: true }));
      if (menuLevel === 1) setDisplayText(MENUS[currentMenu]);
      else if (menuLevel === 2) {
        const p = getMenuParams(MENUS[currentMenu]);
        setDisplayText(p[currentParam] || 'EP');
      } else if (menuLevel === 3) {
        setDisplayText(String(editValue));
      }
    }
  }, [mode, menuLevel, currentMenu, currentParam, editValue, params.SP, params.P0, standby, fastFreeze, defrostActive, wizardApp]);

  useEffect(() => {
    return () => {
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, []);

  const applyWizardConfig = (appNum: number) => {
    const config = WIZARD_APPS[appNum as keyof typeof WIZARD_APPS];
    if (config) {
      setParams(p => ({
        ...p,
        SP: config.SP,
        d0: config.d0,
        d1: config.d1,
        F0: config.F0,
        F3: config.F3,
        P0: config.P0
      }));
    }
  };

  const handleButtonDown = (button: string) => {
    if (standby && button !== 'down') return;
    
    setActiveButton(button);
    startTimeRef.current = Date.now();
    setHoldTime(0);
    
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const seconds = Math.floor(elapsed / 1000);
      setHoldTime(seconds);
      
      if (button === 'esc' && mode === 'normal' && elapsed >= 5000) {
        setFastFreeze(f => !f);
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setActiveButton(null);
        startTimeRef.current = 0;
      }

      if (button === 'up' && mode === 'normal' && elapsed >= 5000) {
        setDefrostActive(d => !d);
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setActiveButton(null);
        startTimeRef.current = 0;
      }

      if (button === 'down' && mode === 'normal' && !standby && elapsed >= 5000) {
        setStandby(true);
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setActiveButton(null);
        startTimeRef.current = 0;
      }

      if (button === 'down' && standby && elapsed >= 2000) {
        setStandby(false);
        if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
        setActiveButton(null);
        startTimeRef.current = 0;
      }
    }, 100);
  };

  const handleButtonUp = (button: string) => {
    const elapsed = Date.now() - startTimeRef.current;
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    setHoldTime(0);
    setActiveButton(null);
    
    if (startTimeRef.current === 0) return;
    startTimeRef.current = 0;
    
    if (standby) return;

    // Modo WIZARD
    if (mode === 'wizard') {
      if (button === 'up') {
        setWizardApp(w => w < 8 ? w + 1 : 1);
      } else if (button === 'down') {
        setWizardApp(w => w > 1 ? w - 1 : 8);
      } else if (button === 'set') {
        applyWizardConfig(wizardApp);
        setMode('normal');
      }
      return;
    }

    if (button === 'set') {
      if (elapsed >= 10000 && mode === 'normal') {
        setMode('programming');
        setMenuLevel(1);
        setCurrentMenu(0);
      } else if (elapsed >= 5000 && elapsed < 10000 && mode === 'normal') {
        setEditValue(params.SP);
        setMode('setpoint');
      } else if (elapsed < 5000) {
        if (mode === 'setpoint') {
          const minSP = Math.max(PARAM_CONFIG.SP.min, params.C3);
          const maxSP = Math.min(PARAM_CONFIG.SP.max, params.C2);
          const finalValue = Math.max(minSP, Math.min(maxSP, editValue));
          setParams(p => ({ ...p, SP: finalValue }));
          setMode('normal');
        } else if (mode === 'programming') {
          if (menuLevel === 1) {
            setMenuLevel(2);
            setCurrentParam(0);
          } else if (menuLevel === 2) {
            const menuParams = getMenuParams(MENUS[currentMenu]);
            const paramKey = menuParams[currentParam];
            if (paramKey === 'InI') {
              // Entrar en modo wizard
              setMode('wizard');
              setWizardApp(1);
            } else if (paramKey) {
              setEditValue(params[paramKey]);
              setMenuLevel(3);
            }
          } else if (menuLevel === 3) {
            const menuParams = getMenuParams(MENUS[currentMenu]);
            const paramKey = menuParams[currentParam];
            if (paramKey) {
              setParams(p => ({ ...p, [paramKey]: editValue }));
            }
            setMenuLevel(2);
          }
        }
      }
    } else if (button === 'esc' && elapsed < 5000) {
      if (mode === 'setpoint') {
        setMode('normal');
      } else if (mode === 'programming') {
        if (menuLevel === 3) setMenuLevel(2);
        else if (menuLevel === 2) setMenuLevel(1);
        else {
          setMode('normal');
          setMenuLevel(0);
        }
      }
    } else if (button === 'up' && elapsed < 5000) {
      handleUp();
    } else if (button === 'down' && elapsed < 5000) {
      handleDown();
    }
  };

  const handleUp = () => {
    if (mode === 'setpoint') {
      const max = Math.min(PARAM_CONFIG.SP.max, params.C2);
      setEditValue(v => Math.min(max, v + 1));
    } else if (mode === 'programming') {
      if (menuLevel === 1) setCurrentMenu(m => (m + 1) % MENUS.length);
      else if (menuLevel === 2) {
        const menuParams = getMenuParams(MENUS[currentMenu]);
        setCurrentParam(p => (p + 1) % menuParams.length);
      } else if (menuLevel === 3) {
        const menuParams = getMenuParams(MENUS[currentMenu]);
        const paramKey = menuParams[currentParam];
        if (paramKey) {
          const cfg = PARAM_CONFIG[paramKey as keyof typeof PARAM_CONFIG];
          const step = ('step' in cfg ? cfg.step : 1) || 1;
          setEditValue(v => Math.min(cfg.max, Math.round((v + step) * 10) / 10));
        }
      }
    }
  };

  const handleDown = () => {
    if (mode === 'setpoint') {
      const min = Math.max(PARAM_CONFIG.SP.min, params.C3);
      setEditValue(v => Math.max(min, v - 1));
    } else if (mode === 'programming') {
      if (menuLevel === 1) setCurrentMenu(m => (m - 1 + MENUS.length) % MENUS.length);
      else if (menuLevel === 2) {
        const menuParams = getMenuParams(MENUS[currentMenu]);
        setCurrentParam(p => (p - 1 + menuParams.length) % menuParams.length);
      } else if (menuLevel === 3) {
        const menuParams = getMenuParams(MENUS[currentMenu]);
        const paramKey = menuParams[currentParam];
        if (paramKey) {
          const cfg = PARAM_CONFIG[paramKey as keyof typeof PARAM_CONFIG];
          const step = ('step' in cfg ? cfg.step : 1) || 1;
          setEditValue(v => Math.max(cfg.min, Math.round((v - step) * 10) / 10));
        }
      }
    }
  };

  const calculateScore = () => {
    if (!selectedCase) return { score: 0, total: 0, details: [], percentage: 0 };
    const correct = CASES[selectedCase as keyof typeof CASES].correct;
    const details: ResultDetail[] = [];
    let score = 0;
    Object.keys(correct).forEach(param => {
      const isCorrect = params[param] === (correct as any)[param];
      if (isCorrect) score++;
      details.push({ param, expected: (correct as any)[param], actual: params[param], correct: isCorrect, label: (EXERCISE_LABELS as any)[param] });
    });
    return { score, total: Object.keys(correct).length, details, percentage: Math.round((score / Object.keys(correct).length) * 100) };
  };

  const resetSimulator = () => {
    const init: Record<string, number> = {};
    Object.keys(PARAM_CONFIG).forEach(k => init[k] = PARAM_CONFIG[k as keyof typeof PARAM_CONFIG].def);
    setParams(init);
    setMode('normal');
    setWizardApp(1);
    setMenuLevel(0);
    setShowResults(false);
    setStandby(false);
    setFastFreeze(false);
    setDefrostActive(false);
  };

  // Pantalla de selección
  if (!selectedCase) {
    return (
      <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#1e293b', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <span style={{ background: '#2563eb', color: 'white', padding: '4px 12px', borderRadius: '4px', fontWeight: 'bold' }}>AKO</span>
          </div>
          <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '24px', fontSize: '20px' }}>Simulador Termostato AKO-D14xxx</h1>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#9ca3af', fontSize: '14px', display: 'block', marginBottom: '4px' }}>Nombre del alumno:</label>
            <input type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Introduce tu nombre" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #374151', background: '#374151', color: 'white', boxSizing: 'border-box' }} />
          </div>
          <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '16px' }}>Selecciona un caso:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {Object.keys(CASES).map(c => (
              <button key={c} onClick={() => setSelectedCase(c)} style={{ background: '#374151', color: 'white', padding: '16px 8px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{c}</div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{CASES[c as keyof typeof CASES].refrigerant}</div>
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => window.open('/manual.pdf', '_blank')} style={{ flex: 1, background: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              📖 Manual AKO-D14xxx
            </button>
            <button onClick={() => window.open('/ejercicio.pdf', '_blank')} style={{ flex: 1, background: '#16a34a', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              📝 Ejercicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  const results = calculateScore();
  const caseData = CASES[selectedCase as keyof typeof CASES];
  const currentParamKey = mode === 'programming' && menuLevel >= 2 ? getMenuParams(MENUS[currentMenu])[currentParam] : null;
  const currentParamDesc = currentParamKey ? PARAM_CONFIG[currentParamKey as keyof typeof PARAM_CONFIG]?.desc : '';

  const getSetIndicator = () => {
    if (activeButton !== 'set' || mode !== 'normal') return null;
    if (holdTime >= 10) return { text: `⏱ ${holdTime}s → PROGRAMACIÓN`, color: '#22c55e' };
    if (holdTime >= 5) return { text: `⏱ ${holdTime}s → SET POINT`, color: '#eab308' };
    if (holdTime > 0) return { text: `⏱ ${holdTime}s`, color: '#6b7280' };
    return null;
  };

  const setIndicator = getSetIndicator();

  // Pantalla de resultados
  if (showResultsScreen) {
    return <ResultsScreen studentName={studentName} selectedCase={selectedCase} caseData={caseData} results={results} onClose={() => setShowResultsScreen(false)} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '12px' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div>
            <span style={{ color: 'white', fontWeight: 'bold' }}>Caso {selectedCase}</span>
            <span style={{ color: '#9ca3af', marginLeft: '8px', fontSize: '14px' }}>({caseData.refrigerant})</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => window.open('/manual.pdf', '_blank')} style={{ background: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              📖 Manual
            </button>
            <button onClick={() => { setSelectedCase(null); resetSimulator(); }} style={{ background: '#374151', color: 'white', padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Cambiar</button>
          </div>
        </div>

        {/* Info del caso */}
        <div style={{ background: 'rgba(30,41,59,0.7)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', fontSize: '12px' }}>
            <div><span style={{ color: '#9ca3af' }}>Refrigerante</span><br/><span style={{ color: 'white', fontWeight: 'bold' }}>{caseData.refrigerant}</span></div>
            <div><span style={{ color: '#9ca3af' }}>Tª Recinto</span><br/><span style={{ color: 'white', fontWeight: 'bold' }}>{caseData.tRoom}°C</span></div>
            <div><span style={{ color: '#9ca3af' }}>Tª Evaporación</span><br/><span style={{ color: 'white', fontWeight: 'bold' }}>{caseData.tEvap}°C</span></div>
          </div>
        </div>

        {/* TERMOSTATO AKO */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div style={{ background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)', borderRadius: '12px', padding: '14px', boxShadow: '0 10px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)', border: '1px solid #333', width: '360px' }}>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              
              {/* Panel izquierdo */}
              <div style={{ background: '#0a0a0a', borderRadius: '8px', padding: '10px', flex: 1 }}>
                
                {/* LEDs superiores */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: leds.eco ? '#22c55e' : '#1a1a1a', boxShadow: leds.eco ? '0 0 6px #22c55e' : 'none' }} />
                      <span style={{ fontSize: '8px', color: '#666' }}>ECO</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: leds.prg ? '#eab308' : '#1a1a1a', boxShadow: leds.prg ? '0 0 6px #eab308' : 'none' }} />
                      <span style={{ fontSize: '8px', color: '#666' }}>PRG</span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: leds.fan ? '#60a5fa' : '#333' }}>❄</span>
                      <span style={{ fontSize: '7px', color: '#666' }}>FAN</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: leds.cool ? '#22d3ee' : '#333' }}>❄</span>
                      <span style={{ fontSize: '7px', color: '#666' }}>COOL</span>
                    </div>
                  </div>
                </div>

                {/* Display */}
                <Display text={displayText} blink={blinkState && (mode === 'wizard' || mode === 'setpoint' || menuLevel === 3)} />

                {/* LEDs inferiores */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: leds.fastFreeze ? '#3b82f6' : '#1a1a1a', boxShadow: leds.fastFreeze ? '0 0 4px #3b82f6' : 'none' }} />
                      <span style={{ fontSize: '7px', color: '#666' }}>❄❄</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: leds.standby ? '#f59e0b' : '#1a1a1a', boxShadow: leds.standby ? '0 0 4px #f59e0b' : 'none' }} />
                      <span style={{ fontSize: '7px', color: '#666' }}>⏻</span>
                    </div>
                  </div>
                  <span style={{ background: '#1e40af', color: 'white', padding: '1px 6px', borderRadius: '2px', fontSize: '8px', fontWeight: 'bold' }}>AKO</span>
                </div>
              </div>

              {/* Panel derecho */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                
                {/* LED AUX */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', color: leds.aux ? '#f97316' : '#333' }}>☀</span>
                  <span style={{ fontSize: '8px', color: '#666', background: '#222', padding: '1px 4px', borderRadius: '2px' }}>AUX</span>
                </div>

                {/* Botones 2x2 */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '5px' }}>
                  {/* ESC */}
                  <button
                    onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); handleButtonDown('esc'); }}
                    onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('esc'); }}
                    onPointerCancel={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('esc'); }}
                    style={{ width: '46px', height: '46px', background: activeButton === 'esc' ? '#555' : 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transform: activeButton === 'esc' ? 'scale(0.95)' : 'scale(1)', touchAction: 'none', userSelect: 'none' }}>
                    <span style={{ color: '#fff', fontSize: '9px', fontWeight: 'bold', pointerEvents: 'none' }}>ESC</span>
                    <span style={{ color: '#888', fontSize: '8px', pointerEvents: 'none' }}>%</span>
                  </button>
                  
                  {/* UP */}
                  <button
                    onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); handleButtonDown('up'); }}
                    onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('up'); }}
                    onPointerCancel={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('up'); }}
                    style={{ width: '46px', height: '46px', background: activeButton === 'up' ? '#555' : 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transform: activeButton === 'up' ? 'scale(0.95)' : 'scale(1)', touchAction: 'none', userSelect: 'none' }}>
                    <span style={{ color: '#fff', fontSize: '14px', pointerEvents: 'none' }}>▲</span>
                    <span style={{ color: '#888', fontSize: '8px', pointerEvents: 'none' }}>H</span>
                  </button>
                  
                  {/* SET */}
                  <button
                    onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); handleButtonDown('set'); }}
                    onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('set'); }}
                    onPointerCancel={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('set'); }}
                    style={{ width: '46px', height: '46px', background: activeButton === 'set' ? '#555' : 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transform: activeButton === 'set' ? 'scale(0.95)' : 'scale(1)', touchAction: 'none', userSelect: 'none' }}>
                    <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', pointerEvents: 'none' }}>SET</span>
                  </button>
                  
                  {/* DOWN */}
                  <button
                    onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); handleButtonDown('down'); }}
                    onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('down'); }}
                    onPointerCancel={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); handleButtonUp('down'); }}
                    style={{ width: '46px', height: '46px', background: activeButton === 'down' ? '#555' : 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 100%)', border: '1px solid #555', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', transform: activeButton === 'down' ? 'scale(0.95)' : 'scale(1)', touchAction: 'none', userSelect: 'none' }}>
                    <span style={{ color: '#fff', fontSize: '14px', pointerEvents: 'none' }}>▼</span>
                    <span style={{ color: '#888', fontSize: '8px', pointerEvents: 'none' }}>⏻</span>
                  </button>
                </div>

                {/* LEDs DEF y RES */}
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: leds.def ? '#ef4444' : '#1a1a1a', boxShadow: leds.def ? '0 0 4px #ef4444' : 'none' }} />
                    <span style={{ fontSize: '7px', color: '#666' }}>DEF</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: leds.res ? '#a855f7' : '#1a1a1a', boxShadow: leds.res ? '0 0 4px #a855f7' : 'none' }} />
                    <span style={{ fontSize: '7px', color: '#666' }}>RES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de tiempo SET */}
        {setIndicator && (
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ background: setIndicator.color, color: 'white', padding: '6px 16px', borderRadius: '20px', display: 'inline-block', fontSize: '13px', fontWeight: 'bold' }}>
              {setIndicator.text}
            </div>
          </div>
        )}

        {/* Estado actual */}
        <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '11px' }}>
          {mode === 'wizard' && (
            <div style={{ background: 'rgba(37,99,235,0.3)', padding: '8px', borderRadius: '8px' }}>
              <span style={{ color: '#93c5fd', fontWeight: 'bold' }}>🔧 MODO WIZARD - Selecciona aplicación</span><br/>
              <span style={{ color: '#60a5fa' }}>{wizardApp}: {WIZARD_APPS[wizardApp as keyof typeof WIZARD_APPS].name}</span><br/>
              <span style={{ color: '#9ca3af', fontSize: '10px' }}>▲▼ cambiar | SET confirmar</span>
            </div>
          )}
          {standby && <span style={{ color: '#f59e0b' }}>🔴 STAND-BY (▼ 2s para salir)</span>}
          {!standby && mode === 'normal' && fastFreeze && <span style={{ color: '#3b82f6' }}>❄❄ FAST FREEZING activo</span>}
          {!standby && mode === 'normal' && defrostActive && <span style={{ color: '#ef4444' }}>🔥 DESESCARCHE activo</span>}
          {!standby && mode === 'setpoint' && <span style={{ color: '#eab308' }}>Ajustando Set Point (▲▼ cambiar, SET confirmar)</span>}
          {!standby && mode === 'programming' && menuLevel === 1 && <span style={{ color: '#22c55e' }}>Menú: {MENUS[currentMenu]} (▲▼ cambiar, SET entrar, ESC salir)</span>}
          {!standby && mode === 'programming' && menuLevel === 2 && <span style={{ color: '#22c55e' }}>Parámetro: {currentParamKey} (▲▼ cambiar, SET editar, ESC volver)</span>}
          {!standby && mode === 'programming' && menuLevel === 3 && <span style={{ color: '#22c55e' }}>Editando valor (▲▼ cambiar, SET guardar, ESC cancelar)</span>}
        </div>

        {/* Descripción del parámetro */}
        {currentParamDesc && (
          <div style={{ background: 'rgba(37,99,235,0.2)', borderRadius: '6px', padding: '6px 10px', marginBottom: '8px', textAlign: 'center' }}>
            <span style={{ color: '#93c5fd', fontSize: '11px' }}>{currentParamKey}: {currentParamDesc}</span>
          </div>
        )}

        {/* Panel de parámetros del ejercicio */}
        <div style={{ background: 'rgba(30,41,59,0.7)', borderRadius: '8px', padding: '10px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ color: 'white', fontSize: '13px', fontWeight: 'bold' }}>Parámetros del ejercicio</span>
            <button onClick={resetSimulator} style={{ background: '#dc2626', color: 'white', padding: '3px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '10px' }}>Reset</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4px', fontSize: '11px' }}>
            {Object.keys(CASES[selectedCase as keyof typeof CASES].correct).map(k => (
              <div key={k} style={{ background: 'rgba(55,65,81,0.5)', borderRadius: '4px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#d1d5db' }}>{(EXERCISE_LABELS as any)[k]}</span>
                <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '16px', fontWeight: 'bold', minWidth: '40px', textAlign: 'right' }}>{params[k]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
          <button onClick={() => setShowResults(!showResults)} style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
            {showResults ? 'Ocultar' : 'Evaluar'}
          </button>
          {showResults && (
            <button onClick={() => setShowResultsScreen(true)} style={{ background: '#16a34a', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>
              📄 Ver informe
            </button>
          )}
        </div>

        {/* Resultados */}
        {showResults && (
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '14px' }}>
            <div style={{ textAlign: 'center', marginBottom: '12px' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'white' }}>{results.percentage}%</div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>{results.score} de {results.total} correctos</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: results.percentage >= 80 ? '#22c55e' : results.percentage >= 50 ? '#eab308' : '#ef4444' }}>
                {results.percentage >= 80 ? '¡Excelente!' : results.percentage >= 50 ? 'Necesita mejorar' : 'Insuficiente'}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '5px', fontSize: '11px' }}>
              {results.details.map(d => (
                <div key={d.param} style={{ padding: '8px', borderRadius: '6px', background: d.correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#d1d5db', fontWeight: 'bold' }}>{d.label}</span>
                    <span style={{ color: d.correct ? '#22c55e' : '#ef4444', fontSize: '14px' }}>{d.correct ? '✓' : '✗'}</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: '10px', marginTop: '2px' }}>
                    Esperado: <span style={{ color: 'white' }}>{d.expected}</span> | Tuyo: <span style={{ color: d.correct ? '#22c55e' : '#ef4444' }}>{d.actual}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
