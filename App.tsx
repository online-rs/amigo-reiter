
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CardData, CardSide, FONT_OPTIONS } from './types';
import { Download, Type, Palette, RotateCcw, Image as ImageIcon } from 'lucide-react';

const LOGO_URL = 'https://rvfizabtjifunjlwoihf.supabase.co/storage/v1/object/public/fotos_amigo_secrecto/logistica-logo.png';

const App: React.FC = () => {
  const [data, setData] = useState<CardData>({
    de: '',
    para: '',
    mensagem: 'Obrigado por ser essa pessoa incrível e estar presente em todos os momentos! Sua amizade é fundamental para o sucesso da nossa equipe.',
    corFonte: '#163e12',
    tipoFonte: 'Montserrat, sans-serif',
    tamanhoFonte: 42,
  });

  // Canvas ocultos para download de alta qualidade
  const canvasFrontRef = useRef<HTMLCanvasElement>(null);
  const canvasBackRef = useRef<HTMLCanvasElement>(null);
  
  // Canvas de visualização (Mockups)
  const mockupFrontRef = useRef<HTMLCanvasElement>(null);
  const mockupBackRef = useRef<HTMLCanvasElement>(null);
  
  const logoImageRef = useRef<HTMLImageElement | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData(prev => ({
      ...prev,
      [name]: name === 'tamanhoFonte' ? Number(value) : value
    }));
  }, []);

  // Carregar o logo e disparar a renderização inicial
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = LOGO_URL;
    img.onload = () => {
      logoImageRef.current = img;
      renderAll();
    };
  }, []);

  const drawTemplateBase = useCallback((ctx: CanvasRenderingContext2D, side: CardSide) => {
    const W = 1080;
    const H = 1080;

    if (side === 'frente') {
      // Fundo Base
      ctx.fillStyle = '#fdfdfd';
      ctx.fillRect(0, 0, W, H);

      // Elementos Gráficos de Fundo
      ctx.fillStyle = '#f3f3f3';
      ctx.beginPath(); ctx.moveTo(0, 400); ctx.lineTo(W, 0); ctx.lineTo(W, 300); ctx.lineTo(0, 700); ctx.fill();
      ctx.beginPath(); ctx.moveTo(0, 800); ctx.lineTo(W, 400); ctx.lineTo(W, 1080); ctx.lineTo(500, 1080); ctx.fill();

      // LOGO REITER LOG (POSICIONADO ACIMA DO TÍTULO)
      if (logoImageRef.current) {
        const logo = logoImageRef.current;
        const targetWidth = 380;
        const targetHeight = (logo.height / logo.width) * targetWidth;
        const logoX = (W - targetWidth) / 2;
        const logoY = 120; // Ajustado para dar respiro ao topo
        ctx.drawImage(logo, logoX, logoY, targetWidth, targetHeight);
      }

      // TÍTULO "DIA DA AMIZADE" (Abaixo do logo)
      ctx.fillStyle = '#4a7c44';
      ctx.textAlign = 'center';
      ctx.font = '900 86px Montserrat';
      ctx.fillText('DIA DA AMIZADE.', W / 2, 340); // Posicionado estrategicamente abaixo do logo

      ctx.fillStyle = '#666666';
      ctx.font = '400 42px Montserrat';
      ctx.fillText('14 de Fevereiro', W / 2, 410);

      // Campos de Texto Dinâmicos
      ctx.fillStyle = '#222222';
      ctx.textAlign = 'left';
      ctx.font = '700 48px Montserrat';
      ctx.fillText('DE:', 160, 530);
      ctx.fillText('PARA:', 160, 640);

      // Rodapé Fixo
      ctx.fillStyle = '#4a7c44';
      ctx.textAlign = 'center';
      ctx.font = '900 86px Montserrat';
      ctx.fillText('OBRIGADO', W / 2, 820);

      ctx.fillStyle = '#222222';
      ctx.font = '700 36px Montserrat';
      ctx.letterSpacing = '4px';
      ctx.fillText('POR TORNAR MEUS DIAS', W / 2, 890);
      ctx.fillText('MAIS FELIZES.', W / 2, 945);
    } else {
      // Lado Verso
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f8f8f8';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W, 120); ctx.lineTo(W, 0); ctx.fill();
      
      // Detalhe suave do logo no verso como marca d'água
      if (logoImageRef.current) {
        ctx.save();
        ctx.globalAlpha = 0.05;
        const logo = logoImageRef.current;
        const w = 400;
        const h = (logo.height / logo.width) * w;
        ctx.drawImage(logo, (W - w) / 2, (H - h) / 2, w, h);
        ctx.restore();
      }
    }
  }, []);

  const renderCard = useCallback((canvas: HTMLCanvasElement | null, side: CardSide) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 1080, 1080);
    drawTemplateBase(ctx, side);

    ctx.fillStyle = data.corFonte;
    ctx.font = `${data.tamanhoFonte}px ${data.tipoFonte}`;

    if (side === 'frente') {
      ctx.textAlign = 'left';
      ctx.fillText(data.de, 265, 530);
      ctx.fillText(data.para, 340, 640);
    } else {
      ctx.textAlign = 'center';
      const maxWidth = 800;
      const lineHeight = data.tamanhoFonte * 1.5;
      const words = data.mensagem.split(' ');
      let line = '';
      let lines = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      let startY = 540 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((l, i) => ctx.fillText(l.trim(), 540, startY + i * lineHeight));
    }
  }, [data, drawTemplateBase]);

  const renderAll = useCallback(() => {
    document.fonts.ready.then(() => {
      renderCard(canvasFrontRef.current, 'frente');
      renderCard(canvasBackRef.current, 'verso');
      renderCard(mockupFrontRef.current, 'frente');
      renderCard(mockupBackRef.current, 'verso');
    });
  }, [renderCard]);

  useEffect(() => {
    renderAll();
  }, [renderAll, data]);

  const downloadComposite = () => {
    const canvasFront = canvasFrontRef.current;
    const canvasBack = canvasBackRef.current;
    if (!canvasFront || !canvasBack) return;

    const compositeCanvas = document.createElement('canvas');
    compositeCanvas.width = 2160;
    compositeCanvas.height = 1080;
    const ctx = compositeCanvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(canvasFront, 0, 0);
    ctx.drawImage(canvasBack, 1080, 0);

    // Linha divisória fina
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(1080, 0); ctx.lineTo(1080, 1080); ctx.stroke();

    const link = document.createElement('a');
    link.download = `reiter-card-completo-${Date.now()}.png`;
    link.href = compositeCanvas.toDataURL('image/png', 1.0);
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#eef2f6]">
      {/* PAINEL DE CONTROLE */}
      <aside className="w-full lg:w-[420px] bg-white border-r border-slate-300 p-8 shadow-2xl z-30 overflow-y-auto max-h-screen">
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
          <div className="bg-[#c8102e] p-2.5 rounded-xl shadow-lg">
             <img src={LOGO_URL} alt="Reiter Log" className="w-10 brightness-0 invert" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase">Reiter Log</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Digital Card Factory</p>
          </div>
        </div>

        <div className="space-y-8">
          <section className="space-y-5">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Type size={14} className="text-red-600" /> Informações
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-700 uppercase">Remetente (De):</label>
                <input 
                  type="text" 
                  name="de"
                  placeholder="Seu nome..."
                  value={data.de}
                  onChange={handleInputChange}
                  className="w-full p-3.5 bg-white border-2 border-slate-400 rounded-xl text-black font-bold focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-700 uppercase">Destinatário (Para):</label>
                <input 
                  type="text" 
                  name="para"
                  placeholder="Nome do amigo..."
                  value={data.para}
                  onChange={handleInputChange}
                  className="w-full p-3.5 bg-white border-2 border-slate-400 rounded-xl text-black font-bold focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-700 uppercase">Mensagem Verso:</label>
                <textarea 
                  name="mensagem"
                  value={data.mensagem}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3.5 bg-white border-2 border-slate-400 rounded-xl text-black font-bold focus:border-red-600 focus:ring-2 focus:ring-red-100 transition-all outline-none resize-none"
                />
              </div>
            </div>
          </section>

          <section className="space-y-5 border-t border-slate-100 pt-6">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Palette size={14} className="text-red-600" /> Estilo
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-700">Fonte</label>
                <select 
                  name="tipoFonte"
                  value={data.tipoFonte}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-white border-2 border-slate-400 rounded-xl text-black font-bold outline-none cursor-pointer"
                >
                  {FONT_OPTIONS.map(font => <option key={font.value} value={font.value}>{font.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-700">Cor</label>
                <input 
                  type="color" 
                  name="corFonte"
                  value={data.corFonte}
                  onChange={handleInputChange}
                  className="w-full h-[52px] p-1 bg-white border-2 border-slate-400 rounded-xl cursor-pointer"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex justify-between text-[11px] font-black text-slate-700 uppercase">
                Tamanho <span>{data.tamanhoFonte}px</span>
              </label>
              <input 
                type="range" 
                name="tamanhoFonte"
                min="20" max="80"
                value={data.tamanhoFonte}
                onChange={handleInputChange}
                className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
            </div>
          </section>

          <button 
            onClick={() => setData({ ...data, de: '', para: '' })}
            className="w-full py-3.5 flex items-center justify-center gap-2 text-slate-600 hover:text-red-700 font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <RotateCcw size={14} /> Resetar Campos
          </button>
        </div>
      </aside>

      {/* ÁREA DE PREVIEW */}
      <main className="flex-1 p-4 md:p-12 flex flex-col items-center justify-center bg-slate-200">
        
        {/* Canvases de download ocultos */}
        <canvas ref={canvasFrontRef} width={1080} height={1080} className="hidden" />
        <canvas ref={canvasBackRef} width={1080} height={1080} className="hidden" />

        <div className="text-center mb-8">
          <h3 className="text-slate-500 font-black text-xs uppercase tracking-[0.4em] mb-2">Composição do Card</h3>
          <div className="h-1.5 w-16 bg-red-600 mx-auto rounded-full shadow-lg shadow-red-200"></div>
        </div>

        {/* MOCKUP 3D EM V INVERTIDO (Meio mais próximo) */}
        <div className="flex flex-col md:flex-row gap-0 md:gap-4 perspective-container py-12 scale-90 md:scale-105">
          <div className="card-mockup card-frente-tilt shadow-2xl border-[10px] border-white rounded-xl overflow-hidden relative">
              <canvas 
                ref={mockupFrontRef}
                width={1080} 
                height={1080} 
                className="w-[280px] md:w-[440px] aspect-square bg-white"
              />
              <div className="absolute top-2 left-2 bg-red-600/90 text-[8px] font-black px-2 py-0.5 rounded text-white shadow-md uppercase">Frente</div>
          </div>

          <div className="card-mockup card-verso-tilt shadow-2xl border-[10px] border-white rounded-xl overflow-hidden relative">
              <canvas 
                ref={mockupBackRef}
                width={1080} 
                height={1080} 
                className="w-[280px] md:w-[440px] aspect-square bg-white"
              />
              <div className="absolute top-2 left-2 bg-red-600/90 text-[8px] font-black px-2 py-0.5 rounded text-white shadow-md uppercase">Verso</div>
          </div>
        </div>

        {/* BOTÃO ÚNICO DE DOWNLOAD */}
        <div className="mt-16 w-full max-w-lg">
           <button 
            onClick={downloadComposite}
            className="w-full flex items-center justify-center gap-6 p-7 bg-slate-900 hover:bg-black text-white rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transition-all active:scale-[0.97] group"
          >
            <div className="bg-red-600 p-3 rounded-xl group-hover:rotate-12 transition-transform shadow-lg">
              <ImageIcon size={24} />
            </div>
            <div className="text-left flex-1">
              <span className="block font-black text-lg uppercase leading-none mb-1 tracking-tight">Baixar Card Completo</span>
              <span className="block text-[11px] text-slate-400 font-bold uppercase tracking-[0.1em]">Alta Resolução PNG (2160x1080)</span>
            </div>
            <Download size={26} className="text-red-500 group-hover:bounce" />
          </button>
          
          <p className="mt-6 text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] text-center opacity-40">
            © 2025 REITER LOG • Logística de Excelência
          </p>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-container {
          perspective: 3000px;
        }
        .card-mockup {
          transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          background: white;
          transform-style: preserve-3d;
        }
        .card-frente-tilt {
          transform: rotateY(18deg) rotateX(10deg) rotateZ(1deg);
          margin-right: -10px;
        }
        .card-verso-tilt {
          transform: rotateY(-18deg) rotateX(10deg) rotateZ(-1deg);
          margin-left: -10px;
        }
        .card-mockup:hover {
          transform: rotateY(0deg) rotateX(0deg) rotateZ(0deg) scale(1.1);
          z-index: 50;
          margin: 0 20px;
          box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .group:hover .group-hover\\:bounce {
          animation: bounce 0.6s ease infinite;
        }
        body {
          font-family: 'Montserrat', sans-serif;
        }
        input::placeholder {
          color: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default App;
