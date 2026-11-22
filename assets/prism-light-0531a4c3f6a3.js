// One clock for every optic. Translate the physical entry and exit rays into
// positions on a continuous perimeter, then travel that arc without corner stalls.
function makePrismLight(element){
  const ns='http://www.w3.org/2000/svg';
  const svg=document.createElementNS(ns,'svg');
  svg.setAttribute('class','optic');svg.setAttribute('aria-hidden','true');
  element.append(svg);
  const rim=document.createElementNS(ns,'polygon');
  svg.append(rim);
  const facets=Array.from({length:8},()=>{
    const face=document.createElementNS(ns,'polygon');
    face.setAttribute('class','facet');svg.append(face);return face;
  });
  const cores=['#82ccff','#ff7961','#a8ffe7'].map(color=>{
    const dot=document.createElementNS(ns,'circle');
    dot.style.color=color; dot.setAttribute('r','2');
    svg.append(dot);
    return dot;
  });
  let corners,segments,perimeter,w,h,rect;
  function measure(){
    rect=element.getBoundingClientRect();w=rect.width;h=rect.height;
    const c=8, a=1.5,b=w-a,d=h-a;
    corners=[[a+c,a],[b-c,a],[b,a+c],[b,d-c],[b-c,d],[a+c,d],[a,d-c],[a,a+c]];
    rim.setAttribute('points',corners.join(' '));
    const inner=corners.map(([x,y])=>[2+x*(w-5)/w,1.5+y*(h-5)/h]);
    facets.forEach((face,i)=>{
      const j=(i+1)%8;
      face.setAttribute('points',[corners[i],corners[j],inner[j],inner[i]].join(' '));
    });
    perimeter=0;
    segments=corners.map(([x,y],i)=>{
      const [ex,ey]=corners[(i+1)%8],dx=ex-x,dy=ey-y,len=Math.hypot(dx,dy);
      const start=perimeter;perimeter+=len;
      return {x,y,dx,dy,len,start};
    });
  }
  function exitArc(x,y){
    const vx=rect.left+w/2-x,vy=rect.top+h/2-y;
    for(const s of segments){
      const det=vx*s.dy-vy*s.dx;
      if(det<=0)continue;
      const t=((s.x-w/2)*vy-(s.y-h/2)*vx)/det;
      if(t>=-1e-7 && t<=1.0000001)return s.start+s.len*Math.max(0,Math.min(1,t));
    }
    return 0;
  }
  function paint(index,arc,power){
    const dot=cores[index];
    dot.style.opacity=power;
    if(!power)return;
    const position=(arc%perimeter+perimeter)%perimeter;
    const s=segments.find(s=>position<=s.start+s.len)||segments.at(-1);
    const t=(position-s.start)/s.len;
    dot.setAttribute('cx',s.x+t*s.dx);dot.setAttribute('cy',s.y+t*s.dy);
  }
  let start=0,delta=0;
  function locate(scene){
    measure();
    const sx=f=>scene.left+scene.width*f,sy=f=>scene.top+scene.width*f;
    paint(0,exitArc(sx(158/887),sy(193/887)),1);
    paint(1,exitArc(sx(783/887),sy(103/887)),.25);
    const tangent=Math.tan(Math.PI/30);
    const ray=t=>exitArc(sx(t),sy(.39-t*tangent));
    start=ray(-.1);
    const mid=ray(.5),end=ray(1.1);
    const wrap=d=>(d+perimeter)%perimeter;
    delta=wrap(end-start);
    if(wrap(mid-start)>delta)delta-=perimeter;
  }
  return {locate,fly(t,power){paint(2,start+delta*t,power)}};
}
