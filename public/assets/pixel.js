// Meta Pixel do site inteiro. Fonte única do ID: as páginas estáticas carregam este arquivo pelo pagina.js
// e o Next pelo layout (src/components/PixelMeta.tsx, que também conta as trocas de página do app).
// O ID do Pixel é público por natureza: ele aparece no navegador de qualquer visitante.
(function () {
  var PIXEL_ID = "1157956506759143";
  if (window.fbq) return; // já carregado nesta página: não conta a visita duas vezes
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  window.fbq("init", PIXEL_ID);
  window.fbq("track", "PageView");
})();
