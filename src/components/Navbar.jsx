import React, { useState, useEffect } from 'react';
import { Camera, LayoutDashboard, FileText, Users, PlusCircle, CheckCircle2, Download, Smartphone, X, Share } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenNewTraining }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsStandalone(true);
    }

    // Capture Chrome/Android install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    // Detect iOS
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIos) {
      setShowIosModal(true);
    } else {
      // General instructions modal if browser doesn't trigger prompt directly
      alert('Para instalar o RegisON, toque no menu do seu navegador (três pontinhos no topo/canto) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
    }
  };

  const navItems = [
    { id: 'employees', label: '1. Colaboradores', icon: Users },
    { id: 'dashboard', label: '2. Treinamentos', icon: LayoutDashboard },
    { id: 'scanner', label: '3. Fazer Chamada', icon: Camera, highlight: true },
    { id: 'reports', label: '4. Relatório (PDF)', icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#161130] border-b border-violet-900/40 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Branding (RegisON) */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('employees')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-600/30 border border-violet-400/30">
                <CheckCircle2 className="w-6 h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl tracking-tight text-white">
                    Regis<span className="text-violet-400">ON</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    APP
                  </span>
                </div>
                <p className="text-[10px] text-violet-300/70 hidden sm:block">
                  Sua presença registrada em segundos
                </p>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex items-center gap-1 sm:gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? item.highlight 
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold shadow-md shadow-violet-600/30 border border-violet-400/30'
                          : 'bg-violet-950/70 text-violet-200 border border-violet-800/40'
                        : item.highlight
                          ? 'text-violet-300 hover:bg-violet-950/40'
                          : 'text-slate-300 hover:text-white hover:bg-violet-950/30'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${item.highlight && !isActive ? 'text-violet-400' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Actions: Install Button & New Training */}
            <div className="flex items-center gap-2">
              {!isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 bg-violet-900/60 hover:bg-violet-800 text-violet-200 hover:text-white border border-violet-600/40 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                  title="Instalar no celular / tela inicial"
                >
                  <Smartphone className="w-3.5 h-3.5 text-violet-400" />
                  <span className="hidden sm:inline">Baixar App</span>
                </button>
              )}

              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={onOpenNewTraining}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md shadow-violet-600/30 border border-violet-400/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Nova Turma</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* iOS Install Instruction Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1a1438] text-white border border-violet-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-base text-white">Instalar no iPhone / iPad</h3>
              </div>
              <button onClick={() => setShowIosModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs text-violet-200 space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                <span>Toque no botão <strong>Compartilhar</strong> (<Share className="w-3.5 h-3.5 inline mx-1 text-violet-400" /> na barra inferior do Safari).</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                <span>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-6 w-full py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
