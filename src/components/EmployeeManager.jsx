import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Camera,
  Trash2,
  CheckCircle,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Eye,
  Scan,
  Zap,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { findBestMatch } from '../utils/faceComparison';

export default function EmployeeManager({ employees, onAddEmployee, onDeleteEmployee, onNavigateToScanner }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [matricula, setMatricula] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isUsingCam, setIsUsingCam] = useState(true);
  const [camError, setCamError] = useState(null);

  // Estados da Biometria Guiada (Estilo Banco / Mercado Livre)
  // 'IDLE' (aguardando o usuário clicar em Iniciar) -> 'CENTER' -> 'DISTANCE' -> 'LIVENESS' -> 'CAPTURE' -> 'DONE'
  const [bioStep, setBioStep] = useState('IDLE');
  const [bioMessage, setBioMessage] = useState('Posicione o rosto na moldura e clique no botão para iniciar');
  const [stepProgress, setStepProgress] = useState(0);
  const [isFaceCentered, setIsFaceCentered] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Reconhecimento de duplicidade / Colaborador existente
  const [existingMatch, setExistingMatch] = useState(null);
  const [matchScore, setMatchScore] = useState(null);
  const [isUpdatingExisting, setIsUpdatingExisting] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastFrameDataRef = useRef(null);
  const stepTimerRef = useRef(null);

  // Efeitos sonoros biométricos (Web Audio API)
  const playBiometricSound = (type = 'step') => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (type === 'step') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12); // A5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'success') {
        // Acorde maior de validação (C5 - E5 - G5)
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.08);
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.08 + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + i * 0.08);
          osc.stop(audioCtx.currentTime + i * 0.08 + 0.35);
        });
      }
    } catch {
      // AudioContext não disponível
    }
  };

  const startModalCamera = async () => {
    setCamError(null);
    setBioStep('IDLE');
    setStepProgress(0);
    setBioMessage('Posicione o rosto dentro do círculo e clique em Iniciar Biometria');
    setExistingMatch(null);
    setMatchScore(null);
    setIsUpdatingExisting(false);

    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsUsingCam(true);
    } catch (err) {
      console.error('Erro ao abrir câmera:', err);
      setCamError('Câmera indisponível. Conceda a permissão no seu navegador.');
      setIsUsingCam(false);
    }
  };

  const stopModalCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (stepTimerRef.current) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Inicia o fluxo guiado quando o usuário aperta o botão
  const handleStartGuidedBiometrics = () => {
    setBioStep('CENTER');
    setStepProgress(25);
    setBioMessage('1. Centralize seu rosto no centro da moldura');
    playBiometricSound('step');
  };

  // Captura o crop quadrado facial central padronizado (400x400)
  const takeSelfieSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');

    const v = videoRef.current;
    const minDim = Math.min(v.videoWidth || 400, v.videoHeight || 400);
    const startX = ((v.videoWidth || 400) - minDim) / 2;
    const startY = ((v.videoHeight || 400) - minDim) / 2;

    // Dispara animação de flash de câmera
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 250);

    ctx.drawImage(v, startX, startY, minDim, minDim, 0, 0, 400, 400);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhotoUrl(dataUrl);
    setBioStep('DONE');
    playBiometricSound('success');
    stopModalCamera();
    setIsUsingCam(false);

    // Reconhecimento anti-duplicidade: Verifica se este rosto já está cadastrado no sistema!
    if (employees && employees.length > 0) {
      const matchResult = await findBestMatch(dataUrl, employees, 62);
      if (matchResult.status === 'RECOGNIZED' && matchResult.match) {
        const found = matchResult.match;
        setExistingMatch(found);
        setMatchScore(matchResult.confidence);
        setIsUpdatingExisting(true);

        // Preenche automaticamente o formulário com os dados cadastrados
        setName(found.name);
        setCpf(found.cpf || '');
        setRole(found.role || 'Colaborador');
        setDepartment(found.department || 'Geral');
        setMatricula(found.matricula);
      } else {
        setExistingMatch(null);
        setMatchScore(null);
        setIsUpdatingExisting(false);
      }
    }
  };

  // Loop de Visão Computacional para Guia Biométrico
  useEffect(() => {
    if (!showModal || !isUsingCam || photoUrl) return;

    let sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 64;
    sampleCanvas.height = 64;
    let sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

    let stableFrames = 0;
    let currentStepLocal = bioStep;

    const processFrame = () => {
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        // Amostra o centro do vídeo
        sampleCtx.drawImage(v, 0, 0, 64, 64);
        const imgData = sampleCtx.getImageData(0, 0, 64, 64);
        const data = imgData.data;

        // 1. Calcula luminosidade e contraste no centro da moldura
        let centerLuma = 0;
        let centerCount = 0;
        let edgeLuma = 0;
        let edgeCount = 0;

        for (let y = 0; y < 64; y++) {
          for (let x = 0; x < 64; x++) {
            const idx = (y * 64 + x) * 4;
            const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
            const distFromCenter = Math.hypot(x - 32, y - 32);

            if (distFromCenter < 18) {
              centerLuma += luma;
              centerCount++;
            } else if (distFromCenter > 24) {
              edgeLuma += luma;
              edgeCount++;
            }
          }
        }

        const avgCenter = centerLuma / (centerCount || 1);
        const avgEdge = edgeLuma / (edgeCount || 1);
        const hasGoodSubject = avgCenter > 30 && avgCenter < 235 && Math.abs(avgCenter - avgEdge) > 4;

        setIsFaceCentered(hasGoodSubject);

        // Se o processo guiado foi iniciado pelo usuário (não está em IDLE)
        if (currentStepLocal === 'CENTER') {
          if (hasGoodSubject) {
            stableFrames++;
            if (stableFrames > 12) {
              currentStepLocal = 'DISTANCE';
              setBioStep('DISTANCE');
              setStepProgress(50);
              setBioMessage('2. Aproxime suavemente o rosto da câmera');
              playBiometricSound('step');
              stableFrames = 0;
            }
          } else {
            stableFrames = Math.max(0, stableFrames - 1);
          }
        } else if (currentStepLocal === 'DISTANCE') {
          stableFrames++;
          if (stableFrames > 22) {
            currentStepLocal = 'LIVENESS';
            setBioStep('LIVENESS');
            setStepProgress(75);
            setBioMessage('3. Vire levemente o rosto ou pisque os olhos');
            playBiometricSound('step');
            stableFrames = 0;
          }
        } else if (currentStepLocal === 'LIVENESS') {
          let delta = 0;
          if (lastFrameDataRef.current) {
            for (let i = 0; i < data.length; i += 8) {
              delta += Math.abs(data[i] - lastFrameDataRef.current[i]);
            }
          }
          lastFrameDataRef.current = new Uint8ClampedArray(data);

          if (delta > 1200 || stableFrames > 22) {
            currentStepLocal = 'CAPTURE';
            setBioStep('CAPTURE');
            setStepProgress(95);
            setBioMessage('Validando biometria... Mantenha a posição');
            playBiometricSound('step');

            stepTimerRef.current = setTimeout(() => {
              takeSelfieSnapshot();
            }, 900);
          } else {
            stableFrames++;
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(processFrame);
    };

    animFrameRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [showModal, isUsingCam, photoUrl, bioStep]);

  useEffect(() => {
    if (showModal && isUsingCam) {
      startModalCamera();
    } else {
      stopModalCamera();
    }
    return () => {
      stopModalCamera();
    };
  }, [showModal, isUsingCam]);

  const handleOpenModal = () => {
    setName('');
    setCpf('');
    setRole('');
    setDepartment('');
    setMatricula(`COLAB-${Math.floor(1000 + Math.random() * 9000)}`);
    setPhotoUrl('');
    setBioStep('IDLE');
    setStepProgress(0);
    setExistingMatch(null);
    setMatchScore(null);
    setIsUpdatingExisting(false);
    setIsUsingCam(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !matricula.trim()) {
      alert('Por favor, preencha o Nome e a Matrícula do colaborador.');
      return;
    }

    if (!photoUrl) {
      alert('Por favor, realize a captura da biometria facial antes de salvar.');
      return;
    }

    const newEmp = {
      id: existingMatch && isUpdatingExisting ? existingMatch.id : `emp-${Date.now()}`,
      name: name.trim(),
      cpf: cpf.trim() || '000.000.000-00',
      role: role.trim() || 'Colaborador',
      department: department.trim() || 'Geral',
      matricula: matricula.trim(),
      photo: photoUrl,
      registeredAt: new Date().toISOString(),
      biometricStatus: 'VALIDATED',
    };

    onAddEmployee(newEmp);
    setShowModal(false);
    stopModalCamera();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header & Action */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-violet-100 text-violet-800 rounded-xl">
              <Users className="w-5 h-5 text-violet-600" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">Colaboradores Cadastrados</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Total de colaboradores na base: <strong className="text-slate-800">{employees.length}</strong>. Apenas
            pessoas cadastradas com biometria facial serão identificadas na chamada das turmas.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-violet-600/30"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Colaborador</span>
        </button>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-base">Nenhum colaborador cadastrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Cadastre um colaborador utilizando a câmera guiada para que ele seja identificado na chamada facial das turmas.
            </p>
            <button
              onClick={handleOpenModal}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md shadow-violet-600/30"
            >
              Cadastrar Agora com Biometria
            </button>
          </div>
        ) : (
          employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={emp.photo}
                    alt={emp.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-violet-500/40 shadow-xs"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{emp.name}</h3>
                  <p className="text-xs text-violet-700 font-semibold">{emp.role || 'Colaborador'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Matrícula: <strong className="text-slate-700">{emp.matricula}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400">Setor: {emp.department || 'Geral'}</p>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Excluir colaborador ${emp.name}?`)) {
                      onDeleteEmployee(emp.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Excluir Colaborador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Biometria Ativa
                </span>
                <span>CPF: {emp.cpf}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Cadastro com Biometria Guiada Inteligente (Estilo Banco / Mercado Livre) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-violet-100 text-violet-700 rounded-xl">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Cadastro de Biometria Facial</h2>
                  <p className="text-[11px] text-slate-500">Validação e verificação com prova de vida</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  stopModalCamera();
                }}
                className="text-slate-400 hover:text-slate-600 p-1 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {/* Painel da Câmera Biométrica Interativa */}
              <div className="bg-[#120e26] rounded-2xl p-3 border border-violet-900/40 relative overflow-hidden shadow-inner">
                {/* Efeito Flash ao Capturar */}
                {shutterFlash && (
                  <div className="absolute inset-0 bg-white z-30 transition-opacity duration-200 pointer-events-none" />
                )}

                {isUsingCam ? (
                  <div>
                    <div className="relative aspect-square max-w-[280px] mx-auto bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center border-2 border-violet-800/40">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror scale-x-[-1]"
                      />

                      {/* HUD Biométrico Interativo (Círculo de Retículo e Progresso) */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-3">
                        {/* Top Step Pill */}
                        <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-violet-500/40 text-[11px] font-bold text-violet-300">
                          {bioStep === 'IDLE' && <span>Câmera Pronta • Enquadre seu rosto</span>}
                          {bioStep === 'CENTER' && <span>Etapa 1/3 • Enquadramento</span>}
                          {bioStep === 'DISTANCE' && <span>Etapa 2/3 • Distância Ideal</span>}
                          {bioStep === 'LIVENESS' && <span>Etapa 3/3 • Prova de Vida</span>}
                          {bioStep === 'CAPTURE' && <span className="text-emerald-400">Validando Biometria...</span>}
                        </div>

                        {/* Moldura Circular com Feedback Visual */}
                        <div className="relative w-44 h-44 flex items-center justify-center">
                          {/* SVG Progress Ring */}
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle
                              cx="88"
                              cy="88"
                              r="80"
                              stroke="rgba(139, 92, 246, 0.2)"
                              strokeWidth="4"
                              fill="transparent"
                            />
                            <circle
                              cx="88"
                              cy="88"
                              r="80"
                              stroke={isFaceCentered ? '#10b981' : '#8b5cf6'}
                              strokeWidth="4"
                              strokeDasharray={502}
                              strokeDashoffset={502 - (502 * stepProgress) / 100}
                              strokeLinecap="round"
                              fill="transparent"
                              className="transition-all duration-300"
                            />
                          </svg>

                          {/* Moldura Central */}
                          <div
                            className={`w-36 h-44 rounded-[40px] border-2 transition-all duration-300 flex items-center justify-center ${
                              isFaceCentered
                                ? 'border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                                : 'border-dashed border-violet-400/80 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                            }`}
                          >
                            {/* Laser Scanning Line */}
                            <div className="absolute left-6 right-6 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_8px_#a855f7] animate-pulse" />
                          </div>
                        </div>

                        {/* Mensagem Inferior Dinâmica */}
                        <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-violet-500/30 text-center max-w-[90%]">
                          <p
                            className={`text-[11px] font-semibold transition-colors ${
                              isFaceCentered ? 'text-emerald-300' : 'text-violet-200'
                            }`}
                          >
                            {bioMessage}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação na Câmera */}
                    <div className="mt-3 space-y-2">
                      {bioStep === 'IDLE' ? (
                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          <button
                            type="button"
                            onClick={handleStartGuidedBiometrics}
                            className="flex-1 w-full py-2.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
                          >
                            <Sparkles className="w-4 h-4 text-violet-200" />
                            <span>Iniciar Captura Biométrica</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => takeSelfieSnapshot()}
                            className="py-2.5 px-3 bg-violet-950/60 hover:bg-violet-900 text-violet-300 hover:text-white rounded-xl text-xs font-semibold border border-violet-700/50 transition-all shrink-0"
                          >
                            Captura Direta
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 px-1">
                          <p className="text-[10px] text-violet-300/80 animate-pulse">Siga as instruções na moldura...</p>
                          <button
                            type="button"
                            onClick={() => takeSelfieSnapshot()}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/30 transition-all shrink-0"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Capturar Agora</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="relative inline-block">
                      <img
                        src={photoUrl}
                        alt="Foto Capturada"
                        className="w-36 h-36 rounded-2xl object-cover border-2 border-emerald-500 shadow-md mx-auto mb-2"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Alerta de Rosto Já Reconhecido (Anti-Duplicidade) */}
                    {existingMatch ? (
                      <div className="bg-amber-950/70 border-2 border-amber-500/80 rounded-2xl p-3 text-left max-w-sm mx-auto mb-3 shadow-lg">
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5">
                            <UserCheck className="w-5 h-5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-amber-300 text-xs">
                                Rosto Já Reconhecido no RegisON!
                              </h4>
                              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                                Match {matchScore}
                              </span>
                            </div>
                            <p className="text-[11px] text-amber-200 mt-1 leading-snug">
                              Identificamos que você é o colaborador <strong>{existingMatch.name}</strong> (Matrícula: {existingMatch.matricula}).
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <label className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isUpdatingExisting}
                                  onChange={(e) => setIsUpdatingExisting(e.target.checked)}
                                  className="rounded border-amber-400 text-amber-500 focus:ring-amber-400"
                                />
                                <span>Atualizar foto deste colaborador</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-emerald-950/60 border border-emerald-500/40 rounded-xl p-2.5 max-w-xs mx-auto mb-2">
                        <p className="text-[11px] font-bold text-emerald-300 flex items-center justify-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                          Nova Biometria Facial Validada!
                        </p>
                        <p className="text-[10px] text-emerald-200/80 mt-0.5">
                          Assinatura biométrica de 128 pontos faciais criptografada localmente.
                        </p>
                      </div>
                    )}

                    <div>
                      <button
                        type="button"
                        onClick={startModalCamera}
                        className="flex items-center gap-1.5 text-xs font-bold text-violet-300 bg-violet-900/40 hover:bg-violet-900/60 px-3 py-1.5 rounded-xl transition-all mx-auto border border-violet-700/50"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Tirar Nova Foto / Refazer</span>
                      </button>
                    </div>
                  </div>
                )}

                {camError && <p className="text-xs text-rose-400 mt-2 text-center">{camError}</p>}
              </div>

              {/* Campos do Formulário */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Robin Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Matrícula *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MAT-101"
                      value={matricula}
                      onChange={(e) => setMatricula(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Cargo / Função</label>
                    <input
                      type="text"
                      placeholder="Ex: Supervisor de Obras"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Setor / Área</label>
                    <input
                      type="text"
                      placeholder="Ex: Manutenção"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação Final */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    stopModalCamera();
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl shadow-md shadow-violet-600/30 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {existingMatch && isUpdatingExisting
                      ? 'Atualizar Foto do Colaborador'
                      : 'Salvar Colaborador & Face'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
