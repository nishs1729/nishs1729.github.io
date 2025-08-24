(function(){
      const wrap = document.getElementById('wrap');
      const bgCanvas = document.getElementById('bgCanvas');
      const drawCanvas = document.getElementById('drawCanvas');
      const gridLayer = document.getElementById('gridLayer');
      const bgCtx = bgCanvas.getContext('2d');
      const ctx = drawCanvas.getContext('2d');

      // UI elements
      const colorEl = document.getElementById('color');
      const sizeEl = document.getElementById('size');
      const sizeVal = document.getElementById('sizeVal');
      const opacityEl = document.getElementById('opacity');
      const opacityVal = document.getElementById('opacityVal');
      const eraserEl = document.getElementById('eraser');
      const gridEl = document.getElementById('grid');
      const bgEl = document.getElementById('bg');
      const bgClearEl = document.getElementById('bgClear');
      const presetSizeEl = document.getElementById('presetSize');
      const undoEl = document.getElementById('undo');
      const redoEl = document.getElementById('redo');
      const formatEl = document.getElementById('format');
      const qualityEl = document.getElementById('quality');
      const filenameEl = document.getElementById('filename');
      const downloadEl = document.getElementById('download');
      const clearEl = document.getElementById('clear');

      // State
      let drawing = false;
      let last = null; // {x,y}
      let dpr = Math.max(1, window.devicePixelRatio || 1);
      let bgColor = null; // Always transparent
      let history = []; // stack of ImageData
      let future = []; // redo stack

      function setCanvasSize(w, h) {
        // preserve current drawing when resizing
        const prevDraw = document.createElement('canvas');
        prevDraw.width = drawCanvas.width; prevDraw.height = drawCanvas.height;
        prevDraw.getContext('2d').drawImage(drawCanvas, 0, 0);
        const prevBg = document.createElement('canvas');
        prevBg.width = bgCanvas.width; prevBg.height = bgCanvas.height;
        prevBg.getContext('2d').drawImage(bgCanvas, 0, 0);

        drawCanvas.width = Math.max(1, Math.floor(w * dpr));
        drawCanvas.height = Math.max(1, Math.floor(h * dpr));
        bgCanvas.width = drawCanvas.width;
        bgCanvas.height = drawCanvas.height;

        drawCanvas.style.width = w + 'px';
        drawCanvas.style.height = h + 'px';
        bgCanvas.style.width = w + 'px';
        bgCanvas.style.height = h + 'px';

        // redraw preserved content scaled to new size
        ctx.save(); ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,drawCanvas.width, drawCanvas.height); ctx.restore();
        bgCtx.save(); bgCtx.setTransform(1,0,0,1,0,0); bgCtx.clearRect(0,0,bgCanvas.width, bgCanvas.height); bgCtx.restore();

        // scale previous content to fit new canvas size
        ctx.drawImage(prevDraw, 0, 0, drawCanvas.width, drawCanvas.height);
        bgCtx.drawImage(prevBg, 0, 0, bgCanvas.width, bgCanvas.height);
      }

      function fitToWindow(){
        const rect = wrap.getBoundingClientRect();
        setCanvasSize(rect.width, rect.height);
      }

      function applyBg() {
        bgCtx.save();
        bgCtx.globalCompositeOperation = 'source-over';
        bgCtx.clearRect(0,0,bgCanvas.width, bgCanvas.height);
        if (bgColor) {
          bgCtx.fillStyle = bgColor;
          bgCtx.fillRect(0,0,bgCanvas.width, bgCanvas.height);
        }
        bgCtx.restore();
      }

      function pushHistory(){
        try {
          const snapshot = ctx.getImageData(0,0,drawCanvas.width, drawCanvas.height);
          history.push(snapshot);
          if (history.length > 100) history.shift();
          future.length = 0; // clear redo on new action
        } catch(e) {
          // Security or memory limits; fallback to not storing
          console.warn('History snapshot failed', e);
        }
      }

      function undo(){
        if (!history.length) return;
        const current = ctx.getImageData(0,0,drawCanvas.width, drawCanvas.height);
        future.push(current);
        const prev = history.pop();
        ctx.putImageData(prev, 0, 0);
      }
      function redo(){
        if (!future.length) return;
        const current = ctx.getImageData(0,0,drawCanvas.width, drawCanvas.height);
        history.push(current);
        const nxt = future.pop();
        ctx.putImageData(nxt, 0, 0);
      }

      function startDraw(x, y){
        drawing = true;
        last = {x, y};
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const baseColor = colorEl.value;
        const alpha = parseFloat(opacityEl.value || '1');
        ctx.strokeStyle = baseColor + Math.round(alpha * 255).toString(16).padStart(2,'0');
        ctx.lineWidth = parseFloat(sizeEl.value);
        ctx.globalCompositeOperation = eraserEl.checked ? 'destination-out' : 'source-over';
        pushHistory();
      }

      function draw(x, y){
        if (!drawing || !last) return;
        ctx.beginPath();
        ctx.moveTo(last.x, last.y);
        ctx.lineTo(x, y);
        ctx.stroke();
        last = {x, y};
      }

      function endDraw(){
        drawing = false;
        ctx.restore();
        last = null;
      }

      function getPos(e){
        const rect = drawCanvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches[0]) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
        else { clientX = e.clientX; clientY = e.clientY; }
        const x = (clientX - rect.left) * dpr;
        const y = (clientY - rect.top) * dpr;
        return {x, y};
      }

      // Events
      drawCanvas.addEventListener('pointerdown', (e)=>{
        e.preventDefault();
        drawCanvas.setPointerCapture(e.pointerId);
        const {x,y} = getPos(e);
        startDraw(x,y);
      });
      drawCanvas.addEventListener('pointermove', (e)=>{
        if (!drawing) return; const {x,y} = getPos(e); draw(x,y);
      });
      drawCanvas.addEventListener('pointerup', ()=> endDraw());
      drawCanvas.addEventListener('pointercancel', ()=> endDraw());
      drawCanvas.addEventListener('pointerleave', ()=> endDraw());

      // UI bindings
      sizeEl.addEventListener('input', ()=> sizeVal.textContent = sizeEl.value + ' px');
      opacityEl.addEventListener('input', ()=> opacityVal.textContent = Math.round(parseFloat(opacityEl.value)*100)+'%');
      gridEl.addEventListener('change', ()=> gridLayer.style.display = gridEl.checked ? 'block' : 'none');

      bgEl.addEventListener('input', ()=>{ bgColor = bgEl.value; applyBg(); });
      bgClearEl.addEventListener('click', ()=>{ bgColor = null; applyBg(); });

      presetSizeEl.addEventListener('change', ()=>{
        const v = presetSizeEl.value;
        if (v === 'auto') fitToWindow();
        else {
          const [w,h] = v.split('x').map(n=>parseInt(n,10));
          setCanvasSize(w, h);
        }
        applyBg();
      });

      undoEl.addEventListener('click', undo);
      redoEl.addEventListener('click', redo);
      clearEl.addEventListener('click', ()=>{
        pushHistory();
        ctx.clearRect(0,0,drawCanvas.width, drawCanvas.height);
      });

      downloadEl.addEventListener('click', ()=>{
        // composite bg + drawing into a temp canvas for export
        const out = document.createElement('canvas');
        out.width = drawCanvas.width; out.height = drawCanvas.height;
        const octx = out.getContext('2d');
        // background (color or transparent)
        if (bgColor) { octx.fillStyle = bgColor; octx.fillRect(0,0,out.width, out.height); }
        // draw layers
        octx.drawImage(drawCanvas, 0, 0);
        const type = formatEl.value; let quality = parseFloat(qualityEl.value);
        if (type === 'image/png') quality = undefined; // ignored
        const dataURL = out.toDataURL(type, quality);
        const a = document.createElement('a');
        const ext = type.split('/')[1].replace('jpeg','jpg');
        a.download = (filenameEl.value || 'scribble') + '.' + ext;
        a.href = dataURL; a.click();
      });

      // Keyboard shortcuts
      window.addEventListener('keydown', (e)=>{
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); }
        if (e.key.toLowerCase() === 'b') { eraserEl.checked = false; }
        if (e.key.toLowerCase() === 'e') { eraserEl.checked = true; }
        if (e.key === '+') { sizeEl.value = String(Math.min(60, parseInt(sizeEl.value)+1)); sizeEl.dispatchEvent(new Event('input')); }
        if (e.key === '-') { sizeEl.value = String(Math.max(1, parseInt(sizeEl.value)-1)); sizeEl.dispatchEvent(new Event('input')); }
      });

      // HiDPI rendering quality
      function updateDPR(){
        const newDpr = Math.max(1, window.devicePixelRatio || 1);
        if (newDpr !== dpr) { dpr = newDpr; presetSizeEl.value === 'auto' ? fitToWindow() : null; applyBg(); }
      }
      window.addEventListener('resize', ()=>{ if (presetSizeEl.value === 'auto') { fitToWindow(); applyBg(); } });
      window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener('change', updateDPR);

      // Init
      fitToWindow();
      applyBg();
      sizeEl.dispatchEvent(new Event('input'));
      opacityEl.dispatchEvent(new Event('input'));
    })();
