// Project each scene light onto the lettering in the coordinate system of the header.
function lightEngraving(header, scene, cometX, cometPower=0){
  const box=scene.getBoundingClientRect();
  const wing=header.querySelector('.languages').getBoundingClientRect();
  header.style.setProperty('--wing',Math.max(16,wing.left-header.getBoundingClientRect().left-12)+'px');
  for(const glyphs of header.querySelectorAll('.engraved')){
    const rect=glyphs.getBoundingClientRect();
    glyphs.style.setProperty('--bx',box.left+box.width*158/887-rect.left+'px');
    glyphs.style.setProperty('--rx',box.left+box.width*783/887-rect.left+'px');
    glyphs.style.setProperty('--cx',(cometPower>0?box.left+cometX-rect.left:-300)+'px');
  }
}
function prepareEngraving(header){
  if(!header.querySelector('#cut-letter')){
    header.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs>
      <filter id="cut-letter" color-interpolation-filters="sRGB">
        <feOffset in="SourceAlpha" dy="0.65" result="shift"/>
        <feComposite in="SourceAlpha" in2="shift" operator="out" result="lip"/>
        <feFlood flood-color="#0a2130" flood-opacity=".82"/>
        <feComposite in2="lip" operator="in"/>
        <feComposite in2="SourceGraphic" operator="over"/>
      </filter></defs></svg>`);
  }
  for(const link of header.querySelectorAll('a')){
    for(const child of [...link.childNodes]){
      if(child.nodeType===Node.TEXT_NODE && child.textContent.trim()){
        const span=document.createElement('span');
        span.className='engraved';
        child.replaceWith(span);
        span.append(child);
      }else if(child.nodeType===Node.ELEMENT_NODE && !child.hasAttribute('aria-hidden')){
        child.classList.add('engraved');
      }
    }
  }
}
